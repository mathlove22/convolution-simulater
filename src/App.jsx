import React, { useState, useMemo } from 'react';
import {
  Layers, MousePointer2, ArrowRight, Maximize, Wand2, Cpu,
  Aperture, Sparkles, ScanLine, MoveHorizontal, MoveVertical,
  Home, Apple, Heart, Banana
} from 'lucide-react';

// ─── 색상 팔레트: 각 픽셀은 [R, G, B] ───
const BG = [241, 245, 249]; // slate-100 (배경)
const YL = [255, 215,   0]; // 노랑 (바나나 본체)
const BR = [139,  69,  19]; // 갈색 (끝/줄기)
const GR = [ 34, 197,  94]; // 초록 (잎파리)
const DY = [202, 138,   4]; // 어두운 노랑 (명암)

// ─── 집: 수직선(벽) + 수평선(지붕, 창문)이 명확 → Sobel X/Y 대비 좋음 ───
function generateHouse(size) {
  const img = Array.from({ length: size }, () => Array(size).fill(BG));
  const m = Math.max(1, Math.floor(size * 0.08));
  const wallTop = Math.floor(size * 0.45);
  const wallBot = size - m - 1;
  const wallL = m + 1;
  const wallR = size - m - 2;
  const roofPeak = m;
  const roofL = m;
  const roofR = size - m - 1;

  // 색상
  const WALL = [220, 180, 120]; // 벽돌색
  const ROOF = [200,  50,  50]; // 빨간 지붕
  const DOOR = [120,  70,  30]; // 갈색 문
  const WIND = [100, 180, 220]; // 파란 창문
  const DARK = [160,  30,  30]; // 어두운 빨강(명암)

  // 1. 지붕 (삼각형)
  for (let r = roofPeak; r < wallTop; r++) {
    const t = (r - roofPeak) / (wallTop - roofPeak);
    const halfW = (t * (roofR - roofL)) / 2;
    const cx = (roofL + roofR) / 2;
    for (let c = 0; c < size; c++) {
      if (c >= cx - halfW && c <= cx + halfW) {
        const edgeDist = Math.min(c - (cx - halfW), (cx + halfW) - c);
        img[r][c] = edgeDist < 1.5 ? DARK : ROOF;
      }
    }
  }

  // 2. 벽
  for (let r = wallTop; r <= wallBot; r++) {
    for (let c = wallL; c <= wallR; c++) {
      img[r][c] = WALL;
    }
  }

  // 3. 문 (벽 중앙 하단)
  const doorW = Math.max(2, Math.floor(size * 0.14));
  const doorH = Math.max(3, Math.floor(size * 0.28));
  const doorC = Math.floor((wallL + wallR) / 2);
  for (let r = wallBot - doorH + 1; r <= wallBot; r++) {
    for (let c = doorC - Math.floor(doorW/2); c <= doorC + Math.floor(doorW/2); c++) {
      if (r >= 0 && r < size && c >= 0 && c < size) img[r][c] = DOOR;
    }
  }
  // 문 손잡이
  if (doorC + Math.floor(doorW/2) - 1 < size && wallBot - 1 >= 0) {
    img[wallBot - Math.floor(doorH/2)][doorC + Math.floor(doorW/2) - 1] = [60, 30, 10];
  }

  // 4. 창문 좌 (파란색)
  const winSize = Math.max(2, Math.floor(size * 0.12));
  const winY = wallTop + Math.max(1, Math.floor(size * 0.08));
  const winLX = wallL + Math.max(1, Math.floor((doorC - wallL) / 2)) - Math.floor(winSize/2);
  for (let r = winY; r < winY + winSize && r < size; r++) {
    for (let c = winLX; c < winLX + winSize && c < size; c++) {
      if (r >= 0 && c >= 0) img[r][c] = WIND;
    }
  }
  // 창문 우
  const winRX = doorC + Math.max(1, Math.floor((wallR - doorC) / 2)) - Math.floor(winSize/2);
  for (let r = winY; r < winY + winSize && r < size; r++) {
    for (let c = winRX; c < winRX + winSize && c < size; c++) {
      if (r >= 0 && c >= 0) img[r][c] = WIND;
    }
  }

  // 5. 굴뚝
  const chimX = Math.floor((roofL + roofR) / 2) + Math.floor((roofR - roofL) / 4);
  const chimW = Math.max(1, Math.floor(size * 0.06));
  for (let r = roofPeak + 1; r < wallTop; r++) {
    for (let c = chimX; c < chimX + chimW && c < size; c++) {
      if (r >= 0 && c >= 0) img[r][c] = BR;
    }
  }

  return img;
}

