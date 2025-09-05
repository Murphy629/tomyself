<template>
  <div class="box">
    <div class="tabs">
      <button class="tab" :class="{active:mode==='line'}" @click="mode='line'">Line</button>
      <button class="tab" :class="{active:mode==='bar'}"  @click="mode='bar'">Bar</button>
      <button class="tab" :class="{active:mode==='pie'}"  @click="mode='pie'">Pie</button>
    </div>
    <!-- 简易占位预览（后续可换成 ECharts/Chart.js） -->
    <div class="preview">
      <div class="hint">Preview ({{ mode }})</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ data?: any[] }>()
const mode = ref<'line'|'bar'|'pie'>('line')
</script>

<style scoped>
.box{border:1px solid #e3efff;background:#fff;border-radius:14px;padding:12px}
.tabs{display:flex;gap:8px;margin-bottom:8px}
.tab{border:1px solid #cfe3ff;background:#fff;border-radius:10px;padding:6px 12px;cursor:pointer}
.tab.active{background:#2c73ff;color:#fff;border-color:#2c73ff}
.preview{height:160px;border:1px dashed #cfe3ff;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(#f8fbff,#eef5ff)}
.hint{color:#5e6b85}
</style>
