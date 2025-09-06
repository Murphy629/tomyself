<template>
  <section class="qcard">
    <!-- 新增标题 -->
    <h2 class="qb-title">Query Builder</h2>

    <!-- Top selectors -->
    <div class="row">
      <BucketSelect
        v-model="state.selectedBucket"
        :options="bucketOptions"
        placeholder="Bucket"
      />
      <MeasurementSelect
        v-model="state.selectedMeasurement"
        :options="measurementOptions"
        :disabled="!state.selectedBucket"
        placeholder="Measurement"
      />
      <FieldSelect
        v-model="state.selectedField"
        :options="fieldOptions"
        :disabled="!state.selectedMeasurement"
        placeholder="Field"
      />
    </div>

    <!-- Condition Builder -->
    <ConditionBuilder
      v-model="conds"
      :availableKeys="tagKeys"
      class="block"
    />

    <!-- Time Range -->
    <TimeRangePicker
      v-model="timeRange"
      class="block"
    />
  </section>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import BucketSelect from './BucketSelect.vue'
import MeasurementSelect from './MeasurementSelect.vue'
import FieldSelect from './FieldSelect.vue'
import ConditionBuilder from './ConditionBuilder.vue'
import TimeRangePicker from './TimeRangePicker.vue'

/**
 * 本地 Mock：后续接后端时替换为接口加载即可
 * 结构： bucket -> measurement -> { fields: string[], tags?: string[] }
 */
const mockTree = {
  iot_data: {
    temperature: { fields: ['temp_value', 'humidity', 'sensor_status'], tags: ['location', 'sensor_id'] },
    device_status:{ fields: ['battery', 'online'], tags: ['device_id', 'region'] },
    humidity:     { fields: ['humidity'], tags: ['location', 'sensor_id'] }
  },
  server_metrics: {
    cpu:    { fields: ['usage_user', 'usage_system', 'usage_idle'], tags: ['host','region'] },
    memory: { fields: ['used', 'free', 'cached'],                    tags: ['host'] },
    disk:   { fields: ['read_iops', 'write_iops', 'util_pct'],       tags: ['host','mount'] }
  },
  weather_station: {
    obs:      { fields: ['temp_c', 'wind_kph', 'gust_kph'], tags: ['station','city'] },
    forecast: { fields: ['high_c', 'low_c', 'rain_mm'],     tags: ['city'] }
  }
}

/** 集中状态 */
const state = reactive({
  selectedBucket: null,
  selectedMeasurement: null,
  selectedField: null
})

/** 下拉选项 */
const bucketOptions = computed(() => Object.keys(mockTree))
const measurementOptions = computed(() => {
  if (!state.selectedBucket) return []
  return Object.keys(mockTree[state.selectedBucket])
})
const fieldOptions = computed(() => {
  if (!state.selectedBucket || !state.selectedMeasurement) return []
  return mockTree[state.selectedBucket][state.selectedMeasurement].fields || []
})
/** 可用 tag key（供 ConditionBuilder 使用） */
const tagKeys = computed(() => {
  if (!state.selectedBucket || !state.selectedMeasurement) return []
  return mockTree[state.selectedBucket][state.selectedMeasurement].tags || []
})

/** 条件与时间范围 */
const conds = reactive([]) // ConditionBuilder 的 v-model
const timeRange = reactive({ preset: 'last_1h' }) // TimeRangePicker 的 v-model

/** 级联重置 */
watch(() => state.selectedBucket, () => {
  state.selectedMeasurement = null
  state.selectedField = null
})
watch(() => state.selectedMeasurement, () => {
  state.selectedField = null
})

/** 对外统一变更事件 */
const emit = defineEmits(['change'])
watch(
  () => ({
    bucket: state.selectedBucket,
    measurement: state.selectedMeasurement,
    field: state.selectedField,
    conditions: conds,
    timeRange
  }),
  payload => emit('change', payload),
  { deep: true }
)
</script>

<style scoped>
.qcard {
  width: 100%;
  max-width: 980px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}
.row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.block { margin-top: 12px; }

.qb-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px;
  color: #111827;
  text-align: center;
  letter-spacing: 0.5px;   /* 字间距微调 */
}

</style>
