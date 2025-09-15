<template>
  <div class="pe">
    <h1 class="page-title">Panel Editor</h1>

    <!-- 固定网格：左列 / 右上 grafana / 右下 influx -->
    <div class="layout">
      <!-- 左列 -->
      <aside class="left-col">
        <!-- Selector（未改动） -->
        <section class="card">
          <div class="card-title">Selector</div>

          <div class="subhead row-between">
            <span>Categories</span>
            <button class="btn-ghost" @click="addCategory">+ New</button>
          </div>
          <div class="chip-wrap">
            <button
              v-for="c in categories"
              :key="c.key"
              @click="activeCategory = c.key"
              :class="['chip', activeCategory === c.key && 'chip-active']"
            >{{ c.title }}</button>
          </div>

          <div class="subhead row-between">
            <span>Metrics</span>
            <button class="btn-ghost" @click="addMetric">+ New</button>
          </div>
          <div class="chip-wrap">
            <template v-for="item in currentItems" :key="item">
              <button
                v-if="!selectedMetrics.has(item)"
                class="chip chip-add"
                @click="toggleMetric(item)"
              >+ {{ item }}</button>
              <span v-else class="chip chip-active">
                {{ item }} <button class="chip-x" @click="toggleMetric(item)">✕</button>
              </span>
            </template>
          </div>

          <div v-if="selectedMetrics.size" class="selected-line">
            Selected:
            <span v-for="(it, idx) in Array.from(selectedMetrics)" :key="it">
              {{ it }}<span v-if="idx < selectedMetrics.size - 1">, </span>
            </span>
            <button class="btn-ghost btn-xs" @click="clearSelectedMetrics">Clear</button>
          </div>
        </section>

        <!-- Tabs（未改动） -->
        <div class="tabs">
          <button :class="['tab', activeTab==='data' && 'tab-active']" @click="activeTab='data'">Data</button>
          <button :class="['tab', activeTab==='condition' && 'tab-active']" @click="activeTab='condition'">Condition</button>
        </div>

        <!-- ===== Editor（仅此区域做了收紧与防溢出） ===== -->
        <section class="card">
          <div class="card-title">Editor</div>

          <!-- Data（未改动逻辑，仅沿用样式） -->
          <div v-if="activeTab==='data'" class="mt-10">
            <div class="muted">Data Explorer</div>

            <div v-if="!isLoggedIn" class="placeholder">
              Please sign in to view and manage your data folders.
            </div>

            <div v-else class="tree">
              <div class="tree-root" @click="toggleExpand('root')">
                <span>{{ expanded.has('root') ? '📂' : '📁' }}</span>
                <strong>Datasets</strong>
              </div>

              <ul v-if="expanded.has('root')" class="tree-list">
                <FolderNode
                  v-for="g in dataTree"
                  :key="g.key"
                  :node="g"
                  :path="[g.key]"
                  :expanded="expanded"
                  :active-path="activePath"
                  :parent="{ key:'root', children: dataTree }"
                  @toggle="toggleExpand"
                  @select="selectDataPath"
                  @context="openContextMenu"
                />
              </ul>

              <div v-if="activePath.length" class="muted mt-8">
                Selected path:
                <code class="code">{{ activePath.join(' / ') }}</code>
              </div>

              <!-- 右键菜单 -->
              <ul v-if="ctxMenu.show" class="ctx" :style="{ top: ctxMenu.y+'px', left: ctxMenu.x+'px' }">
                <li class="ctx-item" @click="ctxRename">Rename</li>
                <li class="ctx-item" @click="ctxNewFolder">New Folder</li>
                <li class="ctx-item" @click="ctxNewFile">New File</li>
                <li class="ctx-item danger" @click="ctxDelete">Delete</li>
              </ul>
            </div>
          </div>

          <!-- Condition（缩小字号/控件并杜绝横向溢出） -->
          <div v-else class="mt-10">
            <div class="muted">Filters</div>

            <div class="fieldset compact no-overflow">
              <!-- Time Range -->
              <div class="group">
                <div class="group-title">Time Range</div>
                <div class="row-2 no-minwidth">
                  <label class="field">
                    <span class="label">Start</span>
                    <input class="input xs" type="datetime-local" v-model="timeStart" @change="rebuildQuery" />
                  </label>
                  <label class="field">
                    <span class="label">End</span>
                    <input class="input xs" type="datetime-local" v-model="timeEnd" @change="rebuildQuery" />
                  </label>
                </div>
                <div class="hint">(Leave empty for relative now; quick presets like 15m/1h/24h can be added later.)</div>
              </div>

              <!-- Aggregate -->
              <div class="row-2 no-minwidth">
                <label class="field">
                  <span class="label">Interval (every)</span>
                  <select class="input xs" v-model="interval" @change="rebuildQuery">
                    <option>1m</option><option>5m</option><option>15m</option><option>1h</option><option>6h</option><option>24h</option>
                  </select>
                </label>
                <label class="field">
                  <span class="label">Aggregate fn</span>
                  <select class="input xs" v-model="aggFn" @change="rebuildQuery">
                    <option>mean</option><option>max</option><option>min</option><option>sum</option><option>median</option><option>count</option>
                  </select>
                </label>
              </div>

              <!-- Sort / Group / Limit -->
              <div class="row-3 no-minwidth">
                <label class="field">
                  <span class="label">Sort</span>
                  <select class="input xs" v-model="sortDir" @change="rebuildQuery">
                    <option value="desc">_time desc</option>
                    <option value="asc">_time asc</option>
                  </select>
                </label>
                <label class="field">
                  <span class="label">Group by (tag)</span>
                  <input class="input xs" type="text" v-model="groupBy" @input="rebuildQuery" placeholder="_measurement or tag" />
                </label>
                <label class="field">
                  <span class="label">Limit</span>
                  <input class="input xs" type="number" min="1" v-model.number="limitN" @input="rebuildQuery" />
                </label>
              </div>

              <!-- Where -->
              <div class="row-3 no-minwidth">
                <label class="field">
                  <span class="label">Field</span>
                  <input class="input xs" type="text" v-model="whereField" @input="rebuildQuery" placeholder="_value" />
                </label>
                <label class="field">
                  <span class="label">Operator</span>
                  <select class="input xs" v-model="whereOp" @change="rebuildQuery">
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                  </select>
                </label>
                <label class="field">
                  <span class="label">Value</span>
                  <input class="input xs" type="number" v-model.number="whereValue" @input="rebuildQuery" placeholder="e.g., 80" />
                </label>
              </div>

              <!-- Others -->
              <div class="row-2 no-minwidth">
                <label class="field">
                  <span class="label">Fill nulls</span>
                  <select class="input xs" v-model="fillMode" @change="rebuildQuery">
                    <option value="">(none)</option>
                    <option value="previous">previous</option>
                    <option value="linear">linear</option>
                    <option value="0">0</option>
                  </select>
                </label>
                <label class="field">
                  <span class="label">Timezone</span>
                  <input class="input xs" type="text" v-model="tz" @input="rebuildQuery" placeholder="e.g., Australia/Adelaide" />
                </label>
              </div>
            </div>
          </div>
        </section>
      </aside>

      <!-- 右上 Grafana（未改动） -->
      <section class="card preview">
        <div class="card-title">Grafana Preview</div>
        <div class="preview-box">Preview goes here</div>
      </section>

      <!-- 右下 Influx Code（未改动） -->
      <section class="card influx">
        <div class="row-between">
          <div class="card-title">Influx Code</div>
          <div class="row gap-8">
            <button class="btn" @click="exportFlux">Export</button>
            <button v-if="!isImporting" class="btn-primary" @click="startImport">New</button>
            <template v-else>
              <button class="btn-success" @click="confirmImport">Import</button>
              <button class="btn" @click="cancelImport">Cancel</button>
            </template>
          </div>
        </div>

        <textarea v-if="!isImporting" v-model="queryText" class="codearea"></textarea>
        <textarea v-else v-model="tempImport" class="codearea light" placeholder="Paste or type your Flux here..."></textarea>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineComponent } from 'vue'

