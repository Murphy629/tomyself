<template>
  <div class="status-container">
    <h2 class="title">Service Status</h2>

    <table class="status-table">
      <thead>
        <tr>
          <th>Service</th>
          <th>Port</th>
          <th>Status</th>
          <th>Latency</th>
          <th>Details</th>
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
          <td>
            <span v-if="s.timeMs != null">{{ s.timeMs }} ms</span>
            <span v-else>—</span>
          </td>
          <td>
            <button class="small-btn" @click="toggleDetails(s)" :disabled="s.ok == null && !s.error">
              {{ isExpanded(s) ? 'Hide' : 'Show' }}
            </button>
          </td>
        </tr>

        <!-- Expanded details row -->
        <tr v-for="s in services" :key="s.key + '-details'" v-show="expanded.has(s.key)">
          <td colspan="5" class="details-cell">
            <div v-if="s.key === 'grafana' && s.data?.baseUrl" class="grafana-link">
              <a :href="s.data.baseUrl" target="_blank" rel="noopener noreferrer">Open Grafana ({{ s.data.baseUrl }})</a>
            </div>
            <pre class="pre-json" v-if="s.data">{{ pretty(s.data) }}</pre>
            <pre class="pre-json error" v-else-if="s.error">{{ s.error }}</pre>
            <span v-else class="muted">No details</span>
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
  { key: 'backend',     label: 'Backend',         path: '/backend-status',       ok: null, port: null, data: null, error: null, timeMs: null },
  { key: 'mysql',       label: 'MySQL',           path: '/mysql-status',         ok: null, port: null, data: null, error: null, timeMs: null },
  { key: 'influx',      label: 'InfluxDB',        path: '/influx-status',        ok: null, port: null, data: null, error: null, timeMs: null },
  { key: 'influxWrite', label: 'InfluxDB Write',  path: '/influx-write-test',    ok: null, port: null, data: null, error: null, timeMs: null, method: 'POST' },
  { key: 'grafana',     label: 'Grafana',         path: '/grafana-status',       ok: null, port: null, data: null, error: null, timeMs: null },
]);

async function checkOne(s) {
  try {
    const start = performance.now();
    const res = await fetch(BASE + s.path, { method: s.method || 'GET' });
    const data = await res.json();
    s.timeMs = Math.max(0, Math.round(performance.now() - start));
    s.ok = res.ok && data.status;
    s.port = data.port ?? null;
    s.data = data;
    s.error = null;
  } catch (e) {
    s.ok = false;
    s.port = null;
    s.data = null;
    s.timeMs = null;
    s.error = e?.message || String(e);
  }
}

async function checkAll() {
  services.forEach(s => { s.ok = null; s.port = null; s.data = null; s.error = null; s.timeMs = null; });
  await Promise.all(services.map(s => checkOne(s)));
}

onMounted(checkAll);

// Expand/collapse details handling
const expanded = reactive(new Set());
function toggleDetails(s) {
  if (expanded.has(s.key)) expanded.delete(s.key); else expanded.add(s.key);
}
function isExpanded(s) { return expanded.has(s.key); }
function pretty(obj) { try { return JSON.stringify(obj, null, 2); } catch { return String(obj); } }
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

.small-btn {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.small-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.details-cell { background: #fcfcff; }
.pre-json { margin: 0.5rem 0; padding: 0.75rem; background: #f6f8fa; border: 1px solid #eee; border-radius: 8px; max-height: 320px; overflow: auto; }
.pre-json.error { background: #fff5f5; border-color: #ffd5d5; color: #8b0000; }
.muted { color: #8a8a8a; }
.grafana-link { margin-top: 4px; }
.grafana-link a { color: #1976d2; text-decoration: none; }
.grafana-link a:hover { text-decoration: underline; }

/* ===== Dark Mode (global .dark on <html> or <body>) ===== */
.dark .status-container {
  background: #0f172a;           /* slate-900-ish */
  color: #e5e7eb;                /* text */
  box-shadow: 0 4px 12px rgba(0,0,0,0.45);
}

.dark .title {
  color: #e5e7eb;
}

.dark .status-table {
  color: #e5e7eb;
}

.dark .status-table thead {
  background: #111827;           /* slate-900/800 */
}

.dark .status-table th,
.dark .status-table td {
  border-bottom: 1px solid #1f2937; /* slate-800 */
}

.dark .status-table tr:hover td {
  background: #0b1220;           /* subtle hover */
}

.dark .status {
  /* keep font-weight; colors per state below */
}

.dark .status.success {
  background: rgba(16,185,129,0.12); /* emerald tint */
  color: #34d399;
}

.dark .status.failure {
  background: rgba(239,68,68,0.12);  /* red tint */
  color: #f87171;
}

.dark .status.checking {
  background: rgba(234,179,8,0.12);  /* amber tint */
  color: #fbbf24;
}

.dark .refresh-btn {
  background: #2563eb;               /* blue-600 */
  color: #e5e7eb;
}

.dark .refresh-btn:hover {
  background: #1d4ed8;               /* blue-700 */
}

.dark .small-btn {
  background: #111827;               /* tile bg */
  border-color: #374151;             /* slate-700 */
  color: #e5e7eb;
}

.dark .small-btn:disabled {
  opacity: 0.6;
}

.dark .details-cell {
  background: #0b1220;
}

.dark .pre-json {
  background: #0f172a;
  border-color: #1f2937;
  color: #e5e7eb;
}

.dark .pre-json.error {
  background: #17111a;               /* muted dark red-ish */
  border-color: #5b1f28;
  color: #fca5a5;
}

.dark .muted {
  color: #9ca3af;
}

.dark .grafana-link a {
  color: #60a5fa;                    /* blue-400 */
}

.dark .grafana-link a:hover {
  text-decoration: underline;
}
</style>
