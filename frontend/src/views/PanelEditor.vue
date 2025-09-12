<template>
  <div class="page-container">
    <h1>Panel Editor</h1>
    <p>This is the panel editor content.</p>
  </div>

</template>

<script setup>
// import ServiceStatus from '../components/ServiceStatus.vue'


import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Panel Editor'
})
</script>


<style scoped>
/* .page-container {
  padding: 16px;
  background-color: rgb(227, 227, 227);
} */
</style>