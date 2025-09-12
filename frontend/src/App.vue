<template>
  <div class="app">
    <!-- Sidebar only if not on login/signup -->
    <SideBar v-if="showSidebar" />
    <main
      class="content"
      :class="{ 'no-padding': !showSidebar }"
    >
      <router-view />
    </main>
  </div>
</template>

<script setup>
import SideBar from './components/SideBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Show sidebar on all pages except login/signup
const showSidebar = computed(() => {
  return route.path !== '/login' && route.path !== '/signup'
})
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
body {
  overflow: hidden; /* prevent full-page scroll */
}
.app {
  display: flex;
  height: 100vh;
}

/* Right pane */
.content {
  flex: 1;
  background: rgb(245, 245, 245);
  height: 100vh;
  overflow: auto;
  padding: 16px;
}

/* Remove padding on login/signup pages */
.content.no-padding {
  padding: 0;
}
</style>