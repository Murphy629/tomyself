<template>
    <h1>Settings</h1>
    <p>This is the settings content.</p>
</template>

<script setup>
// import ServiceStatus from '../components/ServiceStatus.vue'


import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Settings'
})
</script>