/* 基础状态 */
const isLoggedIn = ref(true)
const queryText = ref('// Flux query will appear here')
const activeTab = ref('data')

/* Selector 四大类 + 自定义 */
const categories = ref([
  { key: 'monitor',  title: 'Monitoring',      items: ['CPU load', 'Memory usage', 'Disk I/O', 'Network throughput', 'App logs', 'Containers/K8s'] },
  { key: 'iot',      title: 'IoT & Sensors',   items: ['Temperature', 'Humidity', 'Energy consumption', 'Air quality', 'Pressure', 'Vibration'] },
  { key: 'business', title: 'Business Metrics',items: ['Stock ticks', 'E-commerce analytics', 'Orders per min', 'Revenue', 'Power usage'] },
  { key: 'realtime', title: 'Real-time Events',items: ['Gaming analytics', 'Website traffic', 'Streaming viewers', 'Latency', 'Error rate'] }
])
const activeCategory = ref('monitor')
const selectedMetrics = ref(new Set())
const currentItems = computed(() => categories.value.find(c => c.key === activeCategory.value)?.items || [])

function addCategory(){ const name=prompt('New category name'); if(!name) return
  const key=name.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now(); categories.value.push({ key, title:name, items:[] }); activeCategory.value=key }
function addMetric(){ const name=prompt('New metric name'); if(!name) return
  const cat=categories.value.find(c=>c.key===activeCategory.value); if(cat && !cat.items.includes(name)) cat.items.push(name) }
