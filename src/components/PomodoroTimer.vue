<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Timer, Play, Pause, RotateCcw } from '@lucide/vue'

const minutes = ref(25)
const seconds = ref(0)
const isRunning = ref(false)
let interval = null

const formattedTime = computed(() => {
  const m = String(minutes.value).padStart(2, '0')
  const s = String(seconds.value).padStart(2, '0')
  return `${m}:${s}`
})

const progress = computed(() => {
  return ((25 * 60 - (minutes.value * 60 + seconds.value)) / (25 * 60)) * 100
})

const startTimer = () => {
  isRunning.value = true
  interval = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--
    } else if (minutes.value > 0) {
      minutes.value--
      seconds.value = 59
    } else {
      stopTimer()
    }
  }, 1000)
}

const stopTimer = () => {
  isRunning.value = false
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

const resetTimer = () => {
  stopTimer()
  minutes.value = 25
  seconds.value = 0
}

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="card bg-tomato-pink">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
          <Timer :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">番茄钟</h3>
          <span class="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full">专注中</span>
        </div>
      </div>
      <button @click="resetTimer" class="text-gray-400 hover:text-gray-600 transition-colors">
        <RotateCcw :size="16" />
      </button>
    </div>

    <div class="text-center py-6">
      <div class="text-5xl font-bold text-red-500 mb-4">{{ formattedTime }}</div>
      <button 
        @click="isRunning ? stopTimer() : startTimer()"
        class="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto hover:bg-red-600 transition-colors shadow-lg"
      >
        <Pause v-if="isRunning" :size="24" class="text-white" />
        <Play v-else :size="24" class="text-white ml-1" />
      </button>
    </div>

    <div class="w-full h-1 bg-red-200 rounded-full overflow-hidden">
      <div 
        class="h-full bg-red-500 transition-all duration-1000"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>