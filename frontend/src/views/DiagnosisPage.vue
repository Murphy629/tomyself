<template>
  <ServiceStatus />
</template>

<script setup>
import ServiceStatus from '../components/ServiceStatus.vue'


import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Diagnosis Panel'
})
</script>