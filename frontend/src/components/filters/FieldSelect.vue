<template>
  <div class="select">
    <button class="trigger" type="button" :disabled="disabled" @click="toggle">
      <span class="label">{{ displayLabel }}</span>
      <span class="chev">▾</span>
    </button>
    <ul v-if="open" class="menu" role="listbox">
      <li
        v-for="opt in options"
        :key="opt"
        role="option"
        :aria-selected="opt === modelValue"
        class="item"
        @click="choose(opt)"
      >
        <span>{{ opt }}</span><span v-if="opt === modelValue" class="tick">✓</span>
      </li>
      <li v-if="!options?.length" class="empty">No options</li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  modelValue: { type: String, default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Field' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const open = ref(false)
const toggle = () => { if (!props.disabled) open.value = !open.value }
const choose = (v) => { emit('update:modelValue', v); open.value = false }
const displayLabel = computed(() => props.modelValue || props.placeholder)
const onDoc = (e) => { if (!e.target.closest('.select')) open.value = false }
onMounted(() => document.addEventListener('click', onDoc))
onBeforeUnmount(() => document.removeEventListener('click', onDoc))
</script>

<style scoped>
.select { position: relative; }
.trigger { width: 100%; height: 36px; padding: 0 10px; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; display:flex; align-items:center; justify-content:space-between; }
.trigger:disabled { opacity:.6; cursor:not-allowed; }
.label { color:#111827; font-size:14px; }
.chev { color:#9ca3af; font-size:12px; margin-left:8px; }
.menu { position:absolute; z-index:10; margin-top:6px; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.08); max-height:240px; overflow:auto; }
.item { padding:8px 10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:14px; }
.item:hover { background:#f3f4f6; }
.tick { color:#2563eb; }
.empty { padding:8px 10px; color:#6b7280; font-size:13px; }
</style>
