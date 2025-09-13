<template>
  <div class="sidebar-wrapper">
<aside
      class="sidebar"
      :class="{ collapsed, dark: isDark }"
      :style="{ width: actualWidth + 'px' }"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      :aria-expanded="(!collapsed).toString()"
    >
      <!-- Brand + collapse toggle (stays in expanded; also fine in collapsed) -->
      <div class="brand">
        <div class="brand-left">
          <div class="brand-logo">BI</div>
          <div class="brand-name">BetterInflux</div>
        </div>
      </div>

      <!-- Content -->
      <div class="scroll">
        <div class="section-title">Navigation</div>

        <div class="nav-scroll">
          <nav class="nav">
            <RouterLink
              v-for="item in items"
              :key="item.label"
              class="nav-item"
              :class="{ active: isActive(item) }"
              :to="item.to"
              :title="collapsed ? item.label : ''"
            >
              <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="item.icon" fill="currentColor" />
              </svg>
              <span class="nav-label">{{ item.label }}</span>
            </RouterLink>
          </nav>
        </div>

        <div class="user-card" :title="collapsed ? 'Guest (Viewer)' : ''">
          <div class="avatar">😊</div>
          <div class="user-text">
            <div class="user-name">Guest</div>
            <div class="user-role">Viewer</div>
          </div>
        </div>

        <div class="theme-selector">
          <ThemeSwitch v-model="theme" :size="'sm'" @change="onThemeChange" />
        </div>

        <br>
      </div>

      <!-- Resize handle (hidden when collapsed) -->
      <div
        class="resize-handle"
        title="Drag to resize"
        @mousedown="onMouseDown"
        v-show="!collapsed"
      />

      <!-- ALWAYS-VISIBLE edge toggle -->
      <button
        class="edge-toggle"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="collapsed ? 'Expand' : 'Collapse'"
        @click="toggleCollapse"
      >
        <svg viewBox="0 0 24 24" class="edge-chev" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ThemeSwitch from './ThemeSwitch.vue'

// Theme handling
const THEME_KEY = 'bi.theme.mode'
const theme = ref('adaptive') // 'light' | 'dark' | 'adaptive'

// Track system preference for 'adaptive' mode
const SYSTEM_MQ = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
const systemPrefersDark = ref(SYSTEM_MQ ? SYSTEM_MQ.matches : false)
if (SYSTEM_MQ) {
  const handler = (e) => { systemPrefersDark.value = e.matches }
  try { SYSTEM_MQ.addEventListener ? SYSTEM_MQ.addEventListener('change', handler) : SYSTEM_MQ.addListener(handler) } catch {}
}

const isDark = computed(() => theme.value === 'dark' || (theme.value === 'adaptive' && systemPrefersDark.value))

function applyTheme() {
  // Persist and expose to document for potential global use
  try { localStorage.setItem(THEME_KEY, theme.value) } catch {}
  const root = document.documentElement
  if (root) {
    // convenience attribute other parts can use
    root.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }
}

const onThemeChange = () => { applyTheme() }

// Initialize from storage on mount
onMounted(() => {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'adaptive') theme.value = saved
  } catch {}
  applyTheme()
})

const route = useRoute()

