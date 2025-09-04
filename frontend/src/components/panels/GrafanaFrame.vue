<template>
  <div class="grafana-frame">
    <iframe
      :src="src"
      style="width: 100%; height: 600px; border: 0"
      referrerpolicy="no-referrer-when-downgrade"
      allow="fullscreen"
    />
    <!-- 调试用：看到最终 URL，确定参数都对上；确认 OK 后可删 -->
    <pre v-if="debug" style="font-size:12px; margin-top:8px; overflow:auto">{{ src }}</pre>
  </div>
</template>

<script setup lang="ts">
// A tiny wrapper to embed a Grafana panel/dashboard via iframe.
// This does not expose any token in the browser.
// Use with a reverse-proxied path (/grafana/...) or a full URL (http://localhost:5000/...).

const props = defineProps<{
  // Example: 'abcd1234' (your dashboard UID)
  dashboardUid: string
  // If provided, embed a single panel; otherwise the whole dashboard.
  panelId?: number
  // 'light' | 'dark'
  theme?: 'light' | 'dark'
  // Optional: fullBase (e.g., 'http://localhost:5000'), default uses same-origin '/grafana'
  base?: string

  slug?: string
  /** orgId 数字，通常是 1 */
  orgId?: number
  /** 打开后会在面板下方显示最终 URL，便于排查 */
  debug?: boolean
}>()

const theme = props.theme ?? 'light'
const base = props.base ?? '/grafana'

const slug  = props.slug  ?? '_'          // 以前用 '_'，现在允许传真实 slug
const orgId = props.orgId ?? 1

/**
 * Build embed URL.
 * - Single panel: /grafana/d-solo/<uid>/_?panelId=2&theme=light
 * - Full dashboard (kiosk): /grafana/d/<uid>/_?kiosk=tv&theme=light
 */
const src = props.panelId
  ? `${base}/d-solo/${props.dashboardUid}/_?panelId=${props.panelId}&theme=${theme}`
  : `${base}/d/${props.dashboardUid}/_?kiosk=tv&theme=${theme}`
</script>

<style scoped>
.grafana-frame {
  width: 100%;
}
</style>