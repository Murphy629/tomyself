<template>
  <div class="space-y-4">
    <BucketSelector v-model="bucket" />
    <MeasurementSelector v-model="measurement" />
    <FieldSelector v-model="field" />
    <ConditionBuilder v-model="conditions" />
    <TimeRangePicker v-model="timeRange" />
    <button @click="runQuery" class="px-4 py-2 bg-blue-600 text-white rounded">Run Query</button>
    <ResultPreview :data="results" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BucketSelector from './filters/BucketSelector.vue'
import MeasurementSelector from './filters/MeasurementSelector.vue'
import FieldSelector from './filters/FieldSelector.vue'
import ConditionBuilder from './filters/ConditionBuilder.vue'
import TimeRangePicker from './filters/TimeRangePicker.vue'
import ResultPreview from './filters/ResultPreview.vue'

const bucket = ref('')
const measurement = ref('')
const field = ref('')
const conditions = ref([])
const timeRange = ref('last_15m')
const results = ref([])

const runQuery = () => {
  // 暂时 mock，后期可接入 useFluxQuery.ts / queryApi.ts
  results.value = [
    { time: '2025-09-06 00:00', value: 10 },
    { time: '2025-09-06 00:01', value: 12 },
  ]
}
</script>