function toggleMetric(item){ const s=new Set(selectedMetrics.value); s.has(item)?s.delete(item):s.add(item); selectedMetrics.value=s; rebuildQuery() }
function clearSelectedMetrics(){ selectedMetrics.value=new Set(); rebuildQuery() }

/* Data 树 + 右键 */
const expanded = ref(new Set(['root']))
const activePath = ref([])
const dataTree = ref([
  { key:'monitor', title:'Monitoring & Observability', children:[
    { key:'cpu', title:'CPU load' }, { key:'memory', title:'Memory usage' },
    { key:'disk', title:'Disk I/O' }, { key:'net', title:'Network throughput' },
    { key:'logs', title:'Application logs' }, { key:'k8s', title:'Containers / K8s' }
  ]},
  { key:'iot', title:'IoT & Sensors', children:[
    { key:'temp', title:'Temperature' }, { key:'humid', title:'Humidity' },
    { key:'energy', title:'Energy consumption' }, { key:'air', title:'Air quality' },
    { key:'others', title:'Others', children:[ { key:'pressure', title:'Pressure' }, { key:'vibration', title:'Vibration' } ] }
  ]},
  { key:'biz', title:'Business Metrics', children:[
    { key:'stocks', title:'Stock ticks' }, { key:'ecom', title:'E-commerce analytics' },
    { key:'orders', title:'Orders per min' }, { key:'revenue', title:'Revenue' }, { key:'power', title:'Power usage' }
  ]},
  { key:'events', title:'Real-time Events', children:[
    { key:'gaming', title:'Gaming analytics' }, { key:'traffic', title:'Website traffic' },
    { key:'viewers', title:'Streaming viewers' }, { key:'latency', title:'Latency' }, { key:'errrate', title:'Error rate' }
  ]}
])
function toggleExpand(key){ const e=new Set(expanded.value); e.has(key)?e.delete(key):e.add(key); expanded.value=e }
function selectDataPath(pathArr){ activePath.value=pathArr; rebuildQuery() }