// ─── 사과: 둥근 형태 + 줄기 + 잎 → 곡선 + 수직/수평 대비 ───
function generateApple(size) {
  const img = Array.from({ length: size }, () => Array(size).fill(BG));
  const cx = size / 2 - 0.5;
  const cy = size / 2 + size * 0.05;
  const rx = size * 0.32;
  const ry = size * 0.34;
  const RED = [230, 50, 50];
  const DARK_RED = [180, 30, 30];
  const LIGHT_RED = [255, 100, 80];
  const STEM = [100, 60, 20];
  const LEAF = [40, 180, 70];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const dx = (j - cx) / rx;
      const dy = (i - cy) / ry;
      const d = dx * dx + dy * dy;
      if (d <= 1.0) {
        // 명암: 오른쪽 위는 밝게, 왼쪽 아래는 어둡게
        const light = (j - cx) * 0.5 + (i - cy) * (-0.5);
        if (light > rx * 0.4) img[i][j] = LIGHT_RED;
        else if (d > 0.75) img[i][j] = DARK_RED;
        else img[i][j] = RED;
      }
    }
  }
  // 줄기 (위쪽 중앙)
  const stemX = Math.round(cx);
  const stemTop = Math.max(0, Math.round(cy - ry - size * 0.08));
  const stemBot = Math.round(cy - ry + 1);
  for (let r = stemTop; r <= stemBot && r < size; r++) {
    if (r >= 0 && stemX >= 0 && stemX < size) img[r][stemX] = STEM;
    if (r >= 0 && stemX - 1 >= 0) img[r][stemX - 1] = STEM;
  }
  // 잎 (줄기 오른쪽)
  const leafR = Math.round(cy - ry + size * 0.01);
  const leafC = stemX + 1;
  for (let di = 0; di < 2; di++) {
    for (let dj = 0; dj < 3; dj++) {
      const ni = leafR + di, nj = leafC + dj;
      if (ni >= 0 && ni < size && nj >= 0 && nj < size) img[ni][nj] = LEAF;
    }
  }
  return img;
}

// ─── 하트: 좌우 대칭 곡선 → Sobel X(좌우 경계) 특히 잘 보임 ───
function generateHeart(size) {
  const img = Array.from({ length: size }, () => Array(size).fill(BG));
  const cx = size / 2 - 0.5;
  const cy = size / 2 - size * 0.05;
  const scale = size * 0.30;
  const PINK = [240, 80, 130];
  const DARK_PINK = [200, 50, 100];
  const LIGHT_PINK = [255, 150, 180];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // 하트 방정식 (정규화된 좌표)
      const x = (j - cx) / scale;
      const y = (i - cy) / scale;
      // 하트 곡선: 위쪽이 둥글고 아래가 뾰족
      const x2 = x * x;
      const y2 = y * y;
      const expr = (x2 + y2 - 1);
      const heartVal = expr * expr * expr - x2 * y2 * y;
      if (heartVal <= 0) {
        // 명암
        const light = x * 0.5 - y * 0.5;
        if (light > 0.4) img[i][j] = LIGHT_PINK;
        else if (heartVal < -0.3) img[i][j] = DARK_PINK;
        else img[i][j] = PINK;
      }
    }
  }
  return img;
}

