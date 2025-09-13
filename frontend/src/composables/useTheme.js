import { ref, computed, watchEffect, onMounted } from 'vue'

const THEME_KEY = 'app-theme' // 'light' | 'dark' | 'adaptive'
const theme = ref(localStorage.getItem(THEME_KEY) || 'adaptive')

// system prefers dark?
let mq
const systemDark = ref(false)
if (typeof window !== 'undefined' && window.matchMedia) {
  mq = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mq.matches
}

function setTheme(v) {
  theme.value = v
  localStorage.setItem(THEME_KEY, v)
}

function initThemeListeners() {
  if (!mq) return
  const handler = (e) => { systemDark.value = e.matches }
  try {
    mq.addEventListener ? mq.addEventListener('change', handler)
                        : mq.addListener(handler)
  } catch {}
}

// the single boolean every component can rely on
const isDark = computed(() =>
  theme.value === 'dark' || (theme.value === 'adaptive' && systemDark.value)
)

function applyDomClass() {
  const el = document.documentElement // or document.body
  if (!el) return
  el.classList.toggle('dark', isDark.value)
}

export function useTheme() {
  onMounted(() => {
    initThemeListeners()
    applyDomClass()
  })

  // reflect change to the DOM class automatically
  watchEffect(() => {
    applyDomClass()
  })

  return {
    theme,       // 'light' | 'dark' | 'adaptive'
    isDark,      // boolean for components to style conditionally
    setTheme,    // call to change it
  }
}