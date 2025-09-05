<template>
  <div class="box">
    <h3 class="title">Time Range Picker</h3>
    <div class="chips">
      <button v-for="p in presets" :key="p.v"
              class="chip" :class="{active:modelValue.kind==='preset' && modelValue.preset===p.v}"
              @click="$emit('update:modelValue', { kind:'preset', preset:p.v })">
        {{ p.label }}
      </button>
      <button class="chip" :class="{active:modelValue.kind==='custom'}"
              @click="$emit('update:modelValue', { kind:'custom', start:modelValue.start, end:modelValue.end })">
        Custom
      </button>
    </div>

    <div v-if="modelValue.kind==='custom'" class="custom">
      <input type="datetime-local" class="input" v-model="local.start"
             @change="emitCustom"/>
      <span>to</span>
      <input type="datetime-local" class="input" v-model="local.end"
             @change="emitCustom"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
const props = defineProps<{ modelValue: any }>()
const emit = defineEmits<{ (e:'update:modelValue', v:any):void }>()
const presets = [
  { v:'15m', label:'15m' }, { v:'1h', label:'1h' }, { v:'12h', label:'12h' }
]
const local = reactive({ start: props.modelValue?.start ?? '', end: props.modelValue?.end ?? '' })
watch(() => props.modelValue, v => { local.start = v?.start ?? ''; local.end = v?.end ?? '' })
function emitCustom(){ emit('update:modelValue', { kind:'custom', start:local.start, end:local.end }) }
</script>

<style scoped>
.box{margin-top:12px}
.title{margin:0 0 8px 0;color:#2a3446;font-weight:800}
.chips{display:flex;gap:10px}
.chip{border:1px solid #cfe3ff;background:#fff;border-radius:10px;padding:8px 14px;cursor:pointer}
.chip.active{background:#2c73ff;color:#fff;border-color:#2c73ff}
.custom{display:flex;align-items:center;gap:8px;margin-top:10px}
.input{border:1px solid #cfe3ff;border-radius:10px;padding:6px 10px;background:#f0f6ff}
</style>
