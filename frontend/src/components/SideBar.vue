<template>
  <aside
    class="sidebar"
    :style="{ width: sidebarWidth + 'px' }"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!-- Brand -->
    <div class="brand">
      <div class="brand-logo">BI</div>
      <div class="brand-name">BetterInflux</div>
    </div>

    <div class="scroll">
      <div class="section-title">Navigation</div>

      <nav class="nav">
        <RouterLink
          v-for="item in items"
          :key="item.label"
          class="nav-item"
          :to="item.to"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="item.icon" fill="currentColor" />
          </svg>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User card (purely visual) -->
      <div class="user-card">
        <div class="avatar">😊</div>
        <div class="user-text">
          <div class="user-name">Guest</div>
          <div class="user-role">Viewer</div>
        </div>
      </div>
    </div>

    <!-- Resize handle -->
    <div
      class="resize-handle"
      title="Drag to resize"
      @mousedown="onMouseDown"
    />
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

// --- Sidebar items (icons are simple path strings to avoid extra deps) ---
const items = [
  { label: 'Home',           to: '/',               icon: 'M3 12L12 3l9 9v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z' },
  { label: 'Panel Editor',   to: '/panel-editor',   icon: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 8v-8h8v8z' },
  { label: 'Data Formula',   to: '/data-formula',   icon: 'M5 5h14v2H7v5h5a5 5 0 1 1 0 10h-2v-2h2a3 3 0 1 0 0-6H5z' },
  { label: 'Organizer',      to: '/organizer',      icon: 'M3 6h6l2 2h10v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { label: 'Diagnosis panel',to: '/diagnostics',    icon: 'M7 5v6a5 5 0 1 0 10 0V5h-2v6a3 3 0 1 1-6 0V5zM18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { label: 'Data Import',    to: '/data-import',    icon: 'M12 3l5 5h-3v6h-4V8H7l5-5zM5 19h14v2H5z' },
  { label: 'About',          to: '/about',          icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 7h-2V7h2v2zm0 8h-2v-6h2v6z' },
  { label: 'Settings',       to: '/settings',       icon: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8 4a6.9 6.9 0 0 0-.1-1l2-1.5-2-3.5-2.3.9a7.3 7.3 0 0 0-1.7-1L13 2h-4l-.9 2.9a7.3 7.3 0 0 0-1.7 1L3.9 6l-2 3.5L4 11a6.9 6.9 0 0 0 0 2l-2.1 1.5 2 3.5 2.5-.9c.5.4 1.1.8 1.7 1L9 22h4l.9-2.9c.6-.2 1.2-.6 1.7-1l2.5.9 2-3.5L19.9 13c.1-.3.1-.7.1-1z' },
]

// --- Resize (UI only) ---
const MIN_W = 220
const MAX_W = 360
const sidebarWidth = ref(260)
const dragging = ref(false)

const onMouseDown = (e) => {
  e.preventDefault()
  dragging.value = true
  document.body.style.userSelect = 'none'
}
const onMouseUp = () => {
  if (!dragging.value) return
  dragging.value = false
  document.body.style.userSelect = ''
}
const onMouseMove = (e) => {
  if (!dragging.value) return
  const newW = Math.min(MAX_W, Math.max(MIN_W, e.clientX))
  sidebarWidth.value = newW
}
</script>

<style scoped>
/* Light look that matches your reference image */
:root {
  --bg: #ffffff;
  --muted: #f3f5f8;
  --text: #111827;
  --subtle: #6b7280;
  --primary: #2f6fed;
  --card: #f5f7fb;
  --border: #e5e7eb;
}

.sidebar {
  position: relative;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 8px 16px;
}
.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
}
.brand-name {
  font-size: 18px;
  font-weight: 700;
}

.scroll {
  overflow-y: auto;
  padding: 8px 8px 16px 8px;
  height: 100%;
}

.section-title {
  font-size: 12px;
  color: var(--subtle);
  padding: 8px 8px;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.nav {
  display: grid;
  gap: 4px;
  padding: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 12px;
  color: var(--text);
  text-decoration: none;
}
.nav-item:hover,
.nav-item.router-link-active {
  background: var(--muted);
}
.nav-icon {
  width: 20px;
  height: 20px;
  opacity: .85;
}
.nav-label {
  font-size: 14px;
  line-height: 1;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 8px;
  padding: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--muted);
  display: grid;
  place-items: center;
}
.user-text { line-height: 1.1; }
.user-name { font-weight: 600; }
.user-role { color: var(--subtle); font-size: 12px; }

/* Resize handle */
.resize-handle {
  position: absolute;
  top: 0; right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  background: linear-gradient(to right, transparent, transparent 70%, var(--border));
}
.resize-handle:hover { background: linear-gradient(to right, transparent, var(--border)); }
</style>