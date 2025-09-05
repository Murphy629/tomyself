<template>
  <div class="filter-card">
    <!-- 标题 -->
    <header class="header">
      <h2>Query Filter</h2>
    </header>

    <!-- 条件列表 -->
    <draggable v-model="filters" item-key="id" class="filter-list" handle=".drag-handle">
      <template #item="{ element, index }">
        <div class="filter-row">
          <span class="drag-handle">☰</span>

          <select v-model="element.field" class="input">
            <option disabled value="">Select Field</option>
            <option v-for="f in fields" :key="f" :value="f">{{ f }}</option>
          </select>

          <select v-model="element.operator" class="input op">
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value="in">IN</option>
            <option value="between">Between</option>
          </select>

          <input v-model="element.value" placeholder="Value" class="input" />

          <button class="btn remove" @click="removeFilter(index)">✕</button>
        </div>
      </template>
    </draggable>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn add" @click="addFilter">+ Add Filter</button>
    </div>

    <!-- 时间范围 -->
    <div class="time-range">
      <label>Time Range:</label>
      <select v-model="timeRange" class="input">
        <option value="15m">Last 15 minutes</option>
        <option value="1h">Last 1 hour</option>
        <option value="24h">Last 24 hours</option>
        <option value="custom">Custom…</option>
      </select>
      <input
        v-if="timeRange === 'custom'"
        type="datetime-local"
        v-model="customRange.start"
        class="input"
      />
      <span v-if="timeRange === 'custom'">to</span>
      <input
        v-if="timeRange === 'custom'"
        type="datetime-local"
        v-model="customRange.end"
        class="input"
      />
    </div>

    <!-- 输出结果 -->
    <footer class="footer">
      <button class="btn run" @click="runQuery">Run Query</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
//import draggable from 'vuedraggable'

interface Filter {
  id: number
  field: string
  operator: string
  value: string
}

const props = defineProps<{
  fields: string[] // 外部传入可选字段
}>()

const filters = ref<Filter[]>([])
const timeRange = ref('15m')
const customRange = ref({ start: '', end: '' })

function addFilter() {
  filters.value.push({
    id: Date.now(),
    field: '',
    operator: '=',
    value: ''
  })
}

function removeFilter(i: number) {
  filters.value.splice(i, 1)
}

function runQuery() {
  const payload = {
    filters: filters.value,
    timeRange: timeRange.value,
    customRange: customRange.value
  }
  console.log('Running query with payload:', payload)
  // 这里后续可以 emit 或调用 API
}
</script>

<style scoped>
.filter-card {
  background: #f0f6ff;
  border: 1px solid #cfe3ff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 80, 180, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 12px;
  color: #2c73ff;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #a8caff;
  border-radius: 10px;
  padding: 6px 10px;
}

.drag-handle {
  cursor: grab;
  color: #7fb0ff;
}

.input {
  border: 1px solid #cfe3ff;
  border-radius: 6px;
  padding: 6px 8px;
  flex: 1;
}

.input.op {
  max-width: 90px;
}

.actions {
  margin-top: 12px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: bold;
}

.btn.add {
  background: #a8caff;
  color: #fff;
}

.btn.remove {
  background: #ff5f56;
  color: white;
}

.btn.run {
  background: #2c73ff;
  color: #fff;
  margin-top: 14px;
}

.time-range {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer {
  margin-top: 20px;
  text-align: right;
}
</style>
