# Blender 5.2 headless: blender -b -P build_assets.py -- <output dir>
# Builds the stamp mesh (wood, brass, rubber) and the tiling paper / slab maps.
import bpy, bmesh, math, os, struct, sys
import numpy as np

out = sys.argv[sys.argv.index('--') + 1]
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(12)


def tile_noise(size, slope, seed):
    r = np.random.default_rng(seed)
    f = np.fft.fft2(r.normal(size=(size, size)))
    fx, fy = np.fft.fftfreq(size), np.fft.fftfreq(size)
    k = np.sqrt(fx[None, :] ** 2 + fy[:, None] ** 2)
    k[0, 0] = 1
    n = np.real(np.fft.ifft2(f / k ** slope))
    return (n - n.mean()) / n.std()


def fibers(size, count, seed):
    r = np.random.default_rng(seed)
    h = np.zeros((size, size))
    for _ in range(count):
        x, y = r.random(2) * size
        a = r.random() * math.pi
        bend = r.normal() * .03
        length = r.integers(30, 110)
        for s in range(length):
            a += bend
            x += math.cos(a)
            y += math.sin(a)
            h[int(y) % size, int(x) % size] += 1
    f = np.fft.fft2(h)
    fx, fy = np.fft.fftfreq(size), np.fft.fftfreq(size)
    k2 = fx[None, :] ** 2 + fy[:, None] ** 2
    h = np.real(np.fft.ifft2(f * np.exp(-k2 * 900)))
    return (h - h.mean()) / h.std()


def normal_from_height(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return n * .5 + .5


def save_rgb(name, data, quality=88):
    h, w = data.shape[:2]
    if data.ndim == 2:
        data = np.dstack([data] * 3)
    rgba = np.dstack([np.clip(data[::-1], 0, 1), np.ones((h, w))]).astype(np.float32)
    img = bpy.data.images.new(name, w, h, float_buffer=False)
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(rgba.ravel())
    s = bpy.context.scene.render.image_settings
    s.file_format, s.quality, s.color_mode = 'JPEG', quality, 'RGB'
    bpy.context.scene.view_settings.view_transform = 'Raw'
    img.save_render(os.path.join(out, name + '.jpg'))
    bpy.data.images.remove(img)


# Paper: fibres plus soft cockling.
paper_h = fibers(1024, 16000, 1) * .55 + tile_noise(1024, 1.6, 2) * .5 + tile_noise(1024, .55, 3) * .16
save_rgb('paper-normal', normal_from_height(paper_h, .34))
save_rgb('paper-rough', .84 + paper_h * .035)

# Slab: dark honed stone with slow tonal drift and fine pitting.
drift = tile_noise(1024, 1.9, 4)
pits = tile_noise(1024, .35, 5)
scratches = fibers(1024, 1800, 6)
slab_h = drift * .16 + pits * .1 - np.clip(pits - 1.9, 0, 3) * .9 + scratches * .08
save_rgb('slab-normal', normal_from_height(slab_h, .55))
tone = .5 + drift * .11 + pits * .035 - np.clip(pits - 1.9, 0, 3) * .15
save_rgb('slab-color', np.dstack([tone * .95, tone, tone * 1.09]))
save_rgb('slab-rough', .46 + drift * .08 + pits * .05)

# Stamp geometry. Z is up in Blender; the die face sits at z=0.
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)


