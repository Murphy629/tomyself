<template>
    <h1>Admin Panel</h1>
    <p>This is the admin panel content.</p>
</template>

<script setup>
// import ServiceStatus from '../components/ServiceStatus.vue'


import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Admin Panel'
})
</script>