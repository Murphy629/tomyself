<template>
  <MenuBar />
  <ServiceStatus />
  <DefaultLayout1 />
  <AllGrafanaComponents />
</template>

<script setup>
import MenuBar from '../components/Menu.vue'
import ServiceStatus from '../components/ServiceStatus.vue'
import AllGrafanaComponents from '../views/AllGrafanaComponents.vue'
import DefaultLayout1 from '../views/DefaultLayout1.vue'

import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Simple & Elegant'
})
</script>
