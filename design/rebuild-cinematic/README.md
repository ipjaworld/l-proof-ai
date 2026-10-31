# rebuild-cinematic

L-Proof AI 홈페이지 영상의 소스다. 화면은 Next 앱(`app/page.tsx`, `components/film/`, `app/film.css`)에 있고, `scene.js`를 고치면 저장소 루트에서 `npm run film:build`로 `public/film/`에 빌드한다. 설계 판단은 [TRANSITION-DESIGN.md](TRANSITION-DESIGN.md)를 본다.

Next로 옮기기 전의 정적 시안 파일은 저장소에 포함하지 않는다.

```powershell
# 저장소 루트에서, 서버가 없을 때만
python -m http.server 8768 --bind 127.0.0.1 --directory design

# scene.js 수정 시
node node_modules/esbuild/bin/esbuild design/rebuild-cinematic/scene.js --bundle --format=iife --platform=browser --target=es2020 --minify --outfile=design/rebuild-cinematic/scene.bundle.js

# 모델·재질 재생성 (assets 폴더에 덮어씀)
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup -P design/rebuild-cinematic/assets-src/build_assets.py -- D:\2026_project\l-proof-ai\design\rebuild-cinematic\assets

# 하단 돌 배경과 종이 재질 재생성 (build_assets.py 다음에 실행)
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup -P design/rebuild-cinematic/assets-src/build_backdrop.py -- D:\2026_project\l-proof-ai\design\rebuild-cinematic\assets

# 실제 스크롤 캡처: 출력폴더, 뷰포트, 스크롤 위치(화면 단위). 2000을 더하면 충격 순간 연속 촬영
node design/rebuild-cinematic/assets-src/capture.cjs <출력폴더> 1280x720 0,3.6,6.8,2011.6

# 역스크롤, 모션 감소, WebGL 실패, 폼 동작 검사
node design/rebuild-cinematic/assets-src/verify.cjs <출력폴더>
```

## 품질 단계

기기 메모리나 CPU 코어가 4 이하면 저사양 단계(종이 2,400장, 심도 없음)로 시작한다. 실행 중 프레임이 느리면 종이 수와 해상도를 최대 세 번 낮춘다. `?q=low`와 `?q=high`로 단계를 강제할 수 있다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `scene.js` | 전체 3D 장면과 스크롤 시간표. `KEYS`가 카메라 경로다 |
| `scene.bundle.js` | 브라우저가 실행하는 번들 |
| `assets/` | Blender로 생성한 도장 메시, 나뭇결, 종이·바닥 재질 (약 2.4MB) |
| `assets-src/` | 자산 생성 스크립트와 검증 스크립트 |
| `captures/` | 전환 구간 축소판과 대표 프레임 |

`../rebuild-scroll/vendor/`의 Three.js, `../rebuild-hero/`의 폰트, `../rebuild-hero-b/`의 대체 이미지에 의존한다.

## 시간표

스크롤 위치는 화면 높이 단위이며 전체 15화면이다.

| 구간 | 장면 |
| --- | --- |
| 0–1 | 폭풍. 스크롤 전에도 움직인다 |
| 1–4.7 | 낙하. 종이가 사라지고, L-Proof만 인쇄된 용지 한 장이 작게 흔들리며 착지한다 |
| 3.95–5.3 | 착지하는 동안 제목과 본문이 잉크처럼 차례로 써진다 |
| 5–7 | 재단. 줄이 그어지고 띠로 잘려 날아간다 |
| 7.1–7.75 | 해석 카드가 놓인다 |
| 8.5–10.75 | 검수. 빛이 훑고 붉은 교정 부호가 그려진다 |
| 10.1–12.3 | 승인. 11.55를 넘으면 실제 시간으로 찍히고, 뒤로 돌아가면 복귀한다 |
| 12.5–14.3 | 전달. 인영 안으로 들어가 화면이 종이가 된다 |

영상 뒤로는 종이 지면(안내) → 돌 바닥 위의 발행물 두 장 → 구독 종이 → 푸터가 이어진다. 영상과 같은 돌, 같은 빛, 같은 붉은 잉크를 쓴다.

## 사실 표기

제목, 발췌문, 해석 문구는 12호와 11호 원고에 있는 문장이다. 나머지 본문은 회색 띠다. “승인 ≠ 사람의 확인”과 교정 부호는 연출용이며 실제 편집 기록이 아니다. 도장의 날짜와 “발행 승인”도 제작 흐름의 표현이다.
