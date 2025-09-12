<template>
  <div class="page">
    <h1>About Us</h1>

    <!-- Theme switch -->
    <ThemeSwitch v-model="theme" @change="onThemeChange" />

    <p>Currently selected: {{ theme }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ThemeSwitch from '../components/ThemeSwitch.vue'

const theme = ref('adaptive') // 'light' | 'adaptive' | 'dark'

// function onThemeChange(newTheme) {
//   console.log('Theme switched to:', newTheme)
//   // Apply theme globally
//   if (newTheme === 'adaptive') {
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
//     document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'
//   } else {
//     document.documentElement.dataset.theme = newTheme
//   }
// }


</script>