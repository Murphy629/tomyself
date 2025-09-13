<!-- ThemeSwitch.vue -->
<template>
  <div
    class="segmented"
    :class="[{ 'is-dark': isDarkMode }, sizeClass]"
    role="tablist"
    aria-label="Theme switch"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      role="tab"
      :aria-selected="current === opt.value"
      class="seg-item"
      :class="{ selected: current === opt.value }"
      :title="opt.label"
      @click="select(opt.value)"
    >
      <!-- Icons -->
      <svg v-if="opt.value==='light'" class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0-4v2M12 20.5v2M3.5 12h-2M22.5 12h-2M5.3 5.3l-1.4-1.4M20.1 20.1l-1.4-1.4M18.7 5.3l1.4-1.4M3.9 20.1l1.4-1.4"
              fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>

      <svg v-else-if="opt.value==='adaptive'" class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
        <path d="M8 20h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M12 7v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M9 10a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>

      <svg v-else class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.354 14.354A8 8 0 1 1 9.646 3.646 7 7 0 1 0 20.354 14.354Z" fill="currentColor"/>
      </svg>

      <span class="sr-only">{{ opt.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  defaultSelection: { type: String, default: 'adaptive' }, // 'light' | 'dark' | 'adaptive'
  modelValue: String,
  size: { type: String, default: 'sm' }                    // 'sm' | 'lg'
})
const emit = defineEmits(['update:modelValue', 'change'])

// Internal v-model fall-back
const internal = ref(props.defaultSelection)
watch(() => props.modelValue, v => { if (v) internal.value = v })

const current = computed(() => props.modelValue ?? internal.value)
function select(v) {
  internal.value = v
  emit('update:modelValue', v)
  emit('change', v)
}

// System dark preference (for 'adaptive')
const SYSTEM_MQ = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null
const systemPrefersDark = ref(SYSTEM_MQ ? SYSTEM_MQ.matches : false)

onMounted(() => {
  if (SYSTEM_MQ) {
    const handler = (e) => { systemPrefersDark.value = e.matches }
    try {
      SYSTEM_MQ.addEventListener ? SYSTEM_MQ.addEventListener('change', handler)
                                 : SYSTEM_MQ.addListener(handler)
    } catch {}
  }
})

const isDarkMode = computed(() =>
  current.value === 'dark' || (current.value === 'adaptive' && systemPrefersDark.value)
)

const sizeClass = computed(() => (props.size === 'lg' ? 'seg-lg' : props.size === 'sm' ? 'seg-sm' : ''))
const options = [
  { value: 'light',    label: 'Light' },
  { value: 'adaptive', label: 'Adaptive (System)' },
  { value: 'dark',     label: 'Dark' },
]
</script>

<style scoped>
/* ==== Base (Light) ==== */
.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  padding: 8px;
  border-radius: 14px;
  background: #eceff1;             /* track */
  align-items: stretch;
  box-sizing: border-box;
}

.seg-sm { padding: 3px; gap: 6px; }
.seg-lg { padding: 14px; gap: 10px; }

.seg-item {
  appearance: none;
  border: 0;
  background: transparent;
  color: #555;
  width: 100%;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s ease, transform .02s ease, box-shadow .15s ease, color .15s ease;
}
.seg-sm .seg-item { height: 20px; }
.seg-lg .seg-item { height: 38px; }

.seg-item:hover { background: #e3e7ea; }
.seg-item:active { transform: translateY(1px); }

.seg-item.selected {
  background: #ffffff;             /* pill highlight */
  color: #111;
  box-shadow: 0 1px 2px rgba(0,0,0,.08), inset 0 0 0 1px rgba(0,0,0,.06);
}

.seg-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #3b82f6;
}

.icon { width: 18px; height: 18px; }
.seg-sm .icon { width: 16px; height: 16px; }
.seg-lg .icon { width: 20px; height: 20px; }

.sr-only {
  position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap;
}

/* ==== Dark Mode (matches your sidebar dark palette feel) ==== */
/* Applied when the component itself decides it's dark (current === 'dark' OR adaptive + system dark) */
.segmented.is-dark {
  background: #1b2436;           /* deep slate-ish track */
}

.segmented.is-dark .seg-item {
  color: #cbd5e1;                 /* slate-300 */
}

.segmented.is-dark .seg-item:hover {
  background: #243047;            /* darker hover */
}

.segmented.is-dark .seg-item.selected {
  background: #0f172a;            /* slate-900 tile */
  color: #e5e7eb;                 /* slate-200 text */
  box-shadow: 0 1px 2px rgba(0,0,0,.3), inset 0 0 0 1px rgba(148,163,184,.18); /* subtle border */
}

.segmented.is-dark .seg-item:focus-visible {
  box-shadow: 0 0 0 2px #0f172a, 0 0 0 4px #8ab4ff; /* blue focus ring similar to your sidebar */
}
</style>