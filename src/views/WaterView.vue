<script setup>
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft, Droplets, GlassWater } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const weekStart = ref('')
const waterData = ref({})

const loadWaterData = () => {
  const saved = localStorage.getItem('workspace_waterWeek')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      weekStart.value = parsed.weekStart || getMonday()
      waterData.value = parsed.data || {}
    } catch {
      weekStart.value = getMonday()
      waterData.value = {}
    }
  } else {
    weekStart.value = getMonday()
    waterData.value = {}
  }
}

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

const todayIndex = ref(getTodayIndex())

const weekData = computed(() => {
  return DAYS.map((day, i) => ({
    day,
    cups: waterData.value[i] || 0,
    isToday: i === todayIndex.value
  }))
})

const maxCups = computed(() => {
  const max = Math.max(...weekData.value.map(d => d.cups), 1)
  return Math.max(max, 8)
})

const getBarPercent = (cups) => {
  return (cups / maxCups.value) * 100
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadWaterData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
        <button
          @click="goBack"
          class="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft :size="20" />
          <span>返回首页</span>
        </button>
        <h1 class="text-xl font-bold text-gray-800">喝水统计</h1>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Droplets :size="16" class="text-white" />
          </div>
          <div>
            <h2 class="font-semibold text-gray-800">本周统计</h2>
            <p class="text-xs text-gray-500">{{ weekStart }} 起</p>
          </div>
        </div>

        <div class="flex items-end justify-around h-48 gap-3 mb-6">
          <div
            v-for="(item, i) in weekData"
            :key="i"
            class="flex flex-col items-center flex-1 h-full"
          >
            <span class="text-sm font-medium mb-1" :class="item.isToday ? 'text-blue-600' : 'text-gray-500'">{{ item.cups }}杯</span>
            <div class="w-full flex-1 flex items-end">
              <div
                class="w-full rounded-t-md transition-all duration-500 min-h-[8px]"
                :class="item.isToday ? 'bg-blue-500' : 'bg-blue-300'"
                :style="{ height: `${Math.max(item.cups ? getBarPercent(item.cups) : 2, 4)}%` }"
              ></div>
            </div>
            <span class="text-xs mt-2" :class="item.isToday ? 'text-blue-600 font-semibold' : 'text-gray-400'">
              {{ item.day }}
              <span v-if="item.isToday" class="text-[10px] text-blue-400">今天</span>
            </span>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <GlassWater :size="18" class="text-blue-500" />
              <span class="text-gray-600 text-sm">本周总喝水</span>
            </div>
            <span class="text-2xl font-bold text-blue-500">
              {{ weekData.reduce((sum, d) => sum + d.cups, 0) }} <span class="text-sm font-normal text-gray-400">杯</span>
            </span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-gray-400 text-sm">日均</span>
            <span class="text-sm text-gray-600">
              {{ weekData.length > 0 ? (weekData.reduce((sum, d) => sum + d.cups, 0) / weekData.length).toFixed(1) : 0 }} 杯/天
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
