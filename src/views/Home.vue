<script setup>
import { onMounted } from 'vue'
import PomodoroTimer from '../components/PomodoroTimer.vue'
import Clock from '../components/Clock.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import TodoList from '../components/TodoList.vue'
import WaterTracker from '../components/WaterTracker.vue'
import Notes from '../components/Notes.vue'
import WordCard from '../components/WordCard.vue'
import QuickLinks from '../components/QuickLinks.vue'
import AiChatCard from '../components/AiChatCard.vue'
import { Plus } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loadData = () => {
  const savedTasks = localStorage.getItem('workspace_tasks')
  const savedNotes = localStorage.getItem('workspace_notes')
  const savedLinks = localStorage.getItem('workspace_links')
  const savedCups = localStorage.getItem('workspace_waterCups')
  const savedPomodoroTime = localStorage.getItem('workspace_pomodoroTime')
  const savedMusicData = localStorage.getItem('workspace_music')

  if (savedTasks) {
    try {
      window.$tasks = JSON.parse(savedTasks)
    } catch (e) {
      window.$tasks = []
    }
  }
  if (savedNotes) {
    try {
      window.$notes = JSON.parse(savedNotes)
    } catch (e) {
      window.$notes = []
    }
  }
  if (savedLinks) {
    try {
      window.$links = JSON.parse(savedLinks)
    } catch (e) {
      window.$links = []
    }
  }
  if (savedCups) {
    window.$waterCups = parseInt(savedCups) || 0
  }
  if (savedPomodoroTime) {
    window.$pomodoroTime = parseInt(savedPomodoroTime) || 25
  }
  if (savedMusicData) {
    try {
      window.$musicData = JSON.parse(savedMusicData)
    } catch (e) {
      window.$musicData = { folders: [] }
    }
  }
}

onMounted(() => {
  loadData()
})

const navigateToPomodoro = () => {
  router.push('/pomodoro')
}

const navigateToMusic = () => {
  router.push('/music')
}

const navigateToWords = () => {
  router.push('/words')
}

const navigateToWater = () => {
  router.push('/water')
}

const navigateToAiChat = () => {
  router.push('/aichat')
}
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] p-4 md:p-6 lg:p-8">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">工作台</h1>
      <button class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
        <Plus :size="20" class="text-gray-600" />
      </button>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="lg:col-span-1 cursor-pointer" @click="navigateToPomodoro">
        <PomodoroTimer />
      </div>
      <div class="lg:col-span-1">
        <Clock />
      </div>
      <div class="lg:col-span-1 cursor-pointer" @click="navigateToMusic">
        <MusicPlayer />
      </div>
      <div class="lg:col-span-1">
        <TodoList />
      </div>
      <div class="lg:col-span-1 cursor-pointer" @click="navigateToWater">
        <WaterTracker />
      </div>
      <div class="lg:col-span-1">
        <Notes />
      </div>
      <div class="lg:col-span-1">
        <WordCard />
      </div>
      <div class="lg:col-span-1">
        <QuickLinks />
      </div>
      <div class="lg:col-span-1 cursor-pointer" @click="navigateToAiChat">
        <AiChatCard />
      </div>
    </div>
  </div>
</template>
