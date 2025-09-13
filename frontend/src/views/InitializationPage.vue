<template>
  <MenuBar />
  <div class="init-page">
    <div class="card" role="group" aria-label="Role selection">
      <header class="header">
        <h1>Please select your role</h1>
        <p class="sub">You can change this later in Settings later.</p>
      </header>

      <div
        class="choices"
        @keydown.left.prevent="move(-1)"
        @keydown.right.prevent="move(1)"
        @keydown.enter.prevent="onContinue"
      >
        <button
          v-for="(r, i) in roles"
          :key="r.key"
          class="choice"
          :class="{ selected: r.key === selected }"
          type="button"
          :aria-pressed="r.key === selected"
          @click="selected = r.key"
        >
          <span class="icon" aria-hidden="true" v-html="r.icon"></span>
          <span class="label">{{ r.label }}</span>
        </button>
      </div>

      <footer class="footer">
        <!-- <div class="dots" aria-hidden="true">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div> -->

        <button
          class="continue"
          type="button"
          :disabled="!selected"
          @click="onContinue"
        >
          Continue
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MenuBar from '../components/MenuBar.vue';

onMounted(() => {
  document.title = "Welcome - Select your role";
})

type RoleKey = 'general' | 'advanced' | 'dev'

const roles: { key: RoleKey; label: string; icon: string }[] = [
  {
    key: 'general',
    label: 'General users',
    icon: `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" stroke="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"/>
        <path fill="currentColor" stroke="currentColor" d="M20 20a8 8 0 1 0-16 0"/>
      </svg>
    `,
  },
  {
    key: 'advanced',
    label: 'Advanced user',
    icon: `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" stroke="currentColor" d="M12 3l2.5 4.5L20 9l-5.5 2.5L12 16l-2.5-4.5L4 9l5.5-1.5Z"/>
        <circle fill="currentColor" stroke="currentColor" cx="12" cy="12" r="2.5"/>
      </svg>
    `,
  },
  {
    key: 'dev',
    label: 'Dev',
    icon: `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" stroke="currentColor" d="m8 8-4 4 4 4"/>
        <path fill="currentColor" stroke="currentColor" d="m16 8 4 4-4 4"/>
        <path fill="currentColor" stroke="currentColor" d="M10 20 14 4"/>
      </svg>
    `,
  },
]

const selected = ref<RoleKey | null>(null)

// Emits the selection so parent can route/store if desired.
// If you don't use emits, replace with your own navigation.
const emit = defineEmits<{ (e: 'continue', role: RoleKey): void }>()

function move(dir: -1 | 1) {
  const idx = roles.findIndex(r => r.key === selected.value)
  const next =
    idx === -1
      ? (dir === -1 ? roles.length - 1 : 0)
      : (idx + dir + roles.length) % roles.length
  selected.value = roles[next].key
}

function onContinue() {
  if (!selected.value) return
  emit('continue', selected.value)
  // For demo: simple visual feedback
  // You can replace with router.push(...) if you want to navigate.
  // e.g., router.push(`/onboarding/${selected.value}`)
  alert(`Selected: ${selected.value}`)
}
</script>

<style scoped>
/* Layout */
.init-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #5b54eb 0%, #f6b23b 0%, #43bfd4 100%);
}

.card {
  width: 100%;
  max-width: 760px;
  background: #fff;
  border-radius: 18px;
  box-shadow:
    0 10px 30px rgba(28, 58, 170, 0.10),
    0 2px 8px rgba(16, 24, 40, 0.06);
  padding: 40px 36px 28px;
  box-sizing: border-box;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 28px;
}
.header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.25;
  color: #0f172a;
  font-weight: 700;
}
.sub {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Choices */
.choices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 8px 0 22px;
}

.choice {
  appearance: none;
  border: 2px solid #eef2ff;
  background: #fafbff;
  border-radius: 14px;
  padding: 22px 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
  outline: none;
  position: relative;
}
.choice:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(28, 58, 170, 0.12);
}
.choice:focus-visible {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
}

.choice .icon {
  display: inline-flex;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eef4ff;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.choice .icon svg {
  width: 28px;
  height: 28px;
  fill: #3b82f6;
  stroke: #3b82f6;
  stroke-width: 1.5;
}

.choice .label {
  display: block;
  font-weight: 600;
  color: #000000;
  letter-spacing: 0.2px;
}

.dark .choice .label {
  color: #e5e7eb;
}


/* Selected state */
.choice.selected {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow:
    0 12px 24px rgba(59, 130, 246, 0.18),
    0 0 0 1px rgba(59, 130, 246, 0.10) inset;
}
.choice.selected .icon {
  background: rgba(59, 130, 246, 0.10);
}

/* Footer */
.footer {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
}

.dots {
  display: inline-flex;
  gap: 8px;
  justify-self: center;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e7eb;
}
.dot.active {
  background: #3b82f6;
}

.continue {
  min-width: 140px;
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.24);
}
.continue:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.28);
}
.continue:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .card { padding: 28px 18px 22px; }
  .choices { grid-template-columns: 1fr; }
}

/* =========================
   Dark Mode (global `.dark`)
   ========================= */
.dark .init-page {
  /* match your app's dark aesthetic used on auth pages */
  background: linear-gradient(135deg, #391a78 0%, #af5e20 0%, #0f4170 100%);
  color: #e5e7eb;
}

.dark .card {
  background: #070a13;
  border: 1px solid #1f2937;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.45),
    0 2px 8px rgba(0,0,0,0.35);
}

.dark .header h1 {
  color: #e5e7eb;
}
.dark .sub {
  color: #e4e4e4;
}

.dark .choices {
  /* no change to layout; colors handled per child */
}

.dark .choice {
  border-color: #1f2937;
  background: #101b2f;
  box-shadow: none;
}
.dark .choice:hover {
  box-shadow: 0 8px 18px rgba(0,0,0,0.45);
}
.dark .choice:focus-visible {
  box-shadow: 0 0 0 4px rgba(96,165,250,0.25);
}

.dark .choice .icon {
  background: #22304d;
}
.dark .choice .icon { color: #ffffff; }
.dark .choice .icon svg { fill: currentColor; stroke: currentColor; }

/* Selected */
.dark .choice.selected {
  background: #182543;
  border-color: #60a5fa;
  box-shadow:
    0 12px 24px rgba(96,165,250,0.22),
    0 0 0 1px rgba(96,165,250,0.18) inset;
}
.dark .choice.selected .icon {
  background: rgba(96,165,250,0.10);
}

/* Footer */
.dark .dot {
  background: #334155; /* slate-600 */
}
.dark .dot.active {
  background: #60a5fa;
}

.dark .continue {
  background: #2563eb;
  color: #e5e7eb;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.24);
}
.dark .continue:hover:enabled {
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.32);
}
.dark .continue:disabled {
  opacity: 0.6;
}
</style>