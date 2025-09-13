<template>
  <div class="app">
    <!-- Sidebar only if not on login/signup -->
    <div class="sidebar-wrapper">
        <SideBar v-if="showSidebar" />
    </div>

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
import { useTheme } from './composables/useTheme.js'
useTheme()

const route = useRoute()

// Show sidebar on all pages except login/signup
const showSidebar = computed(() => {
  return route.path !== '/login' && route.path !== '/signup' && route.path !== '/initialization'
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
  background: rgb(249, 250, 254);
  height: 100vh;
  overflow: auto;
  padding: 16px;
}


.dark .content {
  background: #181f2a;
  color: #f1f5f9;
}


.sidebar-wrapper {
  box-shadow: 2px 1px 10px rgba(0, 0, 0, 0.04);
  z-index: 2; /* ensures above content scroll */
}

/* Remove padding on login/signup pages */
.content.no-padding {
  padding: 0;
}



/* .sidebar-wrapper {
  padding: -10px;
}
 */


</style>