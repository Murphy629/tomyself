<!-- LineChartSkeletonStyle01.vue -->
<template>
  <div
    class="skeleton-linechart"
    :class="{ dark }"
    role="status"
    aria-live="polite"
    aria-busy="true"
    :style="{
      '--anim-speed': speed + 's',
      '--w': width + 'px',
      '--h': height + 'px'
    }"
  >
    <!-- Top placeholder text lines -->
    <!-- <div class="label-row">
      <div class="label short" />
      <div class="label long" />
    </div> -->

    <!-- Chart area -->
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="chart"
      aria-hidden="true"
    >
      <!-- Grid -->
      <g class="grid">
        <line
          v-for="y in gridY"
          :key="'gy' + y"
          :x1="padding"
          :x2="width - padding"
          :y1="y"
          :y2="y"
        />
        <line
          v-for="x in gridX"
          :key="'gx' + x"
          :x1="x"
          :x2="x"
          :y1="padding"
          :y2="height - padding"
        />
      </g>

      <!-- Axes -->
      <g class="axes">
        <line :x1="padding" :y1="padding" :x2="padding" :y2="height - padding" />
        <line :x1="padding" :y1="height - padding" :x2="width - padding" :y2="height - padding" />
      </g>

      <!-- The skeleton line (animated draw) -->
      <polyline
        class="skeleton-stroke"
        :points="polyPoints"
        pathLength="1000"
        :style="{ 'animation-duration': speed + 's' }"
      />

      <!-- Soft dots that gently pulse -->
      <g class="dots">
        <circle
          v-for="(p, i) in coords"
          :key="i"
          :cx="p.x"
          :cy="p.y"
          r="3"
          :style="{ 'animation-delay': (i * 0.05) + 's' }"
        />
      </g>
    </svg>

    <span class="sr-only">Loading chart…</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  width?: number;
  height?: number;
  points?: number;      // number of sample points across the line
  padding?: number;
  speed?: number;       // overall animation speed in seconds
  dark?: boolean;       // dark mode toggle
}>(), {
  width: 640,
  height: 280,
  points: 28,
  padding: 28,
  speed: 1.6,
  dark: false
});

const { width, height, padding } = props;

// generate a nice, smooth-ish placeholder line (sinusoid + small noise)
const values = computed(() => {
  const n = Math.max(6, props.points);
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = 0.55 + 0.25 * Math.sin(t * Math.PI * 1.5);
    const wobble = 0.06 * Math.sin(t * Math.PI * 6.0);
    const noise = (Math.random() - 0.5) * 0.06;
    arr.push(Math.min(0.92, Math.max(0.12, base + wobble + noise)));
  }
  return arr;
});

const coords = computed(() => {
  const w = width - 2 * padding;
  const h = height - 2 * padding;
  const n = values.value.length;
  return values.value.map((v, i) => {
    const x = padding + (i / (n - 1)) * w;
    const y = padding + (1 - v) * h;
    return { x, y };
  });
});

const polyPoints = computed(() => coords.value.map(p => `${p.x},${p.y}`).join(' '));

// grid lines positions
const gridY = computed(() => {
  const lines = 4;
  const step = (height - 2 * padding) / lines;
  return Array.from({ length: lines + 1 }, (_, i) => padding + i * step);
});

const gridX = computed(() => {
  const cols = 5;
  const step = (width - 2 * padding) / cols;
  return Array.from({ length: cols + 1 }, (_, i) => padding + i * step);
});

const dark = props.dark;
const speed = props.speed;
</script>

<style scoped>
/* ===== Base Theme Variables ===== */
.skeleton-linechart {
  --bg: #ffffff;
  --ink-weak: #eaecef;     /* grid, axes */
  --ink: #d9dce1;          /* base stroke */
  --ink-strong: #c9cdd6;   /* line & dots */
  --shine: #f7f9fc;        /* shimmer highlight */
  --text-weak: #eff2f6;

  width: var(--w);
  max-width: 100%;
  background: var(--bg);
  border-radius: 14px;
  padding: 14px 16px 10px;
  box-shadow: 0 6px 16px rgba(20, 20, 20, 0.06);
  position: relative;
  overflow: hidden;
}

/* Dark mode */
.skeleton-linechart.dark {
  --bg: #0f1115;
  --ink-weak: #232734;
  --ink: #2a2f3d;
  --ink-strong: #3a4152;
  --shine: #1b2030;
  --text-weak: #1a1f2b;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

/* ===== Top Labels ===== */
.label-row {
  display: flex;
  gap: 10px;
  margin: 2px 4px 10px;
}
.label {
  height: 12px;
  border-radius: 8px;
  background: linear-gradient(120deg, var(--ink) 20%, var(--shine) 35%, var(--ink) 60%);
  background-size: 200% 100%;
  animation: shimmer var(--anim-speed) linear infinite;
}
.label.short { width: 120px; }
.label.long  { width: 220px; }

.chart {
  display: block;
  border-radius: 10px;
}

/* ===== Axes & Grid ===== */
.grid line {
  stroke: var(--ink-weak);
  stroke-width: 1;
  stroke-dasharray: 2 6;
  opacity: 0.8;
  animation: grid-fade calc(var(--anim-speed) * 1.1) ease-in-out infinite;
}
.axes line {
  stroke: var(--ink);
  stroke-width: 1.5;
}

/* ===== Skeleton Line ===== */
.skeleton-stroke {
  fill: none;
  stroke: var(--ink-strong);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;

  /* Draw-on effect */
  stroke-dasharray: 220 780; /* pathLength is 1000; adjust to taste */
  animation:
    draw var(--anim-speed) ease-in-out infinite,
    subtle 3.2s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 0.35px var(--ink));
}

/* Dots */
.dots circle {
  fill: var(--ink-strong);
  opacity: 0.8;
  transform-origin: center;
  animation: pulse 1.6s ease-in-out infinite;
}

/* ===== Shimmer overlay (soft sweep across card) ===== */
.skeleton-linechart::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 20%,
    rgba(255, 255, 255, 0.45) 40%,
    transparent 60%
  );
  mix-blend-mode: soft-light;
  animation: sweep calc(var(--anim-speed) * 1.2) linear infinite;
  pointer-events: none;
}

/* Dark tweak for overlay */
.skeleton-linechart.dark::after {
  background: linear-gradient(
    100deg,
    transparent 20%,
    rgba(255, 255, 255, 0.10) 40%,
    transparent 60%
  );
}

/* ===== Animations ===== */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: 0% 0; }
}

@keyframes draw {
  0%   { stroke-dashoffset: 1000; }
  55%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}

@keyframes subtle {
  0%   { opacity: 0.78 }
  100% { opacity: 0.95 }
}

@keyframes pulse {
  0%, 100% { transform: scale(0.92); opacity: 0.55; }
  50%      { transform: scale(1.05); opacity: 0.9; }
}

@keyframes sweep {
  0%   { transform: translateX(-60%); }
  100% { transform: translateX(60%); }
}

@keyframes grid-fade {
  0%, 100% { opacity: 0.65; }
  50%      { opacity: 0.95; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .label, .grid line, .skeleton-stroke, .dots circle, .skeleton-linechart::after {
    animation: none !important;
  }
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  white-space: nowrap; clip-path: inset(50%); clip: rect(0 0 0 0); overflow: hidden;
}
</style>