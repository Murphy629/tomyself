<template>
  <div class="status-container">
    <h2 class="title">Service Status</h2>

    <table class="status-table">
      <thead>
        <tr>
          <th>Service</th>
          <th>Port</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in services" :key="s.key">
          <td>{{ s.label }}</td>
          <td>{{ s.port ?? '—' }}</td>
          <td>
            <span v-if="s.ok" class="status success">✅ success</span>
            <span v-else-if="s.ok === false" class="status failure">❌ failure</span>
            <span v-else class="status checking">…checking</span>
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="checkAll" class="refresh-btn">
      Refresh
    </button>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
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

<style scoped>
.status-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1rem 1.5rem;
  font-family: "Segoe UI", Tahoma, sans-serif;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  color: #333;
}

.status-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.status-table thead {
  background: #f7f7f9;
}

.status-table th,
.status-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 0.95rem;
}

.status-table tr:hover td {
  background: #fafafa;
}

.status {
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.status.success {
  background: #e6f9ec;
  color: #2e7d32;
}

.status.failure {
  background: #fdecea;
  color: #c62828;
}

.status.checking {
  background: #fff8e1;
  color: #b26a00;
}

.refresh-btn {
  display: block;
  margin: 1.2rem auto 0;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 6px;
  background: #1976d2;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.refresh-btn:hover {
  background: #1565c0;
}
</style>