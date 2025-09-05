<template>
  <div class="wrap">

    <!-- 单卡片：Filters + Run + Flux 预览 -->
    <section class="card">
      <h2 class="title">Query Filter</h2>

      <!-- 条件列表 -->
      <div class="row head">
        <div class="logic">
          <span>Combine by</span>
          <button class="chip" :class="{active:logic==='AND'}" @click="logic='AND'">AND</button>
          <button class="chip" :class="{active:logic==='OR'}"  @click="logic='OR'">OR</button>
        </div>
        <button class="btn add" @click="addFilter">+ Add Filter</button>
      </div>

      <div class="filters">
        <div v-for="(f,i) in filters" :key="f.id" class="filter-row">
          <select v-model="f.field" class="input">
            <option disabled value="">Select Field</option>
            <option v-for="field in fields" :key="field" :value="field">{{ field }}</option>
          </select>

          <select v-model="f.operator" class="input op">
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value="in">IN</option>
            <option value="between">Between</option>
          </select>

          <!-- 值输入：根据运算符切换 -->
          <template v-if="f.operator === 'between'">
            <input v-model="f.valueMin" placeholder="Min" class="input" />
            <span class="sep">—</span>
            <input v-model="f.valueMax" placeholder="Max" class="input" />
          </template>
          <template v-else>
            <input v-model="f.value" :placeholder="f.operator==='in' ? 'a, b, c' : 'Value'" class="input" />
          </template>

          <button class="btn remove" @click="removeFilter(i)">✕</button>
        </div>
      </div>

      <!-- 时间范围 -->
      <div class="time">
        <div class="label">Time Range</div>
        <div class="chips">
          <button class="chip" :class="{active:time.kind==='preset' && time.preset==='15m'}"
                  @click="setPreset('15m')">15m</button>
          <button class="chip" :class="{active:time.kind==='preset' && time.preset==='1h'}"
                  @click="setPreset('1h')">1h</button>
          <button class="chip" :class="{active:time.kind==='preset' && time.preset==='12h'}"
                  @click="setPreset('12h')">12h</button>
          <button class="chip" :class="{active:time.kind==='custom'}"
                  @click="time.kind='custom'">Custom</button>
        </div>

        <div class="custom" v-if="time.kind==='custom'">
          <input type="datetime-local" class="input" v-model="time.start" />
          <span>to</span>
          <input type="datetime-local" class="input" v-model="time.end" />
        </div>
      </div>

      <!-- 运行按钮 -->
      <div class="actions">
        <button class="btn run" @click="runQuery">Run Query</button>
      </div>

      <!-- Flux 代码预览（在同一张卡片里） -->
      <div class="flux">
        <h3 class="sub-title">Flux Code Preview</h3>
        <pre class="code"><code>{{ fluxCode }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/** 可外传字段列表；也可直接改为从后端获取 */
const props = defineProps<{ fields?: string[] }>()
const fields = props.fields ?? ['temperature','humidity','pressure','location','host','_value']

type FilterRow = {
  id: number
  field: string
  operator: '=' | '!=' | 'in' | 'between'
  value?: string
  valueMin?: string
  valueMax?: string
}

const filters = ref<FilterRow[]>([
  { id: Date.now(), field: 'temperature', operator: '=', value: '' }
])

const logic = ref<'AND'|'OR'>('AND')

const time = ref<{kind:'preset'|'custom'; preset?:'15m'|'1h'|'12h'; start?:string; end?:string}>({
  kind: 'preset', preset: '1h'
})

function setPreset(p:'15m'|'1h'|'12h'){ time.value = { kind:'preset', preset:p } }

function addFilter(){
  filters.value.push({ id: Date.now() + Math.random(), field:'', operator:'=' })
}
function removeFilter(i:number){ filters.value.splice(i,1) }

/** 生成 Flux 代码（from + range + filter） */
const fluxCode = computed(() => {
  const parts: string[] = []

  // 条件拼装
  for (const f of filters.value) {
    if (!f.field) continue
    if (f.operator === 'between') {
      if (f.valueMin === undefined || f.valueMax === undefined) continue
      parts.push(`(r["${f.field}"] >= ${json(f.valueMin)} and r["${f.field}"] <= ${json(f.valueMax)})`)
    } else if (f.operator === 'in') {
      const arr = (f.value ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(v => `r["${f.field}"] == ${json(v)}`)
      if (arr.length) parts.push(`(${arr.join(' or ')})`)
    } else {
      parts.push(`r["${f.field}"] ${f.operator} ${json(f.value ?? '')}`)
    }
  }

  // 时间
  let range = ''
  if (time.value.kind === 'preset') {
    const map: Record<string,string> = { '15m':'-15m', '1h':'-1h', '12h':'-12h' }
    range = `  |> range(start: ${map[time.value.preset ?? '1h']})\n`
  } else {
    range = `  |> range(start: ${json(time.value.start)}, stop: ${json(time.value.end)})\n`
  }

  const predicate = parts.length ? parts.join(` ${logic.value.toLowerCase()} `) : 'true'

  return `from(bucket: "my_bucket")\n${range}  |> filter(fn: (r) => ${predicate})`
})

function json(v:any){ return JSON.stringify(v) }

function runQuery(){
  const payload = {
    filters: filters.value,
    logic: logic.value,
    time: time.value,
    flux: fluxCode.value
  }
  console.log('Run Query:', payload)
  // 这里你可以直接 fetch 后端接口
  // await fetch('/api/query', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
}
</script>

<style scoped>
/* 主题与卡片 */
.wrap{padding:16px}
.window-dots{display:flex;gap:8px;margin-bottom:10px}
.dot{width:10px;height:10px;border-radius:50%}
.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}

.card{
  background:#f0f6ff;
  border:1px solid #cfe3ff;
  border-radius:16px;
  padding:16px;
  box-shadow:0 6px 18px rgba(33,76,190,.06);
  display:flex;
  flex-direction:column;
  gap:12px;
}
.title{margin:0;color:#0b1220;font-weight:800;font-size:22px}

/* 逻辑+新增 */
.row.head{display:flex;justify-content:space-between;align-items:center}
.logic{display:flex;align-items:center;gap:8px;color:#2a3446}
.chip{border:1px solid #cfe3ff;background:#fff;border-radius:10px;padding:6px 12px;cursor:pointer}
.chip.active{background:#2c73ff;color:#fff;border-color:#2c73ff}

/* 过滤行 */
.filters{display:flex;flex-direction:column;gap:10px}
.filter-row{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #a8caff;border-radius:10px;padding:6px 10px}
.input{border:1px solid #cfe3ff;border-radius:8px;padding:6px 8px;min-width:0}
.input.op{max-width:110px}
.sep{color:#5e6b85}
.btn{border:none;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer}
.btn.add{background:#a8caff;color:#fff}
.btn.remove{background:#ff5f56;color:#fff}

/* 时间范围 */
.time{display:flex;flex-direction:column;gap:8px}
.label{font-weight:700;color:#2a3446}
.chips{display:flex;gap:10px}
.custom{display:flex;align-items:center;gap:8px}
.custom .input{background:#fff}

/* 运行与预览 */
.actions{display:flex;justify-content:flex-end}
.btn.run{background:#2c73ff;color:#fff;box-shadow:0 8px 20px rgba(46,112,255,.25)}
.flux{display:flex;flex-direction:column;gap:8px}
.sub-title{margin:0;color:#0b1220;font-weight:800}
.code{white-space:pre-wrap;background:#fff;border:1px solid #e3efff;border-radius:12px;padding:12px;color:#0b1220}
</style>
