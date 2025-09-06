<template>
  <section class="cond-card">
    <h3 class="title">Condition Builder</h3>

    <div v-for="(c, idx) in draft" :key="idx" class="row">
      <!-- Key -->
      <div class="cell grow">
        <button class="select" @click="toggle(idx, 'key')" type="button">
          <span>{{ c.key || 'field' }}</span><span class="chev">▾</span>
        </button>
        <ul v-if="open.idx===idx && open.part==='key'" class="menu">
          <li v-for="k in availableKeys" :key="k" class="item" @click="pick(idx, 'key', k)">
            <span>{{ k }}</span><span v-if="k===c.key" class="tick">✓</span>
          </li>
          <li v-if="!availableKeys?.length" class="empty">No keys</li>
        </ul>
      </div>

      <!-- Operator -->
      <div class="cell op">
        <button class="select" @click="toggle(idx, 'op')" type="button">
          <span>{{ c.op }}</span><span class="chev">▾</span>
        </button>
        <ul v-if="open.idx===idx && open.part==='op'" class="menu">
          <li v-for="o in operators" :key="o" class="item" @click="pick(idx, 'op', o)">
            <span>{{ o }}</span><span v-if="o===c.op" class="tick">✓</span>
          </li>
        </ul>
      </div>

      <!-- Value -->
      <div class="cell grow">
        <!-- BETWEEN: 两个值 -->
        <div v-if="c.op==='BETWEEN'" class="between">
          <input class="ipt" type="text" :placeholder="'min'" v-model="draft[idx].value[0]" />
          <span class="sep">—</span>
          <input class="ipt" type="text" :placeholder="'max'" v-model="draft[idx].value[1]" />
        </div>

        <!-- IN: 逗号分隔 -->
        <input
          v-else-if="c.op==='IN'"
          class="ipt"
          type="text"
          :placeholder="'value1, value2, ...'"
          :value="(c.value || []).join(', ')"
          @input="onInInput(idx, $event.target.value)"
        />

        <!-- 其他：单值 -->
        <input
          v-else
          class="ipt"
          type="text"
          placeholder="value"
          v-model="draft[idx].value"
        />
      </div>

      <!-- 删除 -->
      <button class="remove" title="Remove" @click="remove(idx)">✕</button>
    </div>

    <button class="add" @click="add">+ Add Condition</button>
  </section>
</template>

<script setup>
import { reactive, watch, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  /** v-model: 条件数组 */
  modelValue: { type: Array, default: () => [] },
  /** 可选键（tag 或 field 名称），现在你可只传 tags */
  availableKeys: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'change'])

const operators = ['=', '!=', '>', '>=', '<', '<=', 'IN', 'BETWEEN']
// 内部草稿，避免直接改父状态
const draft = reactive(
  (props.modelValue?.length ? props.modelValue : [blank()]).map(normalize)
)

function blank () {
  return { key: '', op: '=', value: '' }
}
function normalize (c) {
  if (c.op === 'BETWEEN' && !Array.isArray(c.value)) c.value = ['', '']
  if (c.op === 'IN' && !Array.isArray(c.value)) c.value = []
  if (!c.op) c.op = '='
  return { key: c.key || '', op: c.op, value: c.value ?? '' }
}

function add () { draft.push(blank()) }
function remove (idx) { draft.splice(idx, 1); if (!draft.length) draft.push(blank()) }

// 下拉开关与选择
const open = reactive({ idx: -1, part: '' })
const toggle = (idx, part) => {
  if (open.idx === idx && open.part === part) { open.idx = -1; open.part = '' }
  else { open.idx = idx; open.part = part }
}
const pick = (idx, part, val) => {
  if (part === 'key') draft[idx].key = val
  if (part === 'op') {
    draft[idx].op = val
    // 切换操作符时校正 value 形态
    if (val === 'BETWEEN') draft[idx].value = ['', '']
    else if (val === 'IN') draft[idx].value = []
    else draft[idx].value = ''
  }
  open.idx = -1; open.part = ''
}
function onInInput (idx, raw) {
  draft[idx].value = raw.split(',').map(s => s.trim()).filter(Boolean)
}

// 点击外部收起菜单
const onDoc = (e) => { if (!e.target.closest('.select')) { open.idx = -1; open.part = '' } }
onMounted(() => document.addEventListener('click', onDoc))
onBeforeUnmount(() => document.removeEventListener('click', onDoc))

// 双向绑定
watch(draft, () => {
  const val = draft.map(normalize)
  emit('update:modelValue', val)
  emit('change', val)
}, { deep: true })
</script>

<style scoped>
.cond-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #fff; }

.row {
  display: grid;
  grid-template-columns: 1fr 0.7fr 1fr 40px; /* 三列比较均衡，value 不再超长 */
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}
.cell { position: relative; }
.grow { min-width: 0; }
.select { width: 100%; height: 36px; padding: 0 10px; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; display:flex; align-items:center; justify-content:space-between; }
.chev { color:#9ca3af; font-size:12px; }
.menu { position:absolute; z-index: 20; margin-top:6px; width: 100%; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.08); max-height: 220px; overflow:auto; }
.item { padding:8px 10px; display:flex; justify-content:space-between; cursor:pointer; }
.item:hover { background:#f3f4f6; }
.empty { padding:8px 10px; color:#6b7280; font-size:13px; }
.tick { color:#2563eb; }
.ipt { width: 100%; max-width: 300px; height: 36px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 10px; }
.between { display:flex; align-items:center; gap:8px; }
.sep { color:#9ca3af; }
.remove {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  z-index: 2;       /* 保证在输入框上方 */
  position: relative;
}
.remove:hover {
  background: #e5e7eb;
}
.add { margin-top: 6px; border: none; background: transparent; color: #2563eb; cursor: pointer; }
</style>
