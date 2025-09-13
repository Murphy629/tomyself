<!-- CardSkeleton.vue -->
<template>
  <div
    class="card-skeleton"
    role="status"
    aria-busy="true"
    aria-live="polite"
    :style="{
      '--speed': speedVar,
      '--card-w': cardW,
      '--top-h': topH
    }"
  >
    <!-- top large rectangle -->
    <div class="skeleton block top" />

    <!-- text lines -->
    <div class="skeleton line short" />
    <div class="skeleton line medium" />
    <div class="skeleton line long" />

    <span class="sr-only">Loading card…</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Dur = number | `${number}ms` | `${number}s`;
type Len = number | `${number}px`;

const props = withDefaults(defineProps<{
  width?: Len;   // card max-width
  height?: Len;  // top block height
  speed?: Dur;   // shimmer duration
}>(), {
  width: 320,
  height: 180,
  speed: 1.4
});

const speedVar = computed(() =>
  typeof props.speed === 'number' ? `${props.speed}s` : props.speed
);
const cardW = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width
);
const topH = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height
);
</script>

<style scoped>
.card-skeleton {
  width: 100%;
  max-width: var(--card-w, 360px);
  padding: 1rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: .75rem;
}

/* skeleton base style */
.skeleton {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 37%,
    #e0e0e0 63%
  );
  background-size: 400% 100%;
  animation: shimmer var(--speed, 1.4s) linear infinite;
  border-radius: 6px;
}

/* top block placeholder */
.skeleton.block.top {
  width: 100%;
  height: var(--top-h, 180px);
  border-radius: 8px;
}

/* text lines placeholders */
.skeleton.line { height: 12px; }
.skeleton.line.short { width: 50%; }
.skeleton.line.medium { width: 70%; }
.skeleton.line.long { width: 90%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* a11y screen reader */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  margin: -1px; border: 0; padding: 0;
  clip: rect(0 0 0 0); clip-path: inset(50%);
  overflow: hidden;
}


.dark .card-skeleton {
  background: #181a1d;               /* deep slate tile */
  box-shadow: 0 6px 18px rgba(0,0,0,0.5);
  color: #e5e7eb;
}
/* Dark shimmer tones: slightly lighter band sweeping over darker base */
.dark .skeleton {
  background: linear-gradient(
    90deg,
    #1f2937 25%,   /* slate-800 base */
    #374151 37%,   /* slate-700 highlight */
    #1f2937 63%
  );
  background-size: 400% 100%;
}
.dark .skeleton.block.top {
  /* keep same radius and height; no change needed */
}
.dark .skeleton.line {
  /* maintain height; only tones differ */
}
/* Optional: adjust subtle borders if you later add any */
</style>