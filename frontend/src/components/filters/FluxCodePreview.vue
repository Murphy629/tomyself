<template>
  <div class="box">
    <h3 class="title">Flux Code Preview</h3>
    <pre class="code"><code>{{ flux }}</code></pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{ flux: string }>()
</script>

<style scoped>
.box{margin-top:12px}
.title{margin:0 0 8px 0;color:#2a3446;font-weight:800}
.code{white-space:pre-wrap;background:#fff;border:1px solid #e3efff;border-radius:12px;padding:12px;color:#0b1220}
</style>
