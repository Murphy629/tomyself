<template>
  <div v-panel-card><!-- Stat 可更矮：style="--panel-h: 300px" -->
    <GrafanaFrame
      dashboardUid="d9f67190-0bf2-4553-b0e9-760c8bf7542e"
      :panelId="3"
      slug="dashboardtest"
      :orgId="1"
      :base="'http://127.0.0.1:5000'"
      theme="light"
      :debug="true"
    />
  </div>
</template>

<script setup lang="ts">
import GrafanaFrame from '../GrafanaFrame.vue'
</script>
