<template>
  <div class="app">
    <SideBar v-if="showSidebar" />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/SideBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'   // ⬅️ add this

const route = useRoute()                // ⬅️ and this

const showSidebar = computed(() => {
  return route.path !== '/login' && route.path !== '/signup'
})
</script>

<style>
/* Replace your layout CSS */
html, body, #app { height: 100%; margin: 0; }
body { overflow: hidden; }          /* prevent page scroll */
.app { display: flex; height: 100vh; }  /* one viewport tall */
.content {
  flex: 1;
  background: rgb(245, 245, 245);
  height: 100vh;                   /* same as sidebar */
  overflow: auto;                  /* scrolls only the right pane */
  padding: 16px;
}

</style>