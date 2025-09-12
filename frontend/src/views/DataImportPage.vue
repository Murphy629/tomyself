<template>
    <h1>Data Import Page</h1>
</template>

<script setup>
import ServiceStatus from '../components/ServiceStatus.vue'
import AllGrafanaComponents from './AllGrafanaComponents.vue'
import DefaultLayout1 from './DefaultLayout1.vue'
import QueryBuilderPage from './QueryBuilderPage.vue'

import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Data Import'
})
</script>