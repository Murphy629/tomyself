<template>
  <!-- Mini theme switch: shows ONLY the current mode as an icon and cycles on click -->
  <button
    class="theme-mini"
    :class="{ dark: isDark }"
    type="button"
    :title="label"
    :aria-label="`Theme: ${label}. Click to switch`"
    @click="cycle()"
  >
    <!-- Light icon -->
    <svg v-if="displayMode === 'light'" class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0-4v2M12 20.5v2M3.5 12h-2M22.5 12h-2M5.3 5.3l-1.4-1.4M20.1 20.1l-1.4-1.4M18.7 5.3l1.4-1.4M3.9 20.1l1.4-1.4"
        fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
      />
    </svg>

    <!-- Adaptive icon -->
    <svg v-else-if="displayMode === 'adaptive'" class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <path d="M8 20h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 7v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M9 10a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>

    <!-- Dark icon -->
    <svg v-else class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.354 14.354A8 8 0 1 1 9.646 3.646 7 7 0 1 0 20.354 14.354Z" fill="currentColor"/>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme.js'

const { theme, isDark, setTheme } = useTheme()

// show the selected mode's icon (not the resolved boolean)
const displayMode = computed(() => theme.value)

const label = computed(() =>
  displayMode.value === 'light'
    ? 'Light'
    : displayMode.value === 'adaptive'
      ? 'Adaptive (System)'
      : 'Dark'
)

function cycle() {
  const next =
    theme.value === 'light' ? 'adaptive'
    : theme.value === 'adaptive' ? 'dark'
    : 'light'
  setTheme(next)
}
</script>

<style scoped>
.theme-mini {
  appearance: none;
  border: none;
  background: #e9eef5;              /* light tile */
  color: #334155;                    /* icon color */
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,.08), inset 0 0 0 1px rgba(0,0,0,.06);
  transition: background .15s ease, color .15s ease, transform .02s ease, box-shadow .15s ease;
}
.theme-mini:hover { background: #e3e7ea; }
.theme-mini:active { transform: translateY(1px); }
.theme-mini:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #3b82f6;
}

.icon { width: 18px; height: 18px; }

/* Dark variant (based on resolved dark boolean for tile style) */
.theme-mini.dark {
  background: #111827;              /* slate-900ish */
  color: #cbd5e1;                    /* slate-300 icon */
  box-shadow: 0 1px 2px rgba(0,0,0,.3), inset 0 0 0 1px rgba(148,163,184,.18);
}
.theme-mini.dark:hover { background: #1f2937; }
.theme-mini.dark:focus-visible {
  box-shadow: 0 0 0 2px #0f172a, 0 0 0 4px #8ab4ff;
}
</style>