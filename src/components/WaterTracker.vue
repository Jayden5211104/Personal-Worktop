<script setup>
import { ref, onMounted } from 'vue'
import { Droplets, GlassWater, ChevronRight } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cups = ref(0)
const goal = 8

const getMonday = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

const getTodayIndex = () => {
  const now = new Date()
  const day = now.getDay()
  return day === 0 ? 6 : day - 1
}

const loadWaterData = () => {
  const monday = getMonday()
  const saved = localStorage.getItem('workspace_waterWeek')
  const today = getTodayIndex()
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.weekStart === monday) {
        cups.value = parsed.data[today] || 0
      } else {
        localStorage.setItem('workspace_waterWeek', JSON.stringify({ weekStart: monday, data: {} }))
        cups.value = 0
      }
    } catch {
      cups.value = 0
    }
  }
}

const saveWaterData = () => {
  const monday = getMonday()
  const today = getTodayIndex()
  const saved = localStorage.getItem('workspace_waterWeek')
  let data = {}
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.weekStart === monday) {
        data = parsed.data || {}
      }
    } catch {}
  }
  data[today] = cups.value
  localStorage.setItem('workspace_waterWeek', JSON.stringify({ weekStart: monday, data }))
}

const increment = () => {
  if (cups.value < goal) {
    cups.value++
    saveWaterData()
  }
}

const progress = () => (cups.value / goal) * 100

const navigateToWater = () => {
  router.push('/water')
}

onMounted(() => {
  loadWaterData()
})
</script>

<template>
  <div class="card bg-water-blue">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Droplets :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">喝水统计</h3>
          <span class="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">今日目标</span>
        </div>
      </div>
      <button
        @click.stop="navigateToWater"
        class="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
      >
        <span class="text-xs">详情</span>
        <ChevronRight :size="14" />
      </button>
    </div>

    <div class="text-center py-6">
      <div class="text-4xl font-bold text-blue-500 mb-1">{{ cups }}</div>
      <div class="text-gray-500 text-sm">/{{ goal }} 杯</div>
    </div>

    <div class="w-full h-2 bg-blue-200 rounded-full overflow-hidden mb-4">
      <div
        class="h-full bg-blue-500 transition-all duration-300"
        :style="{ width: `${progress()}%` }"
      ></div>
    </div>

    <button
      @click.stop="increment"
      class="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
    >
      <GlassWater :size="18" />
      <span>喝水</span>
    </button>
  </div>
</template>
