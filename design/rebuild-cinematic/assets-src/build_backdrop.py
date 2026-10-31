# Blender 5.2 headless, after build_assets.py: blender -b -P build_backdrop.py -- <assets dir>
# Renders the lit stone behind the lower page and bakes the paper tile used by HTML sections.
import bpy, math, os, sys
import numpy as np

out = sys.argv[sys.argv.index('--') + 1]


def tile_noise(size, slope, seed):
    r = np.random.default_rng(seed)
    f = np.fft.fft2(r.normal(size=(size, size)))
    fx, fy = np.fft.fftfreq(size), np.fft.fftfreq(size)
    k = np.sqrt(fx[None, :] ** 2 + fy[:, None] ** 2)
    k[0, 0] = 1
    n = np.real(np.fft.ifft2(f / k ** slope))
    return (n - n.mean()) / n.std()


scene = bpy.context.scene
scene.view_settings.view_transform = 'Raw'
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 90
scene.render.image_settings.color_mode = 'RGB'

# Paper tile: #f3f0e9 with fibre-scale variation, sRGB values written directly.
drift = tile_noise(1024, 1.5, 21) * .006 + tile_noise(1024, .5, 22) * .009
base = np.array([.953, .941, .914])
paper = np.clip(base[None, None, :] * (1 + drift[..., None]), 0, 1)
rgba = np.dstack([paper[::-1], np.ones((1024, 1024))]).astype(np.float32)
img = bpy.data.images.new('paper-tile', 1024, 1024)
img.colorspace_settings.name = 'Non-Color'
img.pixels.foreach_set(rgba.ravel())
img.save_render(os.path.join(out, 'paper-tile.jpg'))

# Night stone tile: the film's slab colour, darkened, for section backgrounds.
slab = bpy.data.images.load(os.path.join(out, 'slab-color.jpg'))
px = np.array(slab.pixels[:], dtype=np.float32).reshape(1024, 1024, 4)[:, :, :3]
tint = np.array([.145, .16, .205], dtype=np.float32)
night = np.clip(px * tint * 1.25, 0, 1)
rgba = np.dstack([night, np.ones((1024, 1024), dtype=np.float32)])
img = bpy.data.images.new('slab-night', 1024, 1024)
img.colorspace_settings.name = 'Non-Color'
img.pixels.foreach_set(rgba.ravel())
img.save_render(os.path.join(out, 'slab-night.jpg'))

# One warm pool on the same stone, on black, screened over the tile wherever paper sits.
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
bpy.ops.mesh.primitive_plane_add(size=40)
plane = bpy.context.object
mat = bpy.data.materials.new('slab')
mat.use_nodes = True
nt = mat.node_tree
bsdf = nt.nodes['Principled BSDF']
coord, mapping = nt.nodes.new('ShaderNodeTexCoord'), nt.nodes.new('ShaderNodeMapping')
mapping.inputs['Scale'].default_value = (4.6, 4.6, 1)
nt.links.new(coord.outputs['UV'], mapping.inputs['Vector'])


def tex(name, colorspace):
    n = nt.nodes.new('ShaderNodeTexImage')
    n.image = bpy.data.images.load(os.path.join(out, name))
    n.image.colorspace_settings.name = colorspace
    nt.links.new(mapping.outputs['Vector'], n.inputs['Vector'])
    return n


color, normal, rough = tex('slab-color.jpg', 'sRGB'), tex('slab-normal.jpg', 'Non-Color'), tex('slab-rough.jpg', 'Non-Color')
mix = nt.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'
mix.blend_type = 'MULTIPLY'
mix.inputs['Factor'].default_value = 1
mix.inputs['B'].default_value = (.2, .2, .22, 1)
nt.links.new(color.outputs['Color'], mix.inputs['A'])
nt.links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])
nt.links.new(rough.outputs['Color'], bsdf.inputs['Roughness'])
nm = nt.nodes.new('ShaderNodeNormalMap')
nm.inputs['Strength'].default_value = .5
nt.links.new(normal.outputs['Color'], nm.inputs['Color'])
nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
plane.data.materials.append(mat)

light = bpy.data.lights.new('pool', 'SPOT')
light.energy = 1500
light.color = (1, .84, .66)
light.spot_size = math.radians(42)
light.spot_blend = 1
light.shadow_soft_size = 1.4
o = bpy.data.objects.new('pool', light)
o.location = (0, 0, 11)
bpy.context.collection.objects.link(o)

world = bpy.data.worlds.new('none')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0
scene.world = world

cam = bpy.data.cameras.new('cam')
cam.type = 'ORTHO'
cam.ortho_scale = 12
o = bpy.data.objects.new('cam', cam)
o.location = (0, 0, 14)
bpy.context.collection.objects.link(o)
scene.camera = o

scene.render.engine = 'CYCLES'
scene.cycles.samples = 40
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1600, 1000
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 1.5
scene.render.image_settings.quality = 84
scene.render.filepath = os.path.join(out, 'slab-light.jpg')
bpy.ops.render.render(write_still=True)
print('BACKDROP DONE')
