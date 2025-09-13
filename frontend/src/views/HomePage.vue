<template>
  <div class="page">

    <h1>Welcome back to BetterInflux - {user name}</h1>
    <Summary></Summary>


    <div class="fade-slide appear" style="--d: 60ms">
      <DefaultLayout1 />
      <!-- <QueryBuilderPage /> -->
      <!-- <AllGrafanaComponents /> -->
    </div>
  </div>
</template>

<script setup>
// import MenuBar from '../components/Menu.vue'
import ServiceStatus from '../components/ServiceStatus.vue'
import AllGrafanaComponents from './AllGrafanaComponents.vue'
import DefaultLayout1 from './DefaultLayout1.vue'
import QueryBuilderPage from './QueryBuilderPage.vue'
import Summary from '../components/Summary.vue'

import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Simple & Elegant'
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}


.fade-slide.appear {
  opacity: 0;
  transform: translateY(20px);
  animation: slideIn 0.6s ease forwards;
  animation-delay: var(--d, 0ms);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


@media (prefers-reduced-motion: reduce) {
  .fade-slide.appear {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>