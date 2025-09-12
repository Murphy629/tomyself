<!-- ThemeSwitch.vue -->
<template>
    <div class="segmented" role="tablist" aria-label="Theme switch" :data-size="size">
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
    
      <!-- Inline SVGs (no runtime compiler needed) -->
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Mode = 'light' | 'adaptive' | 'dark'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  defaultSelection?: Mode
  modelValue?: Mode
  size?: Size
}
const props = withDefaults(defineProps<Props>(), {
  defaultSelection: 'adaptive',
  size: 'md',
})
const emit = defineEmits<{ (e:'update:modelValue', v:Mode):void; (e:'change', v:Mode):void }>()

const internal = ref<Mode>(props.defaultSelection)
watch(() => props.modelValue, v => { if (v) internal.value = v })

const current = computed<Mode>(() => props.modelValue ?? internal.value)
function select(v: Mode) {
  internal.value = v
  emit('update:modelValue', v)
  emit('change', v)
}

const options = [
  { value: 'light' as Mode, label: 'Light' },
  { value: 'adaptive' as Mode, label: 'Adaptive (System)' },
  { value: 'dark' as Mode, label: 'Dark' },
]
</script>


<style scoped>
/* ==== Segmented control (no CSS variables) ==== */
.segmented {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: #eceff1;           /* light gray track */
  align-items: center;
}

.segmented[data-size="sm"] { padding: 4px; gap: 4px; }
.segmented[data-size="lg"] { padding: 8px; gap: 8px; }

/* Base button */
.seg-item {
  appearance: none;
  border: 0;
  background: transparent;
  color: #555;                   /* icon/text color (unselected) */
  width: 44px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background .15s ease, transform .02s ease, box-shadow .15s ease, color .15s ease;
}
.segmented[data-size="sm"] .seg-item { width: 38px; height: 28px; }
.segmented[data-size="lg"] .seg-item { width: 52px; height: 38px; }

.seg-item:hover { background: #e3e7ea; }
.seg-item:active { transform: translateY(1px); }

/* Selected state — hard colors */
.seg-item.selected {
  background: #ffffff;                      /* pill highlight */
  color: #111;                              /* darker icon on selected */
  box-shadow: 0 1px 2px rgba(0,0,0,.08), inset 0 0 0 1px rgba(0,0,0,.06);
}

/* Optional focus ring for keyboard users */
.seg-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3b82f6;
}

/* Icon sizes */
.icon { width: 18px; height: 18px; }
.segmented[data-size="sm"] .icon { width: 16px; height: 16px; }
.segmented[data-size="lg"] .icon { width: 20px; height: 20px; }

/* Screen-reader only */
.sr-only{
  position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap
}
</style>