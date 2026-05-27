<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock as ClockIcon } from '@lucide/vue'

const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let interval = null

const currentTime = computed(() => {
  const h = String(hours.value).padStart(2, '0')
  const m = String(minutes.value).padStart(2, '0')
  const s = String(seconds.value).padStart(2, '0')
  return `${h}:${m}:${s}`
})

const hourDeg = computed(() => {
  return (hours.value % 12) * 30 + minutes.value * 0.5
})

const minuteDeg = computed(() => {
  return minutes.value * 6 + seconds.value * 0.1
})

const secondDeg = computed(() => {
  return seconds.value * 6
})

const updateTime = () => {
  const now = new Date()
  hours.value = now.getHours()
  minutes.value = now.getMinutes()
  seconds.value = now.getSeconds()
}

onMounted(() => {
  updateTime()
  interval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="card bg-clock-purple">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
          <ClockIcon :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">时钟</h3>
          <span class="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">实时</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 transition-colors">
        <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="relative w-36 h-36 mx-auto my-4">
      <div class="absolute inset-0 rounded-full bg-white shadow-inner">
        <div v-for="i in 12" :key="i" 
          class="absolute w-1 h-2 bg-purple-400 left-1/2 -translate-x-1/2"
          :style="{ transform: `translateX(-50%) rotate(${i * 30}deg)`, transformOrigin: '50% 72px' }"
        ></div>
        <div 
          class="absolute w-1.5 h-8 bg-purple-600 rounded-full left-1/2 bottom-1/2 origin-bottom -translate-x-1/2"
          :style="{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }"
        ></div>
        <div 
          class="absolute w-1 h-11 bg-purple-500 rounded-full left-1/2 bottom-1/2 origin-bottom -translate-x-1/2"
          :style="{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }"
        ></div>
        <div 
          class="absolute w-0.5 h-12 bg-red-400 rounded-full left-1/2 bottom-1/2 origin-bottom -translate-x-1/2"
          :style="{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }"
        ></div>
        <div class="absolute w-3 h-3 bg-purple-600 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>

    <div class="text-center">
      <div class="text-lg font-mono text-purple-600">{{ currentTime }}</div>
    </div>
  </div>
</template>