const items = [
  { label: 'Home',           to: '/',               icon: 'M3 12L12 3l9 9v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z' },
  { label: 'Panel Editor',   to: '/panel-editor',   icon: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 8v-8h8v8z' },
  { label: 'Data Formula',   to: '/data-formula',   icon: 'M5 5h14v2H7v5h5a5 5 0 1 1 0 10h-2v-2h2a3 3 0 1 0 0-6H5z' },
  { label: 'Organizer',      to: '/organizer',      icon: 'M3 6h6l2 2h10v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { label: 'Diagnosis Panel',to: '/diagnostics',    icon: 'M7 5v6a5 5 0 1 0 10 0V5h-2v6a3 3 0 1 1-6 0V5zM18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { label: 'Admin Panel',    to: '/admin-panel',    icon: 'M7 5v6a5 5 0 1 0 10 0V5h-2v6a3 3 0 1 1-6 0V5zM18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { label: 'Data Import',    to: '/data-import',    icon: 'M12 3l5 5h-3v6h-4V8H7l5-5zM5 19h14v2H5z' },
  { label: 'About',          to: '/about',          icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 7h-2V7h2v2zm0 8h-2v-6h2v6z' },
  { label: 'Settings',       to: '/settings',       icon: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8 4a6.9 6.9 0 0 0-.1-1l2-1.5-2-3.5-2.3.9a7.3 7.3 0 0 0-1.7-1L13 2h-4l-.9 2.9a7.3 7.3 0 0 0-1.7 1L3.9 6l-2 3.5L4 11a6.9 6.9 0 0 0 0 2l-2.1 1.5 2 3.5 2.5-.9c.5.4 1.1.8 1.7 1L9 22h4l.9-2.9c.6-.2 1.2-.6 1.7-1l2.5.9 2-3.5L19.9 13c.1-.3.1-.7.1-1z' },
]

const isActive = (item) => (item.to === '/' ? route.path === '/' : route.path.startsWith(item.to))

// Resize + Collapse
const MIN_W = 220
const MAX_W = 360
const COLLAPSED_W = 64

const sidebarWidth = ref(260)
const collapsed = ref(false)
const dragging = ref(false)

const actualWidth = computed(() => (collapsed.value ? COLLAPSED_W : sidebarWidth.value))

function toggleCollapse() {
  collapsed.value = !collapsed.value
  try { localStorage.setItem('bi.sidebar.collapsed', collapsed.value ? '1' : '0') } catch {}
}

// restore persisted state
try {
  const saved = localStorage.getItem('bi.sidebar.collapsed')
  if (saved === '1') collapsed.value = true
} catch {}

const onMouseDown = (e) => {
  if (collapsed.value) return
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
  if (!dragging.value || collapsed.value) return
  const newW = Math.min(MAX_W, Math.max(MIN_W, e.clientX))
  sidebarWidth.value = newW
}
</script>

<style scoped>
/* Light/dark variables scoped to the sidebar */
.sidebar {
  --bg: #ffffff;
  --muted: #eef2f7;   /* hover/soft surfaces */
  --text: #111827;
  --subtle: #6b7280;
  --primary: #2f6fed;
  --border: #e5e7eb;
}
.sidebar.dark {
  --bg: #0f172a;      /* slate-900 */
  --muted: #1f2a44;    /* darker hover */
  --text: #e5e7eb;     /* slate-200 */
  --subtle: #9aa3af;   /* slate-400 */
  --primary: #8ab4ff;  /* softer blue on dark */
  --border: #334155;   /* slate-700 */
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  /* border-right: 1px dotted rgb(183,183,183); */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width .2s ease;
  /* Needed for edge toggle absolute positioning */
  position: sticky; /* keep in view */
}

/* Brand row */
.brand { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 12px 8px; }
.brand-left { display:flex; align-items:center; gap:12px; }
.brand-logo { width:36px; height:36px; border-radius:10px; background: rgb(53,53,255); color:#fff; display:grid; place-items:center; font-weight:800; }
.brand-name { font-size:18px; font-weight:700; }

.collapse-btn {
  width:28px; height:28px; border:1px solid var(--border); border-radius:8px;
  background:#fff; color:#405675; cursor:pointer; display:grid; place-items:center;
  transition: transform .15s ease, background .15s ease, border .15s ease;
}
.collapse-btn:hover { background:#eef2f8; border-color:#cbd5e1; }
.chev { width:18px; height:18px; transform: rotate(180deg); transition: transform .2s ease; }

/* Content areas */
.section-title { font-size:12px; padding:8px 8px; text-transform:uppercase; letter-spacing:.06em; }
.scroll { display:flex; flex-direction:column; height:100%; padding:8px; overflow:hidden; }
.nav-scroll { flex:1 1 auto; min-height:0; overflow-y:auto; }
.nav { display:grid; gap:4px; padding:4px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:10px 10px; color:var(--text); text-decoration:none; transition: background .15s ease, border .15s ease, transform .05s ease; }
.nav-item:hover { background: var(--muted); }
.nav-item.active {
  color: var(--primary);
  font-weight:600;
}
.sidebar:not(.collapsed) .nav-item.active {
  border-left: var(--primary) 3px solid;
}
.nav-icon { width:20px; height:20px; opacity:.85; }
.nav-item.active .nav-icon { opacity:1; }
.nav-label { font-size:16px; line-height:1; }
.theme-selector {
  margin-top: 8px;          /* spacing under user card */
  width: 100%;              /* take full available width like user-card */
  border: 1px solid var(--border);
  border-radius: 14px;      /* same radius as user-card */
  background: var(--bg);    /* follow theme background */
  display: flex;            /* center the switch */
  justify-content: center;
  align-items: center;
  box-sizing: border-box;   /* ensure padding doesn't overflow */
}
.user-card { flex:0 0 auto; display:flex; align-items:center; gap:12px; margin-top:auto; padding:12px; background: rgba(47,111,237,0.12); border:1px solid var(--border); border-radius:14px; }
.sidebar.dark .user-card { background: rgba(138,180,255,0.12); }
.avatar { width:36px; height:36px; border-radius:10px; background:var(--muted); display:grid; place-items:center; }
.user-text { line-height:1.1; }
.user-name { font-weight:600; }
.user-role { color:var(--subtle); font-size:12px; }

/* Resize handle */
.resize-handle {
  position: absolute; top:0; right:0; width:12px; height:100%;
  cursor: col-resize;
  background: linear-gradient(to right, transparent, transparent 70%, var(--border));
}
.resize-handle:hover { background: linear-gradient(to right, transparent, var(--border)); }

/* Collapsed visuals */
.sidebar.collapsed .brand-name,
.sidebar.collapsed .section-title,
.sidebar.collapsed .nav-label,
.sidebar.collapsed .theme-selector,
.sidebar.collapsed .user-text { display:none; }

.sidebar.collapsed .nav { justify-items:center; }
.sidebar.collapsed .nav-item { justify-content:center; gap:0; padding:10px 0; }
.sidebar.collapsed .user-card { justify-content:center; gap:0; padding:8px; background:transparent; border:none; }

/* Rotate chevrons by state */
.sidebar:not(.collapsed) .chev { transform: rotate(0deg); }

/* ===== ALWAYS-VISIBLE EDGE TOGGLE ===== */
.edge-toggle {
  position: absolute;
  top: calc(50% - 60px);
  transform: translateY(-50%);
  right: -10px;
  width: 24px;
  height: 56px;
  padding: 0;
  border: 1px solid var(--border);
  border-left: none;
  border-radius: 0 8px 8px 0;
  background: #FFD43B;
  color: #405675;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
  z-index: 10;
  transition: background .15s ease, border .15s ease, transform .15s ease;
}
.edge-toggle:hover {
  background: #FFC107;
  border-color: #e0a800;
}

.edge-chev { width:14px; height:14px; transition: transform .2s ease; }
/* When collapsed, arrow points right (expand); when expanded, arrow points left (collapse) */
.sidebar.collapsed .edge-chev { transform: rotate(0deg); }      /* ➤ */
.sidebar:not(.collapsed) .edge-chev { transform: rotate(180deg);}/* ◀ */
</style>
