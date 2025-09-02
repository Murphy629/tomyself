<template>
  <MenuBar />

  <ServiceStatus />
  <AllGrafanaComponents />

</template>

<script setup>
import GrafanaComponentTest from './components/GrafanaComponentTest.vue';
import MenuBar from './components/Menu.vue';
import ServiceStatus from './components/ServiceStatus.vue';
import AllGrafanaComponents from './views/AllGrafanaComponents.vue';

import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'BetterInflux - Simple & Elegant';
});
</script>