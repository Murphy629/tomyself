<template>
  <div class="row">
    <span class="drag" v-if="draggable">☰</span>

    <select v-model="local.field" class="input">
      <option disabled value="">Field</option>
      <option v-for="f in fields" :key="f" :value="f">{{ f }}</option>
    </select>

    <select v-model="local.operator" class="input op">
      <option value="=">=</option>
      <option value="!=">!=</option>
      <option value="in">IN</option>
      <option value="between">Between</option>
    </select>

    <template v-if="local.operator==='between'">
      <input class="input" placeholder="Min" v-model="local.valueMin" />
      <input class="input" placeholder="Max" v-model="local.valueMax" />
    </template>
    <input v-else class="input" placeholder="Value" v-model="local.value" />

    <button class="btn ghost" @click="$emit('toggle-logic')">{{ logic }}</button>
    <button class="btn danger" @click="$emit('remove')">✕</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
const props = defineProps<{
  modelValue: { field:string; operator:string; value?:string; valueMin?:string; valueMax?:string }
  fields: string[]
  logic: 'AND'|'OR'
  draggable?: boolean
}>()
const emit = defineEmits<{
 (e:'update:modelValue',v:any):void
 (e:'remove'):void
 (e:'toggle-logic'):void
}>()

const local = reactive({...props.modelValue})
watch(()=>props.modelValue, v => Object.assign(local, v))
watch(local, v => emit('update:modelValue', {...v}))
</script>

<style scoped>
.row{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #a8caff;border-radius:10px;padding:6px 10px}
.drag{cursor:grab;color:#7fb0ff}
.input{border:1px solid #cfe3ff;border-radius:8px;padding:6px 8px}
.input.op{max-width:110px}
.btn{border:none;border-radius:8px;padding:6px 10px;font-weight:700;cursor:pointer}
.btn.ghost{background:#e3efff;color:#2c73ff}
.btn.danger{background:#ff5f56;color:#fff}
</style>
