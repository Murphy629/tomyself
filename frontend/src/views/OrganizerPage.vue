<template>
    <h1>Organizer Page</h1>
    <p>This is the organizer page content.</p>
</template>

<script setup>
// import MenuBar from '../components/Menu.vue'
// import ServiceStatus from '../components/ServiceStatus.vue'
// import AllGrafanaComponents from './AllGrafanaComponents.vue'
// import DefaultLayout1 from './DefaultLayout1.vue'
// import QueryBuilderPage from './QueryBuilderPage.vue'

import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Organizer'
})
</script>