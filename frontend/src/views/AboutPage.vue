<template>
  <div class="page">
    <div class="fade-slide appear" style="--d: 60ms">
      <h1>About Us</h1>
      <p>Put your content here.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'BetterInflux - About Us'
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