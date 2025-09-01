<template>
  <h1>Service Status</h1>
  <div style="max-width:600px; margin:2rem auto; font-family:sans-serif;">
    <!-- <h2 style="margin-bottom:1rem;">Service Status</h2> -->

    <table style="width:100%; border-collapse:collapse; text-align:left;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:.5rem; border:1px solid #ddd;">Service</th>
          <th style="padding:.5rem; border:1px solid #ddd; width:120px;">Port</th>
          <th style="padding:.5rem; border:1px solid #ddd; width:140px;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in services" :key="s.key">
          <td style="padding:.5rem; border:1px solid #ddd;">{{ s.label }}</td>
          <td style="padding:.5rem; border:1px solid #ddd;">
            {{ s.port ?? '—' }}
          </td>
          <td style="padding:.5rem; border:1px solid #ddd;">
            <span v-if="s.ok">✅ success</span>
            <span v-else-if="s.ok === false">❌ failure</span>
            <span v-else>…checking</span>
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="checkAll" style="margin-top:1rem; padding:.4rem .8rem; border:1px solid #ccc; border-radius:4px; cursor:pointer;">
      Refresh
    </button>
  </div>


<iframe src="http://localhost:5000/d-solo/null?orgId=1&from=1756717370677&to=1756727339908&panelId=123124" width="450" height="200" frameborder="0"></iframe>

</template>

<script setup>
import { reactive, onMounted } from 'vue';

// Use vite proxy: /backend → http://localhost:${BACKEND_PORT}
const BASE = '/backend/test-connection';

const services = reactive([
  { key: 'backend', label: 'Backend', path: '/backend-status', ok: null, port: null },
  { key: 'mysql', label: 'MySQL', path: '/mysql-status', ok: null, port: null },
  { key: 'influx', label: 'InfluxDB', path: '/influx-status', ok: null, port: null },
  { key: 'influxWrite', label: 'InfluxDB Write', path: '/influx-write-test', ok: null, port: null, method: 'POST' },
  { key: 'grafana', label: 'Grafana', path: '/grafana-status', ok: null, port: null },
]);

async function checkOne(s) {
  try {
    const res = await fetch(BASE + s.path, { method: s.method || 'GET' });
    const data = await res.json();
    s.ok = res.ok && data.status;
    s.port = data.port ?? null;
  } catch {
    s.ok = false;
    s.port = null;
  }
}

async function checkAll() {
  services.forEach(s => { s.ok = null; s.port = null; });
  await Promise.all(services.map(s => checkOne(s)));
}

onMounted(checkAll);
</script>