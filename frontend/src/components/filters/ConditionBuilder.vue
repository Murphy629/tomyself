<template>
  <div class="box">
    <h3 class="title">Condition Builder</h3>

    <!-- 若安装了 vuedraggable 就用拖拽；否则普通列表 -->
    <component :is="draggableComp || 'div'" v-model="items" item-key="id" class="list" handle=".drag">
      <template #item="{ element, index }">
        <ConditionRow
          :model-value="element"
          :fields="fields"
          :logic="logic"
          :draggable="!!draggableComp"
          @update:modelValue="v => updateRow(index, v)"
          @remove="removeRow(index)"
          @toggle-logic="toggleLogic"
        />
      </template>
      <template v-if="!draggableComp">
        <div v-for="(element, index) in items" :key="element.id" class="mb8">
          <ConditionRow
            :model-value="element"
            :fields="fields"
            :logic="logic"
            @update:modelValue="v => updateRow(index, v)"
            @remove="removeRow(index)"
            @toggle-logic="toggleLogic"
          />
        </div>
      </template>
    </component>

    <button class="btn add" @click="addRow">+ Add Condition</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, shallowRef, onMounted } from 'vue'
import ConditionRow from './ConditionRow.vue'

const props = defineProps<{
  modelValue: Array<any>
  fields: string[]
}>()
const emit = defineEmits<{
 (e:'update:modelValue', v:any[]):void
 (e:'logic-change', v:'AND'|'OR'):void
}>()

const items = ref(props.modelValue?.length ? [...props.modelValue] : [])
const logic = ref<'AND'|'OR'>('AND')
watch(() => props.modelValue, v => items.value = [...(v ?? [])])
watch(items, v => emit('update:modelValue', v), { deep:true })

function addRow(){
  items.value.push({ id: Date.now()+Math.random(), field:'', operator:'=', value:'' })
}
function removeRow(i:number){ items.value.splice(i,1) }
function updateRow(i:number, v:any){ items.value[i] = { ...items.value[i], ...v } }
function toggleLogic(){ logic.value = logic.value === 'AND' ? 'OR' : 'AND'; emit('logic-change', logic.value) }

/** 尝试动态加载 vuedraggable（未安装也不报错） */
const draggableComp = shallowRef<any>(null)
onMounted(async ()=>{
  try {
    const mod = await import('vuedraggable')
    draggableComp.value = mod.default
  } catch { /* 忽略，继续用普通列表 */ }
})
</script>

<style scoped>
.box{border:1px solid #e3efff;background:#fff;border-radius:14px;padding:12px}
.title{margin:0 0 8px 0;color:#2a3446;font-weight:800}
.list{display:flex;flex-direction:column;gap:10px}
.btn.add{margin-top:10px;background:#a8caff;color:#fff;border:none;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer}
.mb8{margin-bottom:8px}
</style>