/* 右键菜单 */
const ctxMenu = ref({ show:false, x:0, y:0, parentRef:null, index:null })
function openContextMenu(ev, parentRef, index){
  ev.preventDefault(); const rect=ev.currentTarget.getBoundingClientRect()
  ctxMenu.value={ show:true, x:ev.clientX-rect.left, y:ev.clientY-rect.top, parentRef, index }
  setTimeout(()=>document.addEventListener('click', ()=>ctxMenu.value.show=false, { once:true }),0)
}
function ctxRename(){ const {parentRef,index}=ctxMenu.value; if(!parentRef) return
  const cur=parentRef.children[index]; const n=prompt('Enter new name',cur.title); if(n&&n.trim()) cur.title=n.trim(); ctxMenu.value.show=false }
function ctxNewFolder(){ const {parentRef}=ctxMenu.value; if(!parentRef) return
  ;(parentRef.children??=[]).push({ key:'folder_'+Date.now(), title:'New Folder', children:[] }); expanded.value.add(parentRef.key); ctxMenu.value.show=false }
function ctxNewFile(){ const {parentRef}=ctxMenu.value; if(!parentRef) return
  ;(parentRef.children??=[]).push({ key:'file_'+Date.now(), title:'New File' }); expanded.value.add(parentRef.key); ctxMenu.value.show=false }
function ctxDelete(){ const {parentRef,index}=ctxMenu.value; if(!parentRef) return
  parentRef.children.splice(index,1); ctxMenu.value.show=false }

/* 递归节点组件 */
const FolderNode = defineComponent({
  name:'FolderNode',
  props:{ node:Object, path:Array, expanded:Object, activePath:Array, parent:Object },
  emits:['toggle','select','context'],
  setup(props,{emit}){
    const isOpen = computed(()=>props.expanded.has(props.path.join('/')))
    const isActive = computed(()=>JSON.stringify(props.activePath)===JSON.stringify(props.path))
    const toggle = ()=>emit('toggle', props.path.join('/'))
    const select = ()=>emit('select', props.path)
    const onCtx = (e)=>emit('context', e, props.parent, (props.parent.children||[]).findIndex(n=>n.key===props.node.key))
    return { isOpen, isActive, toggle, select, onCtx }
  },
  template: `
    <li class="tree-item">
      <div v-if="node.children && node.children.length" class="tree-row" @click="toggle" @contextmenu.prevent="onCtx">
        <span>{{ isOpen ? '📂' : '📁' }}</span>
        <span>{{ node.title }}</span>
      </div>
      <div v-else class="tree-row" :class="isActive && 'active'" @click="select" @contextmenu.prevent="onCtx">
        <span>📄</span>
        <span>{{ node.title }}</span>
      </div>
      <ul v-if="node.children && node.children.length && isOpen" class="tree-list">
        <FolderNode
          v-for="c in node.children"
          :key="c.key"
          :node="c"
          :path="[...path, c.key]"
          :expanded="expanded"
          :active-path="activePath"
          :parent="node"
          @toggle="$emit('toggle', $event)"
          @select="$emit('select', $event)"
          @context="$emit('context', $event)"
        />
      </ul>
    </li>
  `
})

/* Condition 状态 */
const timeStart = ref(''), timeEnd = ref('')
const interval = ref('1m'), aggFn = ref('mean')
const sortDir = ref('desc'), groupBy = ref('')
const limitN = ref(100), whereField = ref('_value'), whereOp = ref('>'), whereValue = ref()
const fillMode = ref(''), tz = ref('')

