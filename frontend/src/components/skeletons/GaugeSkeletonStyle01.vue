<!-- GaugeSkeleton.vue -->
<template>
  <div
    class="gauge-skeleton"
    :class="{ dark }"
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <div class="row">
      <div
        v-for="i in count"
        :key="i"
        class="gauge"
        :style="{ '--size': size + 'px', '--thick': thickness + 'px', '--speed': speed + 's' }"
      >
        <svg
          class="svg"
          :viewBox="`0 0 ${box} ${box/2}`"
          :width="size"
          :height="size/2"
          aria-hidden="true"
        >
          <!-- track -->
          <path :d="arcPath" class="track" />

          <!-- animated sweep fill -->
          <path :d="arcPath" class="fill" />

          <!-- inner cutout mask (to make it look like a ring) -->
          <path :d="innerArcPath" class="cut" />
        </svg>

        <!-- number placeholder -->
        <div class="value" />

        <!-- label placeholder -->
        <div class="label" />
      </div>
    </div>

    <span class="sr-only">Loading gauges…</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  count?: number;     // how many gauges
  size?: number;      // px width of each gauge (height is size/2)
  thickness?: number; // ring thickness (px)
  speed?: number;     // animation seconds
  dark?: boolean;
}>(), {
  count: 3,
  size: 220,
  thickness: 22,
  speed: 1.8,
  dark: false
});

/** Simple semicircle geometry in an easy square box */
const box = 200;                  // viewBox width
const R   = 90;                   // outer radius
const Cx  = box / 2;              // center x
const Cy  = box / 2;              // center y (on bottom edge of box)

const arcPath = computed(() => {
  // Outer semicircle: left -> right
  const x0 = Cx - R, y0 = Cy;
  const x1 = Cx + R, y1 = Cy;
  return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
});

const innerArcPath = computed(() => {
  // Draws a slightly smaller semicircle with thicker stroke to “cut out”
  const r = R - 0.01; // same path; we use CSS blend to cut
  const x0 = Cx - r, y0 = Cy;
  const x1 = Cx + r, y1 = Cy;
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
});

const { count, size, thickness, speed, dark } = props;
</script>

<style scoped>
.gauge-skeleton {
  --bg: #0f1115;
  --card: #11151f;
  --ink-weak: #2a3040;
  --ink: #3a4152;
  --shine: rgba(255,255,255,.06);

  background: var(--card);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  overflow: hidden;
}

/* light mode */
.gauge-skeleton:not(.dark) {
  --bg: #ffffff;
  --card: #ffffff;
  --ink-weak: #e9edf3;
  --ink: #d6dbe4;
  --shine: rgba(255,255,255,.45);
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
}

/* flex row with wrapping (no overflow) */
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 18px;
}

/* single gauge “card” */
.gauge {
  width: clamp(200px, var(--size), 100%);
  max-width: var(--size);
  min-width: 220px;       /* helps wrapping into next row */
  background: var(--bg);
  border-radius: 10px;
  padding: 14px 16px 18px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* soft shimmer across each gauge */
.gauge::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 25%, var(--shine) 45%, transparent 62%);
  animation: sweep calc(var(--speed) * 1.1) linear infinite;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

.svg { display: block; margin: 4px auto 6px; }

/* base grid-ish background line */
.track {
  fill: none;
  stroke: var(--ink-weak);
  stroke-width: var(--thick);
  stroke-linecap: round;
  opacity: .7;
}

/* animated sweep for the skeleton “value” */
.fill {
  fill: none;
  stroke: var(--ink);
  stroke-width: var(--thick);
  stroke-linecap: round;

  /* draw-on: we fake a longer path via dash */
  stroke-dasharray: 350 320; /* enough to cover ~πR (≈ 283) comfortably */
  animation:
    draw var(--speed) ease-in-out infinite,
    throb 3s ease-in-out infinite alternate;
}

/* inner cut to make it a ring (uses blend trick) */
.cut {
  fill: none;
  stroke: var(--bg);
  stroke-width: calc(var(--thick) - 8px);
  stroke-linecap: round;
  opacity: 1;
}

/* placeholders for number + label */
.value, .label {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(120deg, var(--ink) 20%, rgba(255,255,255,.08) 40%, var(--ink) 60%);
  background-size: 200% 100%;
  animation: shimmer var(--speed) linear infinite;
  margin: 8px auto 0;
}

.value { width: 90px; height: 16px; }
.label { width: 120px; height: 12px; opacity: .9; }

/* animations */
@keyframes draw {
  0%   { stroke-dashoffset: 520; }
  55%  { stroke-dashoffset: 0;   }
  100% { stroke-dashoffset: 0;   }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: 0% 0; }
}
@keyframes sweep {
  0%   { transform: translateX(-55%); }
  100% { transform: translateX(55%); }
}
@keyframes throb {
  0%   { opacity: .78; }
  100% { opacity: .98; }
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .fill, .value, .label, .gauge::after { animation: none !important; }
}

/* a11y */
.sr-only {
  position: absolute; width:1px; height:1px; margin:-1px; padding:0; overflow:hidden;
  clip: rect(0 0 0 0); clip-path: inset(50%); border:0;
}
</style>