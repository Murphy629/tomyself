<!-- LineChartSkeletonStyle02.vue -->
<template>
  <div
    class="bar-skeleton"
    :class="[{ dark: isDark, light: !isDark }]"
    role="status"
    aria-live="polite"
    aria-busy="true"
    :style="{ '--w': width + 'px', '--h': height + 'px', '--speed': speed + 's' }"
  >
    <!-- title line -->
    <div class="title" />

    <!-- chart -->
    <svg
      class="chart"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      aria-hidden="true"
    >
      <!-- grid -->
      <g class="grid">
        <line
          v-for="(y,i) in gridY"
          :key="'gy'+i"
          :x1="padding" :x2="width - padding"
          :y1="y" :y2="y"
        />
      </g>

      <!-- axes -->
      <g class="axes">
        <line :x1="padding" :y1="padding" :x2="padding" :y2="height - padding" />
        <line :x1="padding" :y1="height - padding" :x2="width - padding" :y2="height - padding" />
      </g>

      <!-- bars -->
      <g class="bars">
        <rect
          v-for="(b,i) in bars"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="barWidth"
          :height="b.h"
          class="bar"
          :style="{ '--delay': (i * 0.03) + 's', '--hue': hueFor(b.v) }"
          rx="3"
        />
      </g>
    </svg>

    <!-- legend stub -->
    <div class="legend">
      <span class="swatch" />
      <div class="legend-text" />
    </div>

    <span class="sr-only">Loading color bar chart…</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Theme = 'auto' | 'light' | 'dark';

const props = withDefaults(defineProps<{
  width?: number;
  height?: number;
  padding?: number;
  columns?: number;   // number of bars
  speed?: number;     // animation speed (seconds)
  theme?: Theme;      // 'auto' | 'light' | 'dark'
}>(), {
  width: 760,
  height: 280,
  padding: 36,
  columns: 36,
  speed: 1.7,
  theme: 'auto'
});

const prefersDark = typeof window !== 'undefined'
  ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  : false;

const isDark = computed(() => {
  if (props.theme === 'auto') return prefersDark;
  return props.theme === 'dark';
});

const { width, height, padding } = props;

const barAreaW = width - 2 * padding;
const barAreaH = height - 2 * padding;

const barGap = 6; // px between bars
const barWidth = computed(() => Math.max(6, (barAreaW / props.columns) - barGap));

/** placeholder values in [0,1] with a few “peaks” */
const vals = computed(() => {
  const n = props.columns;
  const arr:number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = 0.35 + 0.25 * Math.sin(2.5 * Math.PI * t);
    const bump1 = 0.28 * Math.exp(-((t - 0.35) ** 2) / 0.003);
    const bump2 = 0.30 * Math.exp(-((t - 0.82) ** 2) / 0.002);
    const noise = (Math.random() - 0.5) * 0.04;
    arr.push(Math.max(0.08, Math.min(0.95, base + bump1 + bump2 + noise)));
  }
  return arr;
});

/** map to bar geometry */
const bars = computed(() => {
  const n = vals.value.length;
  const step = (barAreaW / n);
  return vals.value.map((v, i) => {
    const h = v * barAreaH;
    const x = padding + i * step + (step - barWidth.value) / 2;
    const y = height - padding - h;
    return { x, y, h, v };
  });
});

/** green → yellow → red hue (100→0) */
const hueFor = (v: number) => (100 - Math.round(v * 100)).toString();

const gridY = computed(() => {
  const lines = 4;
  const step = barAreaH / lines;
  return Array.from({ length: lines + 1 }, (_, i) => padding + i * step);
});

const speed = props.speed;
</script>

<style scoped>
/* Light is the default; dark overrides below */

.bar-skeleton{
  --card:#fff;
  --ink-weak:#e9edf3;
  --ink:#d6dbe4;
  --shine:rgba(0,0,0,.06);

  width:var(--w); max-width:100%;
  background:var(--card);
  border-radius:12px;
  box-shadow:0 6px 16px rgba(0,0,0,.08);
  padding:12px 14px 10px;
  box-sizing:border-box;
  position:relative; overflow:hidden;
}

.bar-skeleton.dark{
  --card:#0f1115;
  --ink-weak:#232734;
  --ink:#2a2f3d;
  --shine:rgba(255,255,255,.08);
  box-shadow:0 6px 18px rgba(0,0,0,.28);
}

/* title line */
.title{
  width:160px; height:12px; border-radius:6px;
  background:linear-gradient(120deg,var(--ink) 20%, var(--shine) 40%, var(--ink) 60%);
  background-size:200% 100%;
  animation: shimmer var(--speed) linear infinite;
  margin:2px 6px 8px;
}

.chart{ display:block; border-radius:8px; }

/* grid & axes */
.grid line{ stroke:var(--ink-weak); stroke-width:1; stroke-dasharray:2 6; opacity:.85; }
.axes line{ stroke:var(--ink); stroke-width:1.5; }

/* bars */
.bar{
  fill:url(#dummy);
  vector-effect: non-scaling-stroke;
  shape-rendering: geometricPrecision;

  --g: linear-gradient(
    to top,
    hsl(calc(var(--hue)*1deg), 80%, 50%),
    hsl(calc((var(--hue) - 25)*1deg), 90%, 55%)
  );

  background:
    linear-gradient(100deg, transparent 25%, var(--shine) 45%, transparent 62%),
    var(--g);
  background-size: 220% 100%, 100% 100%;
  background-repeat: no-repeat;

  -webkit-mask-image: radial-gradient(100% 100% at 50% 50%, #000 98%, #000);
          mask-image: radial-gradient(100% 100% at 50% 50%, #000 98%, #000);

  animation:
    rise var(--speed) ease-in-out infinite,
    sweep calc(var(--speed)*1.2) linear infinite;
  transform-origin: bottom center;
}

/* legend */
.legend{
  display:flex; align-items:center; gap:.5rem;
  margin:10px 6px 6px;
}
.swatch{
  width:18px; height:6px; border-radius:3px;
  background:linear-gradient(90deg, #3fb950, #f1c40f, #e74c3c);
}
.legend-text{
  width:90px; height:10px; border-radius:6px;
  background:linear-gradient(120deg,var(--ink) 20%, var(--shine) 40%, var(--ink) 60%);
  background-size:200% 100%;
  animation: shimmer var(--speed) linear infinite;
}

/* shiny overlay for whole card */
.bar-skeleton::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(100deg, transparent 20%, var(--shine) 40%, transparent 60%);
  animation:sweep calc(var(--speed)*1.4) linear infinite;
  mix-blend-mode:soft-light;
}

/* animations */
@keyframes rise{
  0%   { transform: scaleY(.85); opacity:.85; }
  50%  { transform: scaleY(1);   opacity:1; }
  100% { transform: scaleY(1);   opacity:1; }
}
@keyframes shimmer{
  0%{ background-position:200% 0; }
  100%{ background-position:0% 0; }
}
@keyframes sweep{
  0%{ transform: translateX(-55%); }
  100%{ transform: translateX(55%); }
}

/* a11y + reduced motion */
@media (prefers-reduced-motion: reduce){
  .bar, .title, .legend-text, .bar-skeleton::after { animation:none !important; }
}
.sr-only{
  position:absolute; width:1px; height:1px; margin:-1px; border:0; padding:0; overflow:hidden;
  clip: rect(0 0 0 0); clip-path: inset(50%);
}
</style>