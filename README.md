# 합성곱(Convolution) 필터 시뮬레이터

해상도(8×8 ~ 64×64)를 변경하고 5종 컨볼루션 필터(Blur, Sharpen, Edge, Sobel X/Y)를 적용해보는 교육용 인터랙티브 시뮬레이터입니다.

## 기능

- 🍌 **바나나 픽셀 아트**: 곡선(distance field) 기반 생성으로 모든 해상도에서 자연스러운 바나나
- 🔍 **5종 필터**: Blur, Sharpen, Edge Detection, Sobel X, Sobel Y
- 🎨 **RGB 채널 분리**: R, G, B 각 채널에 필터가 독립적으로 적용되는 과정을 시각화
- 📐 **4단계 해상도**: 8×8, 16×16, 32×32, 64×64
- 🖱️ **픽셀 클릭**: 특정 픽셀의 3×3 내적 계산 과정을 상세히 표시

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```
