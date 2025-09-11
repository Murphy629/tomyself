<template>
    <h1>Panel Editor</h1>
    <p>This is the panel editor content.</p>
</template>

<script setup>
// import ServiceStatus from '../components/ServiceStatus.vue'


import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Panel Editor'
})
</script>