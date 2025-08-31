<script setup>
import { ref, onMounted } from 'vue'

const backendResult = ref('checking...')
const grafanaUrl = '/grafana/'   // dev: via Vite proxy (and same path in prod via Nginx)

async function checkBackend() {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    const text = await res.text();
    // Try to pretty-print JSON if possible
    try {
      const obj = JSON.parse(text);
      backendResult.value = `HTTP ${res.status}\n` + JSON.stringify(obj, null, 2);
    } catch {
      backendResult.value = `HTTP ${res.status}\n${text}`;
    }
  } catch (err) {
    backendResult.value = `Error: ${err}`;
  }
}

onMounted(checkBackend)
</script>

<template>
  <div style="padding:1rem; max-width: 1000px; margin: auto;">
    <h2>Backend Connection Test</h2>
    <pre>{{ backendResult }}</pre>
    <button @click="checkBackend">Re-check</button>

    <h2 style="margin-top:2rem;">Grafana (via /grafana proxy)</h2>
    <iframe
      :src="grafanaUrl"
      style="width:100%; height:600px; border:1px solid #ccc; border-radius:8px;"
      title="Grafana"
    ></iframe>
    <p>If Grafana doesn’t appear, open directly: <a :href="grafanaUrl" target="_blank">/grafana</a></p>
  </div>
</template>