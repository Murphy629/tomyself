<template>
  <div class="wrap">
    <header class="window-dots">
      <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
    </header>

    <section class="grid">
      <!-- 左侧：选择 + 条件 + 时间 -->
      <div class="left">
        <div class="selector-row">
          <BucketSelector v-model="bucket" :buckets="buckets"/>
          <MeasurementSelector v-model="measurement" :measurements="measurements"/>
          <FieldSelector v-model="field" :fields="fields"/>
        </div>

        <ConditionBuilder v-model="conditions" :fields="fields" @logic-change="logic => groupLogic = logic" />

        <TimeRangePicker v-model="timeRange" />

        <div class="actions">
          <button class="btn run" @click="onRun">Run Query</button>
        </div>

        <FluxCodePreview :flux="fluxCode"/>
      </div>

      <!-- 右侧：结果预览 -->
      <div class="right">
        <h3 class="title">Result Preview</h3>
        <ResultPreview :data="mockData"/>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BucketSelector from './filters/BucketSelector.vue'
import MeasurementSelector from './filters/MeasurementSelector.vue'
import FieldSelector from './filters/FieldSelector.vue'
import ConditionBuilder from './filters/ConditionBuilder.vue'
import TimeRangePicker from './filters/TimeRangePicker.vue'
import ResultPreview from './filters/ResultPreview.vue'
import FluxCodePreview from './filters/FluxCodePreview.vue'

const props = defineProps<{
  buckets?: string[]
  measurements?: string[]
  fields?: string[]
}>()
const emit = defineEmits<{ (e:'run-query', payload:any):void }>()

// demo 数据源（可换成实际 API 结果）
const buckets = props.buckets ?? ['energy','iot','prod']
const measurements = props.measurements ?? ['temperature','humidity','pressure']
const fields = props.fields ?? ['_value','location','host','device']

const bucket = ref('')
const measurement = ref('')
const field = ref('')
const conditions = ref<any[]>([])
const groupLogic = ref<'AND'|'OR'>('AND')
const timeRange = ref<any>({ kind:'preset', preset:'1h' })

const fluxCode = computed(() => {
  let code = `from(bucket: "${bucket.value || 'energy'}")\n`
  // 时间
  if (timeRange.value?.kind === 'preset') {
    const map:{[k:string]:string} = { '15m':'-15m', '1h':'-1h', '12h':'-12h' }
    code += `  |> range(start: ${map[timeRange.value.preset] ?? '-1h'})\n`
  } else if (timeRange.value?.kind === 'custom') {
    code += `  |> range(start: ${JSON.stringify(timeRange.value.start)}, stop: ${JSON.stringify(timeRange.value.end)})\n`
  }
  // measurement / field
  if (measurement.value) {
    code += `  |> filter(fn: (r) => r["_measurement"] == "${measurement.value}")\n`
  }
  if (field.value && field.value !== '_value') {
    code += `  |> filter(fn: (r) => exists r["${field.value}"])\n`
  }
  // 条件
  if (conditions.value.length) {
    const parts = conditions.value.map((c:any) => {
      if (c.operator === 'between') {
        return `(r["${c.field}"] >= ${JSON.stringify(c.valueMin)} and r["${c.field}"] <= ${JSON.stringify(c.valueMax)})`
      } else if (c.operator === 'in') {
        const arr = String(c.value || '').split(',').map(s=>s.trim()).filter(Boolean).map(v=>JSON.stringify(v))
        return `(${arr.map(v => `r["${c.field}"] == ${v}`).join(' or ')})`
      } else {
        return `r["${c.field}"] ${c.operator} ${JSON.stringify(c.value)}`
      }
    })
    code += `  |> filter(fn: (r) => ${parts.join(` ${groupLogic.value.toLowerCase()} `)})\n`
  }
  return code.trim()
})

const mockData = ref<any[]>([]) // 预览占位用

function onRun(){
  const payload = {
    bucket: bucket.value,
    measurement: measurement.value,
    field: field.value,
    conditions: conditions.value,
    logic: groupLogic.value,
    timeRange: timeRange.value,
    flux: fluxCode.value
  }
  emit('run-query', payload)
  // 这里可对接后端 API；目前先填充预览假数据
  mockData.value = [{x:1,y:2},{x:2,y:3}]
}
</script>

<style scoped>
.wrap{background:#f0f6ff;border:1px solid #cfe3ff;border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(33,76,190,.06)}
.window-dots{display:flex;gap:8px;margin-bottom:10px}
.dot{width:10px;height:10px;border-radius:50%}
.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}

.grid{display:grid;grid-template-columns: 1.1fr .9fr;gap:16px}
.left{display:flex;flex-direction:column;gap:12px}
.right{background:#fff;border:1px solid #e3efff;border-radius:14px;padding:12px}
.title{margin:0 0 8px 0;color:#0b1220}

.selector-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.actions{display:flex;justify-content:flex-end}
.btn.run{background:#2c73ff;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(46,112,255,.25)}
@media (max-width: 900px){
  .grid{grid-template-columns:1fr}
  .selector-row{grid-template-columns:1fr}
}
</style>