// ─── 바나나를 곡선(distance field)으로 생성 ───
function generateBanana(size) {
  const img = Array.from({ length: size }, () => Array(size).fill(BG));
  const m = Math.max(1, Math.floor(size * 0.12));

  const pts = [];
  const N = Math.max(80, size * 6);
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const r = m + t * (size - 2 * m);
    const c = (size - m) - t * (size - 2 * m) + Math.sin(t * Math.PI) * size * 0.20;
    pts.push([r, c]);
  }

  const thick = Math.max(1.2, size * 0.11);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let md = Infinity;
      for (let k = 0; k < pts.length; k++) {
        const d = Math.hypot(i - pts[k][0], j - pts[k][1]);
        if (d < md) md = d;
      }
      if (md <= thick) {
        const ratio = md / thick;
        img[i][j] = ratio > 0.72 ? DY : YL;
      }
    }
  }

  // 위쪽 끝: 줄기(갈색)
  const [sr, sc] = pts[0];
  const sR = Math.round(sr), sC = Math.round(sc);
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 2; dj++) {
      const ni = sR + di, nj = sC + dj;
      if (ni >= 0 && ni < size && nj >= 0 && nj < size && Math.hypot(di, dj - 0.5) <= 1.2) {
        img[ni][nj] = BR;
      }
    }
  }
  // 잎파리(초록) - 줄기 윗부분
  for (let di = -2; di <= 0; di++) {
    for (let dj = 0; dj <= 2; dj++) {
      const ni = sR + di - 1, nj = sC + dj + 1;
      if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
        if (di <= -1 || dj >= 1) img[ni][nj] = GR;
      }
    }
  }
  // 아래쪽 끝: 갈색
  const [er, ec] = pts[pts.length - 1];
  const eR = Math.round(er), eC = Math.round(ec);
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      const ni = eR + di, nj = eC + dj;
      if (ni >= 0 && ni < size && nj >= 0 && nj < size && Math.hypot(di, dj) <= 1) {
        img[ni][nj] = BR;
      }
    }
  }
  return img;
}

// ─── 이미지 생성 함수 매핑 ───
const IMAGES = [
  { id: 'house',  name: '집',    icon: Home,   fn: generateHouse,  hint: '수직선(벽·문)과 수평선(지붕·창문)이 뚜렷 → Sobel X/Y 대비 최고!' },
  { id: 'apple',  name: '사과',  icon: Apple,  fn: generateApple,  hint: '둥근 곡선 + 줄기 → 윤곽선과 방향별 필터가 곡면을 따라가는 모습 확인' },
  { id: 'heart',  name: '하트',  icon: Heart,  fn: generateHeart,  hint: '좌우 대칭 곡선 → Sobel X가 좌·우 경계를 강하게 잡아냄' },
  { id: 'banana', name: '바나나', icon: Banana, fn: generateBanana, hint: '대각선 곡선 → 모든 방향의 경계가 골고루 나타남' },
];

// ─── 필터 정의 ───
const FILTERS = [
  {
    id: 'blur', name: '흐림 (Blur)', icon: Aperture, factor: 1 / 9, factorText: '× 1/9',
    kernel: [[1,1,1],[1,1,1],[1,1,1]],
    explanation: '주변 9픽셀의 평균. 색이 섞여 수채화처럼 번집니다. 해상도가 높을수록 부드러운 결과가 나옵니다.'
  },
  {
    id: 'sharpen', name: '선명하게 (Sharpen)', icon: Sparkles, factor: 1, factorText: '',
    kernel: [[0,-1,0],[-1,5,-1],[0,-1,0]],
    explanation: '내 색은 5배로 키우고 주변을 뺍니다. 노랑과 배경의 경계가 또렷해집니다.'
  },
  {
    id: 'edge', name: '윤곽선 (Edge)', icon: ScanLine, factor: 1, factorText: '',
    kernel: [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]],
    explanation: '색 변화가 없는 곳은 0(검정), 급격히 변하는 외곽선만 살아남습니다. 해상도↑ → 윤곽선이 가늘고 정교해집니다.'
  },
  {
    id: 'sobelX', name: '세로선 (Sobel X)', icon: MoveHorizontal, factor: 1, factorText: '',
    kernel: [[-1,0,1],[-2,0,2],[-1,0,1]],
    explanation: '좌우 색 차이를 계산. 세로 방향 경계(벽의 좌·우, 문 양옆)에서 강하게 반응합니다. 집 이미지로 확인해보세요!'
  },
  {
    id: 'sobelY', name: '가로선 (Sobel Y)', icon: MoveVertical, factor: 1, factorText: '',
    kernel: [[-1,-2,-1],[0,0,0],[1,2,1]],
    explanation: '위아래 색 차이를 계산. 가로 방향 경계(지붕 선, 창문 위·아래)에서 강하게 반응합니다. 집 이미지로 확인해보세요!'
  }
];

