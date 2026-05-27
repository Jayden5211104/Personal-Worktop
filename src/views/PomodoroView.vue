<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Timer, Play, Pause, RotateCcw, Settings, ArrowLeft } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const defaultMinutes = ref(25)
const minutes = ref(25)
const seconds = ref(0)
const isRunning = ref(false)
const showSettings = ref(false)
const settingValue = ref(25)
let interval = null

const formattedTime = computed(() => {
  const m = String(minutes.value).padStart(2, '0')
  const s = String(seconds.value).padStart(2, '0')
  return `${m}:${s}`
})

const progress = computed(() => {
  return ((defaultMinutes.value * 60 - (minutes.value * 60 + seconds.value)) / (defaultMinutes.value * 60)) * 100
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
  minutes.value = defaultMinutes.value
  seconds.value = 0
}

const openSettings = () => {
  stopTimer()
  settingValue.value = defaultMinutes.value
  showSettings.value = true
}

const saveSettings = () => {
  defaultMinutes.value = settingValue.value
  minutes.value = settingValue.value
  seconds.value = 0
  localStorage.setItem('workspace_pomodoroTime', settingValue.value.toString())
  showSettings.value = false
}

const cancelSettings = () => {
  showSettings.value = false
}

const goHome = () => {
  stopTimer()
  router.push('/')
}

onMounted(() => {
  const saved = localStorage.getItem('workspace_pomodoroTime')
  if (saved) {
    defaultMinutes.value = parseInt(saved)
    minutes.value = parseInt(saved)
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] p-4 md:p-6 lg:p-8">
    <header class="flex items-center justify-between mb-8">
      <button 
        @click="goHome"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft :size="20" />
        <span>返回</span>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">番茄钟</h1>
      <button 
        @click="openSettings"
        class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
      >
        <Settings :size="20" class="text-gray-600" />
      </button>
    </header>

    <div class="max-w-md mx-auto">
      <div class="card bg-tomato-pink">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <Timer :size="16" class="text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">番茄钟</h3>
              <span class="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full">{{ isRunning ? '专注中' : '已暂停' }}</span>
            </div>
          </div>
          <button @click="resetTimer" class="text-gray-400 hover:text-gray-600 transition-colors">
            <RotateCcw :size="16" />
          </button>
        </div>

        <div class="text-center py-8">
          <div class="text-6xl font-bold text-red-500 mb-6">{{ formattedTime }}</div>
          <button 
            @click="isRunning ? stopTimer() : startTimer()"
            class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto hover:bg-red-600 transition-colors shadow-lg"
          >
            <Pause v-if="isRunning" :size="28" class="text-white" />
            <Play v-else :size="28" class="text-white ml-1" />
          </button>
        </div>

        <div class="w-full h-2 bg-red-200 rounded-full overflow-hidden mb-4">
          <div 
            class="h-full bg-red-500 transition-all duration-1000"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <div class="text-center text-sm text-gray-500">
          专注时长: {{ defaultMinutes }} 分钟
        </div>
      </div>
    </div>

    <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-80 max-w-[90vw]">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">设置专注时间</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-600 block mb-2">
              时长: <span class="font-semibold text-red-500">{{ settingValue }}</span> 分钟
            </label>
            <input 
              v-model.number="settingValue"
              type="range" 
              min="1" 
              max="120" 
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>1分钟</span>
              <span>120分钟</span>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              @click="cancelSettings"
              class="flex-1 py-2.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button 
              @click="saveSettings"
              class="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>