<template>
  <div class="group">
    <label class="label">Bucket</label>
    <select class="input" v-model="innerValue" @change="$emit('update:modelValue', innerValue)">
      <option disabled value="">Select Bucket</option>
      <option v-for="b in buckets" :key="b" :value="b">{{ b }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ modelValue: string; buckets: string[] }>()
defineEmits<{(e:'update:modelValue',v:string):void}>()
const innerValue = ref(props.modelValue ?? '')
watch(() => props.modelValue, v => innerValue.value = v)
</script>

<style scoped>
.group{display:flex;flex-direction:column;gap:6px}
.label{font-size:13px;color:#2a3446}
.input{height:38px;border:1px solid #cfe3ff;border-radius:10px;padding:0 10px;background:#f0f6ff}
</style>
