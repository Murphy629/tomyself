<template>
  <section class="tr-card">
    <h3 class="title">Time Range Picker</h3>

    <div class="row">
      <!-- Preset（左侧） -->
      <div class="cell preset">
        <button class="select" @click="toggle" type="button">
          <span>{{ presetLabel }}</span><span class="chev">▾</span>
        </button>
        <ul v-if="open" class="menu">
          <li v-for="p in presets" :key="p.value" class="item" @click="pick(p.value)">
            <span>{{ p.label }}</span><span v-if="p.value===preset" class="tick">✓</span>
          </li>
        </ul>
      </div>

      <!-- Start（中间） -->
      <input
        class="ipt"
        type="datetime-local"
        :disabled="preset !== 'custom'"
        v-model="draft.start"
      />

      <!-- End（右侧） -->
      <input
        class="ipt"
        type="datetime-local"
        :disabled="preset !== 'custom'"
        v-model="draft.end"
      />
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ preset: 'last_1h' }) }
})
const emit = defineEmits(['update:modelValue', 'change'])

const presets = [
  { value: 'last_15m', label: 'Last 15 minutes' },
  { value: 'last_1h',  label: 'Last 1 hour' },
  { value: 'last_6h',  label: 'Last 6 hours' },
  { value: 'last_24h', label: 'Last 24 hours' },
  { value: 'last_7d',  label: 'Last 7 days' },
  { value: 'last_30d', label: 'Last 30 days' },
  { value: 'custom',   label: 'Custom' }
]

const draft = reactive({
  preset: props.modelValue?.preset ?? 'last_1h',
  start: props.modelValue?.start ?? '',
  end: props.modelValue?.end ?? ''
})
const preset = computed({
  get: () => draft.preset,
  set: v => draft.preset = v
})
const presetLabel = computed(() => presets.find(p => p.value===preset.value)?.label || 'Custom')

const open = ref(false)
const toggle = () => (open.value = !open.value)
const pick = (val) => { preset.value = val; open.value = false }

const onDoc = (e) => { if (!e.target.closest('.preset')) open.value = false }
onMounted(() => document.addEventListener('click', onDoc))
onBeforeUnmount(() => document.removeEventListener('click', onDoc))

watch(draft, () => {
  const payload = preset.value === 'custom'
    ? { preset: 'custom', start: draft.start, end: draft.end }
    : { preset: preset.value }
  emit('update:modelValue', payload)
  emit('change', payload)
}, { deep: true })
</script>

<style scoped>
/* 卡片基础 */
.tr-card{
  border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#fff;
}

/* 三列：Preset | Start | End */
.row{
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* ← 三列等宽 */
  gap: 12px;
  align-items: center;
}

/* 防止 Safari 把控件撑破格子 */
.row > * { min-width: 0; }

.cell{ position:relative; min-width:0; }   /* 保险起见 */
.select{
  width:100%; height:36px; padding:0 10px;
  background:#fff; border:1px solid #d1d5db; border-radius:8px;
  display:flex; align-items:center; justify-content:space-between;
  box-sizing: border-box;
}
.menu{
  position:absolute; z-index:20; margin-top:6px; width:100%;
  background:#fff; border:1px solid #e5e7eb; border-radius:10px;
  box-shadow:0 10px 30px rgba(0,0,0,.08); max-height:240px; overflow:auto;
}
.item{ padding:8px 10px; display:flex; justify-content:space-between; cursor:pointer; }
.item:hover{ background:#f3f4f6; }

.ipt{
  display:block;               /* 防止 inline 产生奇怪间距 */
  width:100%;
  max-width:100%;
  min-width:0;                 /* ★ 防溢出 */
  height:36px;
  padding:0 10px;
  border:1px solid #d1d5db; border-radius:8px;
  box-sizing: border-box;
}
.ipt:disabled{ background:#f9fafb; color:#9ca3af; cursor:not-allowed; }

/* 保证 datetime-local 输入框里的文字垂直居中 */
.ipt {
  height: 40px;            /* 保持和下拉框一致的高度 */
  line-height: 40px;       /* 让文字跟随高度居中 */
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
}

/* 专门修正 Safari / Chrome 内部对齐问题 */
.ipt::-webkit-datetime-edit {
  padding: 0;              /* 去掉默认 padding */
  margin: auto 0;          /* 垂直居中 */
}

/* 小屏折行（可要可不要） */
@media (max-width: 900px){
  .row{ grid-template-columns: 1fr; }
}

</style>
