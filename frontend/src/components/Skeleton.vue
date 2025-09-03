<template>
  <div :class="wrapperClass">
    <aside class="w-1/5 p-4 space-y-4">
      <div v-for="n in 7" :key="n" :class="circleClass"></div>
    </aside>
    <main class="flex-1 p-6 space-y-6">
      <div class="flex space-x-4">
        <div v-for="n in 3" :key="'topbar-' + n" :class="barClass + ' w-1/4'"></div>
        <div class="flex-1"></div>
        <div class="flex space-x-2">
          <div v-for="n in 3" :key="'dot-' + n" :class="circleClass + ' w-4 h-4'"></div>
        </div>
      </div>
      <div class="flex space-x-6">
        <div v-for="n in 2" :key="'card-' + n" class="flex-1 space-y-4">
          <div :class="barClass + ' w-1/2 h-4'"></div>
          <div :class="barClass + ' w-full h-20 rounded-md'"></div>
        </div>
      </div>
      <div :class="barClass + ' w-full h-48 rounded-md'"></div>
    </main>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'light',
    validator: (val) => ['light', 'dark'].includes(val),
  }
})

const wrapperClass = computed(() =>
  'flex min-h-screen ' + (props.mode === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900')
)

const barClass = computed(() =>
  'animate-pulse rounded-md ' + (props.mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
)

const circleClass = computed(() =>
  'animate-pulse rounded-full w-6 h-6 ' + (props.mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
)
</script>