/* Influx Code 导入导出 */
const isImporting = ref(false)
const tempImport = ref('')
function startImport(){ isImporting.value = true; tempImport.value = '' }
function confirmImport(){ queryText.value = tempImport.value || '// (empty)'; isImporting.value = false }
function cancelImport(){ isImporting.value = false; tempImport.value = '' }
function exportFlux(){
  const blob = new Blob([queryText.value], { type:'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  const t = new Date(), pad = n=>String(n).padStart(2,'0')
  a.href = URL.createObjectURL(blob)
  a.download = `query_${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}_${pad(t.getHours())}${pad(t.getMinutes())}${pad(t.getSeconds())}.flux`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href)
}

/* 组装 Flux */
function rebuildQuery(){
  const bucket = 'my-bucket'
  const pathComment = activePath.value.length ? `// path: ${activePath.value.join(' / ')}\n` : ''
  const metrics = Array.from(selectedMetrics.value)
  const metricsSet = metrics.length ? `["${metrics.join('","')}"]` : '[]'
  const rangeStart = timeStart.value ? `time(v: "${timeStart.value}:00Z")` : '-1h'
  const rangeStop  = timeEnd.value   ? `time(v: "${timeEnd.value}:00Z")`   : 'now()'
  let whereLine = ''
  if (whereField.value && whereOp.value && whereValue.value !== '' && whereValue.value !== undefined && whereValue.value !== null) {
    whereLine = `\n  |> filter(fn: (r) => r.${whereField.value} ${whereOp.value} ${whereValue.value})`
  }
  const groupLine = groupBy.value ? `\n  |> group(columns: ["${groupBy.value}"])` : ''
  let fillLine = ''
  if (fillMode.value === 'previous') fillLine = `\n  |> fill(usePrevious: true)`
  else if (fillMode.value === 'linear') fillLine = `\n  |> fill(column: "_value", usePrevious: false)`
  else if (fillMode.value === '0') fillLine = `\n  |> fill(value: 0)`
  const tzLine = tz.value ? `\n  |> timeShift(duration: 0h, location: "${tz.value}")` : ''
  const metricFilter = metrics.length ? `\n  |> filter(fn: (r) => contains(value: r._measurement, set: ${metricsSet}))` : ''
  const aggLine = `\n  |> aggregateWindow(every: ${interval.value}, fn: ${aggFn.value}, createEmpty: false)`
  const sortLine = `\n  |> sort(columns: ["_time"], desc: ${sortDir.value === 'desc'})`
  const limitLine = limitN.value ? `\n  |> limit(n: ${limitN.value})` : ''
  queryText.value =
`${pathComment}from(bucket: "${bucket}")
  |> range(start: ${rangeStart}, stop: ${rangeStop})${metricFilter}${whereLine}${groupLine}${aggLine}${fillLine}${tzLine}${sortLine}${limitLine}`
}
watch([activePath, selectedMetrics, timeStart, timeEnd, interval, aggFn, sortDir, groupBy, limitN, whereField, whereOp, whereValue, fillMode, tz], rebuildQuery)
</script>

<style scoped>
/* 布局与全局（未改动） */
.layout{ display:grid; grid-template-columns:380px 1fr; grid-template-rows:auto auto; grid-template-areas:"left grafana" "left influx"; gap:16px; }
.left-col{ grid-area:left; display:flex; flex-direction:column; gap:12px; }
.pe{ padding:24px; }
.page-title{ font-size:20px; font-weight:800; margin-bottom:12px; }
.card{ background:#fff; border:1px solid #e6e8ee; border-radius:12px; padding:14px; }
.card-title{ font-weight:700; font-size:15px; color:#111827; }
.muted{ font-size:12.5px; color:#64748b; }
.mt-8{ margin-top:8px; } .mt-10{ margin-top:10px; }
.preview{ grid-area:grafana; min-height:380px; }
.influx{ grid-area:influx; }
.preview-box{ margin-top:8px; height:320px; border:1px dashed #d7dbe3; border-radius:10px; background:#f9fbff; display:flex; align-items:center; justify-content:center; color:#9aa4b2; }

.row{ display:flex; align-items:center; } .row-between{ display:flex; align-items:center; justify-content:space-between; } .gap-8{ gap:8px; }
.chip-wrap{ display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
.chip{ padding:6px 10px; border:1px solid #e6e8ee; border-radius:999px; background:#fff; color:#334155; font-size:13px; }
.chip-add{ border-style:dashed; } .chip-active{ border-color:#3b82f6; background:#eff6ff; color:#1d4ed8; font-weight:600; }
.chip-x{ border:none; background:transparent; margin-left:6px; cursor:pointer; }
.subhead{ margin-top:10px; font-size:12px; color:#64748b; }
.tabs{ display:flex; gap:10px; }
.tab{ flex:1; padding:10px; border:1px solid #e6e8ee; background:#fff; border-radius:10px; font-size:13px; }
.tab-active{ border-color:#3b82f6; background:#eff6ff; color:#1d4ed8; font-weight:700; }

/* ====== Editor（仅此区域样式有调整） ====== */
.fieldset{ margin-top:10px; padding:12px; border:1px dashed #d7dbe3; border-radius:10px; background:#fcfdff; }
.fieldset.compact .row-2{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:8px; }
.fieldset.compact .row-3{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr); gap:8px; }
.no-overflow{ overflow:hidden; }
.no-minwidth > *{ min-width:0; }         /* 关键：允许列内内容收缩（解决 datetime 溢出） */

.field{ display:flex; flex-direction:column; gap:4px; }
.label{ font-size:12px; color:#475569; }
.input{
  height:36px; padding:0 10px; font-size:12.5px;
  color:#111827; border:1px solid #d9dde6; border-radius:8px; background:#fff;
  width:100%; box-sizing:border-box;
}
.input.xs{ height:32px; font-size:12.5px; }
.input:focus{ outline:none; border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,.15); }
.group{ margin-bottom:6px; }
.group-title{ font-weight:700; font-size:20px; color:#1f2937; margin-bottom:6px; }
.hint{ margin-top:4px; font-size:11.5px; color:#94a3b8; }

/* Data 树（未改动） */
.tree{ border:1px dashed #d7dbe3; border-radius:10px; padding:10px; position:relative; }
.tree-root{ display:flex; gap:6px; align-items:center; cursor:pointer; font-size:13.5px; }
.tree-list{ list-style:none; margin:6px 0 0 16px; padding:0; }
.tree-item{ margin:2px 0; }
.tree-row{ display:flex; gap:6px; align-items:center; cursor:pointer; color:#374151; font-size:13.5px; }
.tree-row.active{ font-weight:700; color:#1d4ed8; }
.code{ background:#f1f5f9; padding:2px 6px; border-radius:6px; }

/* 右键菜单（未改动） */
.ctx{ position:absolute; min-width:150px; background:#fff; border:1px solid #e6e8ee; border-radius:8px; padding:6px; box-shadow:0 10px 24px rgba(0,0,0,.08); list-style:none; }
.ctx-item{ padding:7px 10px; border-radius:8px; cursor:pointer; font-size:13px; color:#334155; }
.ctx-item:hover{ background:#f1f5f9; } .ctx-item.danger{ color:#b91c1c; }

/* Influx Code（未改动） */
.btn{ padding:8px 12px; border:1px solid #e6e8ee; background:#fff; border-radius:10px; font-size:13px; cursor:pointer; }
.btn-ghost{ padding:5px 10px; border:1px dashed #cbd5e1; background:#fff; border-radius:999px; font-size:12px; cursor:pointer; }
.btn-xs{ padding:3px 6px; font-size:12px; }
.btn-primary{ padding:8px 12px; border:1px solid #3b82f6; background:#eff6ff; color:#1d4ed8; border-radius:10px; font-weight:700; cursor:pointer; }
.btn-success{ padding:8px 12px; border:1px solid #16a34a; background:#ecfdf5; color:#15803d; border-radius:10px; font-weight:700; cursor:pointer; }
.codearea{ margin-top:8px; width:100%; height:220px; resize:vertical; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace; font-size:13.2px; line-height:1.5; background:#0f172a; color:#e2e8f0; border:none; border-radius:10px; padding:12px; }
.codearea.light{ background:#f7fafc; color:#0f172a; border:1px solid #e6e8ee; }
.placeholder{ border:1px dashed #d7dbe3; border-radius:10px; padding:14px; color:#475569; background:#fafcff; }
.selected-line{ margin-top:8px; font-size:12.5px; color:#475569; }
</style>
