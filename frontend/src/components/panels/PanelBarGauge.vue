<template>
  <GrafanaFrame
    dashboardUid="d9f67190-0bf2-4553-b0e9-760c8bf7542e"
    :panelId="4"
    slug="dashboardtest"
    :orgId="1"
    :base="'http://127.0.0.1:5000'"
    theme="light"
    :debug="true"
  ></GrafanaFrame>
</template>

<script setup>
import GrafanaFrame from '../GrafanaFrame.vue'
</script>