def lathe(name, profile, segments=72):
    m = bpy.data.meshes.new(name)
    b = bmesh.new()
    verts = [b.verts.new((r, 0, z)) for r, z in profile]
    edges = [b.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(b, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), dvec=(0, 0, 0),
                   angle=math.tau, steps=segments, use_merge=True, use_duplicate=False)
    bmesh.ops.remove_doubles(b, verts=b.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(b, faces=b.faces)
    b.to_mesh(m)
    b.free()
    o = bpy.data.objects.new(name, m)
    bpy.context.collection.objects.link(o)
    for p in m.polygons:
        p.use_smooth = True
    return o


def block(name, size, z, bevel, segments=5):
    m = bpy.data.meshes.new(name)
    b = bmesh.new()
    bmesh.ops.create_cube(b, size=1)
    bmesh.ops.scale(b, vec=size, verts=b.verts)
    bmesh.ops.translate(b, vec=(0, 0, z + size[2] / 2), verts=b.verts)
    bmesh.ops.bevel(b, geom=list(b.edges), offset=bevel, segments=segments, profile=.5, affect='EDGES')
    b.to_mesh(m)
    b.free()
    o = bpy.data.objects.new(name, m)
    bpy.context.collection.objects.link(o)
    for p in m.polygons:
        p.use_smooth = True
    return o


rubber = block('rubber', (1.86, 1.2, .05), 0, .012, 2)
mount = block('mount', (1.96, 1.3, .3), .05, .045)
smooth = lambda pts, n=4: [
    ((1 - t) ** 2 * a[0] + 2 * t * (1 - t) * b[0] + t * t * c[0], (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * b[1] + t * t * c[1])
    for a, b, c in zip(pts[0::2], pts[1::2], pts[2::2]) for t in [i / n for i in range(n)]
] + [pts[-1]]
# Quadratic spans: (start, control, end, control, end ...).
handle = lathe('handle', [(0.2, .53)] + smooth([
    (.2, .53), (.3, .58), (.27, .68), (.2, .84), (.2, .98), (.2, 1.1), (.31, 1.26),
    (.42, 1.42), (.34, 1.6), (.2, 1.73), (0.001, 1.74)]))
collar = lathe('collar', [(.42, .35), (.43, .355), (.43, .39), (.33, .41), (.285, .45), (.285, .5), (.27, .505), (.27, .54), (.2, .545)], 72)

# Procedural walnut baked to a shared UV layout for mount + handle.
wood = bpy.data.materials.new('wood')
wood.use_nodes = True
nt = wood.node_tree
principled = nt.nodes['Principled BSDF']
coord, mapping, wave, noise, ramp, grain, rough = (nt.nodes.new(t) for t in (
    'ShaderNodeTexCoord', 'ShaderNodeMapping', 'ShaderNodeTexWave', 'ShaderNodeTexNoise',
    'ShaderNodeValToRGB', 'ShaderNodeTexNoise', 'ShaderNodeMapRange'))
mapping.inputs['Scale'].default_value = (1.3, 1.3, .26)
wave.wave_type, wave.bands_direction = 'RINGS', 'Z'
wave.inputs['Scale'].default_value = 2.1
wave.inputs['Distortion'].default_value = 3.2
wave.inputs['Detail'].default_value = 5
noise.inputs['Scale'].default_value = 2.4
grain.inputs['Scale'].default_value = 70
grain.inputs['Detail'].default_value = 6
ramp.color_ramp.elements[0].color = (.03, .014, .008, 1)
ramp.color_ramp.elements[1].color = (.085, .04, .021, 1)
ramp.color_ramp.elements.new(.55).color = (.05, .023, .012, 1)
mix = nt.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'
mix.blend_type = 'MULTIPLY'
mix.inputs['Factor'].default_value = .35
nt.links.new(coord.outputs['Object'], mapping.inputs['Vector'])
nt.links.new(mapping.outputs['Vector'], wave.inputs['Vector'])
nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], mix.inputs['A'])
nt.links.new(grain.outputs['Fac'], mix.inputs['B'])
nt.links.new(mapping.outputs['Vector'], grain.inputs['Vector'])
nt.links.new(mix.outputs['Result'], principled.inputs['Base Color'])
rough.inputs['From Min'].default_value, rough.inputs['From Max'].default_value = .3, .7
rough.inputs['To Min'].default_value, rough.inputs['To Max'].default_value = .24, .5
nt.links.new(grain.outputs['Fac'], rough.inputs['Value'])
nt.links.new(rough.outputs['Result'], principled.inputs['Roughness'])

bpy.context.view_layer.objects.active = mount
for o in (mount, handle):
    o.select_set(True)
    o.data.materials.append(wood)
bpy.ops.object.join()
wooden = bpy.context.view_layer.objects.active
wooden.name = 'wood'
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(58), island_margin=.012)
bpy.ops.object.mode_set(mode='OBJECT')

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 6
for kind, name, passes in (('DIFFUSE', 'wood-color', {'COLOR'}), ('ROUGHNESS', 'wood-rough', None)):
    image = bpy.data.images.new(name, 1024, 1024, alpha=False, float_buffer=True)
    image.colorspace_settings.name = 'Non-Color'
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = image
    nt.nodes.active = tex
    args = dict(type=kind, margin=8)
    if passes:
        args['pass_filter'] = passes
    bpy.ops.object.bake(**args)
    px = np.array(image.pixels[:], dtype=np.float32).reshape(1024, 1024, 4)[::-1, :, :3]
    if kind == 'DIFFUSE':
        px = np.where(px <= .0031308, px * 12.92, 1.055 * np.power(np.clip(px, 1e-6, 1), 1 / 2.4) - .055)
    save_rgb(name, px, 92)
    nt.nodes.remove(tex)
    bpy.data.images.remove(image)


def export(obj):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh = obj.evaluated_get(depsgraph).to_mesh()
    mesh.calc_loop_triangles()
    uv = mesh.uv_layers.active.data if mesh.uv_layers else None
    normals = mesh.corner_normals
    tris = mesh.loop_triangles
    p, n, t = [], [], []
    for tri in tris:
        for loop in tri.loops:
            l = mesh.loops[loop]
            co = mesh.vertices[l.vertex_index].co
            no = normals[loop].vector
            # Blender Z-up to three.js Y-up: die face points to -Y.
            p += [co.x, co.z, -co.y]
            n += [no.x, no.z, -no.y]
            t += list(uv[loop].uv) if uv else [0, 0]
    return np.array(p, np.float32), np.array(n, np.float32), np.array(t, np.float32)


parts = [('wood', wooden), ('collar', collar), ('rubber', rubber)]
header, blobs = {}, []
offset = 0
for name, obj in parts:
    arrays = export(obj)
    count = arrays[0].size // 3
    header[name] = [offset, count]
    for a in arrays:
        blobs.append(a.tobytes())
        offset += a.nbytes
with open(os.path.join(out, 'stamp.bin'), 'wb') as f:
    f.write(b''.join(blobs))
import json
with open(os.path.join(out, 'stamp.json'), 'w') as f:
    json.dump(header, f)
print('ASSETS', header, offset)
