<template>
  <!-- <MenuBar /> -->
  <div class="mode-select-page">
    <div class="mode-card" role="group" aria-label="Mode selection">
      <header class="mode-header">
        <h1>Select what you want to do</h1>
        <p class="mode-sub">You can always change this later in Settings.</p>
      </header>

      <div
        class="mode-choices"
        @keydown.left.prevent="navigate(-1)"
        @keydown.right.prevent="navigate(1)"
        @keydown.enter.prevent="onEnter"
      >
        <button
          v-for="(mode, i) in modes"
          :key="mode.key"
          class="mode-choice"
          :class="{ selected: mode.key === selectedMode }"
          type="button"
          :aria-pressed="mode.key === selectedMode"
          @click="handleSelect(mode.key)"
        >
          <span class="icon" aria-hidden="true" v-html="mode.icon"></span>
          <span class="label">{{ mode.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MenuBar from '../components/MenuBar.vue'
import { useRouter } from 'vue-router'

onMounted(() => {
  document.title = 'BetterInflux - Select Mode'
})

const router = useRouter()

type ModeKey = 'edit' | 'create'

const modes: { key: ModeKey; label: string; icon: string }[] = [
  {
    key: 'edit',
    label: 'Edit existing panel',
    icon: `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" stroke="currentColor" d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.12L16.62 5.5a1.5 1.5 0 0 0-2.12 0L4 16v4Z"/>
        <path fill="currentColor" stroke="currentColor" d="M13.5 6.5 17.5 10.5"/>
      </svg>
    `,
  },
  {
    key: 'create',
    label: 'Create a new panel',
    icon: `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" stroke="currentColor" d="M12 4v16M4 12h16"/>
      </svg>
    `,
  },
]

const selectedMode = ref<ModeKey | null>(null)

function navigate(dir: -1 | 1) {
  const idx = modes.findIndex(m => m.key === selectedMode.value)
  const next =
    idx === -1
      ? (dir === -1 ? modes.length - 1 : 0)
      : (idx + dir + modes.length) % modes.length
  selectedMode.value = modes[next].key
}

function handleSelect(key: ModeKey) {
  selectedMode.value = key
  if (key === 'create') {
    // Redirect to the editor for creating a new panel
    router.push('/panel/edit')
  } else if (key === 'edit') {
    // For now, intentionally route to a non-existing path so catch-all NotFound handles it
    router.push('/__not_found__')
  }
}

function onEnter() {
  if (!selectedMode.value) return
  handleSelect(selectedMode.value)
}
</script>

<style scoped>
.mode-select-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
  /* background: linear-gradient(135deg, #5b54eb 0%, #f6b23b 0%, #43bfd4 100%); */
}

.mode-card {
    width: 640px;
    max-width: 640px;
    background: #fff;
    border-radius: 18px;
    box-shadow:
        0 10px 30px rgba(28, 58, 170, 0.10),
        0 2px 8px rgba(16, 24, 40, 0.06);
    padding: 36px 32px 28px;
}

.mode-header {
  text-align: center;
  margin-bottom: 24px;
}
.mode-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}
.mode-sub {
  color: #64748b;
  font-size: 14px;
}

.mode-choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 8px 0 22px;
}

.mode-choice {
  border: 2px solid #eef2ff;
  background: #fafbff;
  border-radius: 14px;
  padding: 22px 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}
.mode-choice:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(28, 58, 170, 0.12);
}
.mode-choice.selected {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow:
    0 12px 24px rgba(59, 130, 246, 0.18),
    0 0 0 1px rgba(59, 130, 246, 0.10) inset;
}
</style>