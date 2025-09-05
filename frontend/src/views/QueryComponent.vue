<template>
  <div class="query-page">
    <h1 class="title">Query Builder</h1>

    <!-- 引入 QueryFilter 组件 -->
    <QueryFilter :fields="availableFields" @run-query="handleRunQuery" />
  </div>
</template>

<script setup lang="ts">
import QueryFilter from '../components/QueryFilter.vue'

// 示例：可选字段（实际应从后端/InfluxDB API 动态获取）
const availableFields = ['temperature', 'humidity', 'pressure', 'location']

function handleRunQuery(payload: any) {
  console.log('收到查询条件:', payload)
  // 这里可以调用 API，或者传给子组件做图表展示
}
</script>

<style scoped>
.query-page {
  padding: 20px;
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #2c73ff;
  margin-bottom: 20px;
}
</style>
