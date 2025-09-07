<template>
  <div v-panel-card>
    <GrafanaFrame
      dashboardUid="d9f67190-0bf2-4553-b0e9-760c8bf7542e"
      :panelId="1"
      slug="dashboardtest"
      :orgId="1"
      :base="grafanaBase"
      theme="light"
      :debug="true"
    />
  </div>
</template>

<script setup lang="ts">
import GrafanaFrame from './GrafanaFrame.vue'

// Use the Vite proxy path so requests go through the dev server:
// /grafana → (proxied to) http://GRAFANA_HOST:GRAFANA_PORT
const grafanaBase = '/grafana'
</script>