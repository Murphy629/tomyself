<!-- src/components/panel-editor/EmptyStateTemplates.vue -->
<template>
    <div class="empty-templates">
      <h2 class="et-title">Choose a default chart template</h2>
      <p class="et-subtitle">When no fields are selected, start by choosing a chart type.</p>
  
      <div class="et-grid">
        <button class="et-card" @click="$emit('select','timeseries')">
          <div class="et-card-title">Time series</div>
          <div class="et-card-desc">Line/area over time</div>
        </button>
  
        <button class="et-card" @click="$emit('select','stat')">
          <div class="et-card-title">Stat</div>
          <div class="et-card-desc">Single value card (last/mean, etc.)</div>
        </button>
  
        <button class="et-card" @click="$emit('select','gauge')">
          <div class="et-card-title">Gauge</div>
          <div class="et-card-desc">Dial with threshold ranges</div>
        </button>
  
        <button class="et-card" @click="$emit('select','table')">
          <div class="et-card-title">Table</div>
          <div class="et-card-desc">Tabular details / aggregated results</div>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  // 无需 props；点击卡片会 $emit('select', type)
  </script>
  
  <style scoped>
  .empty-templates { padding: 8px; }
  .et-title { font-size: 20px; font-weight: 800; margin: 8px 0; color: #111827; }
  .et-subtitle { color: #64748b; margin-bottom: 12px; }
  .et-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  
  .et-card {
    text-align: left;
    padding: 16px;
    border: 1px solid #e6e8ee;
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
  }
  .et-card:hover { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
  .et-card-title { font-weight: 800; font-size: 18px; color: #111827; }
  .et-card-desc { margin-top: 6px; color: #64748b; }
  </style>
  