<template>
  <div class="app">
    <SideBar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/SideBar.vue'
</script>

<style>
html, body, #app { height: 100%; margin: 0; }
.app { display: flex; height: 100%; }
.content {
  flex: 1;
  background: var(--muted);
  /* The sidebar is fixed width; main just flexes. */
  overflow: auto;
}
</style>