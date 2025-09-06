<template>
  <div class="page">
    <QueryFilterCard @change="onChange" />
  </div>
</template>

<script setup>
import QueryFilterCard from '../components/filters/QueryFilterCard.vue'
const onChange = (payload) => {
  // { bucket, measurement, field }
  console.log('[selected]', payload)
}
</script>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  padding: 24px;
}
</style>