const SIZES = [8, 16, 32, 64];

export default function App() {
  const [imageId, setImageId] = useState('house');
  const [size, setSize] = useState(32);
  const [selectedFilterId, setSelectedFilterId] = useState('sobelX');
  const [viewMode, setViewMode] = useState('combined');

  const imageDef = IMAGES.find(i => i.id === imageId);
  const generateFn = imageDef.fn;
  const currentImage = useMemo(() => generateFn(size), [generateFn, size]);
  const filter = FILTERS.find(f => f.id === selectedFilterId);
  const { kernel, factor, factorText } = filter;

  const [activeRow, setActiveRow] = useState(Math.floor(size / 2));
  const [activeCol, setActiveCol] = useState(Math.floor(size / 2));

  useMemo(() => {
    setActiveRow(Math.floor(size / 2));
    setActiveCol(Math.floor(size / 2));
  }, [size, imageId]);

  const outputImage = useMemo(() => {
    const out = Array.from({ length: size }, () => Array(size).fill([0, 0, 0]));
    const clamp = (v) => Math.min(255, Math.max(0, Math.abs(v * factor)));
    for (let r = 1; r < size - 1; r++) {
      for (let c = 1; c < size - 1; c++) {
        let sR = 0, sG = 0, sB = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const p = currentImage[r + i][c + j];
            const k = kernel[i + 1][j + 1];
            sR += p[0] * k; sG += p[1] * k; sB += p[2] * k;
          }
        }
        out[r][c] = [clamp(sR), clamp(sG), clamp(sB)];
      }
    }
    return out;
  }, [selectedFilterId, size, currentImage, kernel, factor]);

  const getRgbString = (px, mode = 'combined') => {
    if (!px) return 'rgb(0,0,0)';
    const [r, g, b] = px;
    if (mode === 'r') return `rgb(${r},0,0)`;
    if (mode === 'g') return `rgb(0,${g},0)`;
    if (mode === 'b') return `rgb(0,0,${b})`;
    return `rgb(${r},${g},${b})`;
  };

  const calcStep = (ch) => {
    if (activeRow < 1 || activeRow >= size - 1 || activeCol < 1 || activeCol >= size - 1) {
      return { steps: [], sum: 0, finalVal: 0 };
    }
    const steps = [];
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      const row = [];
      for (let j = -1; j <= 1; j++) {
        const pVal = currentImage[activeRow + i][activeCol + j][ch];
        const kVal = kernel[i + 1][j + 1];
        const mult = pVal * kVal;
        sum += mult;
        row.push({ pVal, kVal, mult });
      }
      steps.push(row);
    }
    return { steps, sum, finalVal: sum * factor };
  };
  const mathR = calcStep(0);
  const mathG = calcStep(1);
  const mathB = calcStep(2);

  const pixelStyle = (size === 8)  ? 'w-7 h-7 sm:w-9 sm:h-9'
                   : (size === 16) ? 'w-4 h-4 sm:w-5 sm:h-5'
                   : (size === 32) ? 'w-2.5 h-2.5 sm:w-3 sm:h-3'
                   :                'w-1.5 h-1.5 sm:w-[5px] sm:h-[5px]';
  const gapClass = (size === 8)  ? 'gap-1'
                 : (size === 16) ? 'gap-[1px] md:gap-[2px]'
                 : (size === 32) ? 'gap-0 md:gap-[1px]'
                 :                'gap-0';

  const renderChannel = (label, data, colorCls, ringCls, isActive) => (
    <div className={`p-2.5 rounded-lg border transition-opacity ${ringCls} ${isActive ? 'opacity-100' : 'opacity-30'}`}>
      <div className="flex justify-between text-[11px] font-bold mb-1.5">
        <span className={colorCls}>{label} 채널</span>
        <span className="font-mono text-neutral-400">Σ = {data.sum}{factorText ? ` ${factorText}` : ''}</span>
      </div>
      <div className="grid grid-cols-3 gap-[2px] mb-1.5">
        {data.steps.length > 0 && data.steps.map((row, i) =>
          row.map((cell, j) => (
            <div key={`${i}-${j}`} className="bg-black/40 rounded px-1 py-0.5 text-[9px] font-mono text-neutral-300 text-center leading-tight">
              {cell.pVal}×{cell.kVal}
              <div className="text-neutral-500 text-[8px]">={cell.mult}</div>
            </div>
          ))
        )}
        {data.steps.length === 0 && (
          <div className="col-span-3 text-center text-[10px] text-neutral-500 py-2">테두리 픽셀 (계산 불가)</div>
        )}
      </div>
      <div className="text-[10px] font-mono text-neutral-300">
        결과: <span className={colorCls}>|{data.sum} × {factorText || '1'}| = {Math.abs(data.finalVal).toFixed(0)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 p-3 sm:p-5 font-sans text-neutral-800">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ─── 헤더 ─── */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 p-5 sm:p-6 rounded-2xl shadow-lg text-white">
          <h1 className="text-lg sm:text-2xl font-extrabold mb-2 flex items-center gap-2">
            <Layers /> 합성곱(Convolution) 필터 시뮬레이터
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            해상도를 8 → 64로 올려가며 필터가 어떻게 더 정교한 선을 찾아내는지 확인해 보세요.
            R, G, B 각 채널에 같은 커널을 독립적으로 적용한 뒤 합쳐서 새 컬러 픽셀을 만듭니다.
            <br className="hidden sm:block"/>
            <span className="text-white/70">원본 픽셀을 클릭하면 그 위치의 3×3 내적 계산 과정을 볼 수 있어요. 집 그림으로 Sobel X/Y를 비교해 보세요!</span>
          </p>
        </div>

        {/* ─── 컨트롤 패널 ─── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* 이미지 선택 (새로 추가) */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-3">
            <h3 className="font-bold text-sm mb-2 text-neutral-600 flex items-center gap-1.5">
              <Layers size={16} className="text-amber-500" /> 0. 이미지 선택
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {IMAGES.map(img => {
                const Icon = img.icon;
                return (
                  <button key={img.id} onClick={() => setImageId(img.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                      imageId === img.id
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md scale-105'
                        : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}>
                    <Icon size={20} />
                    {img.name}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-600 mt-2 bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 rounded-lg border border-amber-100 leading-relaxed">
              💡 {imageDef.hint}
            </p>
          </div>

          {/* 해상도 */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-sm mb-2 text-neutral-600 flex items-center gap-1.5">
              <Maximize size={16} className="text-indigo-500" /> 1. 해상도
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    size === s
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}>
                  {s}²
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
              해상도가 높아질수록 이미지가 정교해지고, AI가 잡아내는 엣지도 가늘고 선명해집니다.
            </p>
          </div>

          {/* 필터 */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-sm mb-2 text-neutral-600 flex items-center gap-1.5">
              <Wand2 size={16} className="text-rose-500" /> 2. 필터 (Kernel)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {FILTERS.map(f => {
                const FilterIcon = f.icon;
                return (
                  <button key={f.id} onClick={() => setSelectedFilterId(f.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      selectedFilterId === f.id
                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md scale-105'
                        : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}>
                    <FilterIcon size={14} />
                    {f.name}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-600 mt-2 bg-gradient-to-r from-rose-50 to-purple-50 p-2.5 rounded-lg border border-rose-100 leading-relaxed">
              {filter.explanation}
            </p>
          </div>

          {/* 채널 모드 */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-3">
            <h3 className="font-bold text-sm mb-2 text-neutral-600 flex items-center gap-1.5">
              <Cpu size={16} className="text-purple-500" /> 3. 채널 보기 모드
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'combined', label: '합성 (RGB)', cls: 'bg-neutral-800 text-white' },
                { id: 'r', label: 'R 채널', cls: 'bg-red-500 text-white' },
                { id: 'g', label: 'G 채널', cls: 'bg-green-500 text-white' },
                { id: 'b', label: 'B 채널', cls: 'bg-blue-500 text-white' },
              ].map(m => (
                <button key={m.id} onClick={() => setViewMode(m.id)}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === m.id ? `${m.cls} shadow-md scale-105` : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 메인 시뮬레이션 ─── */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">

          {/* 입력 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 shrink-0 overflow-x-auto max-w-full">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5 justify-center text-neutral-700">
              <MousePointer2 size={14} className="text-indigo-500" /> 원본 — {imageDef.name} ({size}×{size})
            </h3>
            <div className={`grid ${gapClass} bg-neutral-200 p-1.5 rounded-lg mx-auto w-max`}
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {currentImage.map((row, rIdx) => row.map((pixel, cIdx) => {
                const isEdge = rIdx === 0 || rIdx === size - 1 || cIdx === 0 || cIdx === size - 1;
                const isHighlight = Math.abs(rIdx - activeRow) <= 1 && Math.abs(cIdx - activeCol) <= 1 && !isEdge;
                const isCenter = rIdx === activeRow && cIdx === activeCol;
                return (
                  <div key={`in-${rIdx}-${cIdx}`}
                    onClick={() => { if (!isEdge) { setActiveRow(rIdx); setActiveCol(cIdx); } }}
                    className={`${pixelStyle} rounded-[2px] transition-all ${
                      isEdge ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                    } ${isHighlight ? 'ring-2 ring-rose-400 z-10' : ''} ${
                      isCenter ? 'ring-2 ring-rose-600 z-20 scale-150 shadow-lg' : ''
                    }`}
                    style={{ backgroundColor: getRgbString(pixel, viewMode) }} />
                );
              }))}
            </div>
          </div>

          <ArrowRight className="text-neutral-400 hidden lg:block shrink-0" size={28} />

          {/* 계산 패널 */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-neutral-200 p-4 rounded-2xl shadow-lg w-full max-w-sm shrink-0">
            <h4 className="font-bold text-sm mb-2 text-center text-white flex items-center justify-center gap-1.5">
              <Cpu size={14} className="text-purple-400" /> 필터 내적 계산 (RGB 독립)
            </h4>
            <p className="text-[10px] text-center text-neutral-400 mb-3">
              중앙 픽셀 [{activeRow}, {activeCol}] 의 3×3 연산
            </p>
            <div className="flex justify-center mb-3">
              <div className="grid grid-cols-3 gap-1 bg-slate-700 p-1.5 rounded-lg">
                {kernel.map((row, i) => row.map((val, j) => (
                  <div key={`k-${i}-${j}`}
                    className="w-8 h-8 flex items-center justify-center bg-slate-600 font-mono text-xs font-bold rounded text-white">
                    {val}
                  </div>
                )))}
              </div>
            </div>
            <div className="space-y-2">
              {renderChannel('R', mathR, 'text-red-400', 'bg-red-950/40 border-red-900/60', viewMode === 'combined' || viewMode === 'r')}
              {renderChannel('G', mathG, 'text-green-400', 'bg-green-950/40 border-green-900/60', viewMode === 'combined' || viewMode === 'g')}
              {renderChannel('B', mathB, 'text-blue-400', 'bg-blue-950/40 border-blue-900/60', viewMode === 'combined' || viewMode === 'b')}
            </div>
          </div>

          <ArrowRight className="text-neutral-400 hidden lg:block shrink-0" size={28} />

          {/* 출력 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 shrink-0 overflow-x-auto max-w-full">
            <h3 className="font-bold text-sm mb-3 flex items-center justify-center gap-1.5 text-neutral-700">
              <Sparkles size={14} className="text-rose-500" /> 결과 이미지
            </h3>
            <div className={`grid ${gapClass} bg-neutral-200 p-1.5 rounded-lg mx-auto w-max`}
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {outputImage.map((row, rIdx) => row.map((pixel, cIdx) => {
                const isEdge = rIdx === 0 || rIdx === size - 1 || cIdx === 0 || cIdx === size - 1;
                const isCenter = rIdx === activeRow && cIdx === activeCol;
                return (
                  <div key={`out-${rIdx}-${cIdx}`}
                    className={`${pixelStyle} rounded-[2px] transition-all ${
                      isEdge ? 'bg-neutral-100' : ''
                    } ${isCenter ? 'ring-2 ring-rose-600 z-20 scale-150 shadow-lg' : ''}`}
                    style={!isEdge ? { backgroundColor: getRgbString(pixel, viewMode) } : {}} />
                );
              }))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-neutral-400 pb-2">
          같은 커널이 R, G, B 세 채널에 각각 적용되고, 그 결과를 합쳐 최종 컬러 픽셀이 만들어집니다.
        </p>
      </div>
    </div>
  );
}
