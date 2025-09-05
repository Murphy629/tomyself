<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-8">
      <!-- 标题 -->
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Query Builder
      </h2>

      <!-- 数据源选择 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bucket
        </label>
        <select
          v-model="bucket"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select bucket</option>
          <option v-for="b in buckets" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>

      <!-- Measurement -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Measurement
        </label>
        <select
          v-model="measurement"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select measurement</option>
          <option v-for="m in measurements" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <!-- Field 多选 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fields
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in fields"
            :key="f"
            @click="toggleField(f)"
            :class="[
              'px-3 py-1 rounded-full text-sm border transition',
              selectedFields.includes(f)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300'
            ]"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <!-- Filter 条件 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filters
        </label>
        <div v-for="(filter, index) in filters" :key="index" class="flex gap-2 mb-2">
          <input
            v-model="filter.key"
            type="text"
            placeholder="Field"
            class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
          <select
            v-model="filter.operator"
            class="w-28 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
          </select>
          <input
            v-model="filter.value"
            type="text"
            placeholder="Value"
            class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            @click="removeFilter(index)"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
        <button
          @click="addFilter"
          class="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Add Filter
        </button>
      </div>

      <!-- 生成查询按钮 -->
      <button
        @click="generateQuery"
        class="w-full rounded-lg bg-indigo-600 text-white py-2 px-4 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Generate Query
      </button>

      <!-- Flux 结果展示 -->
      <div
        v-if="fluxQuery"
        class="mt-6 rounded-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono text-sm text-gray-800 dark:text-gray-200"
      >
        <pre>{{ fluxQuery }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const bucket = ref('')
const measurement = ref('')
const buckets = ['BucketA', 'BucketB']
const measurements = ['CPU', 'Memory']
const fields = ['usage_user', 'usage_system', 'usage_idle']
const selectedFields = ref([])
const filters = ref([])

const fluxQuery = ref('')

const toggleField = (f) => {
  if (selectedFields.value.includes(f)) {
    selectedFields.value = selectedFields.value.filter(x => x !== f)
  } else {
    selectedFields.value.push(f)
  }
}

const addFilter = () => {
  filters.value.push({ key: '', operator: '=', value: '' })
}

const removeFilter = (index) => {
  filters.value.splice(index, 1)
}

const generateQuery = () => {
  fluxQuery.value = `
from(bucket: "${bucket.value}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "${measurement.value}")
  |> filter(fn: (r) => [${selectedFields.value.map(f => `"${f}"`).join(', ')}] |> contains(value: r._field))
  ${filters.value
    .map(f => `|> filter(fn: (r) => r.${f.key} ${f.operator} "${f.value}")`)
    .join('\n  ')}
  `
}
</script>
