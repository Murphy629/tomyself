<template>
  <div v-panel-card><!-- 表格可稍高：style="--panel-h: 520px" -->
    <GrafanaFrame
      dashboardUid="d9f67190-0bf2-4553-b0e9-760c8bf7542e"
      :panelId="5"
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
