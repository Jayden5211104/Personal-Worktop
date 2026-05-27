<script setup>
import { onMounted } from 'vue'
import { Music, Play, Pause, SkipBack, SkipForward, Repeat, List, ChevronRight } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '../stores/musicStore'

const router = useRouter()
const {
  folders,
  currentFolderId,
  currentSongIndex,
  isPlaying,
  currentTime,
  duration,
  loopMode,
  currentFolder,
  currentSong,
  progress,
  initAudio,
  playSong,
  togglePlay,
  prevSong,
  nextSong,
  toggleLoopMode,
  seekTo,
  loadMusicData,
  formatTime
} = useMusicStore()

const handleTogglePlay = (e) => {
  e.stopPropagation()
  togglePlay()
}

const handlePrevSong = (e) => {
  e.stopPropagation()
  prevSong()
}

const handleNextSong = (e) => {
  e.stopPropagation()
  nextSong()
}

const handleLoopMode = (e) => {
  e.stopPropagation()
  toggleLoopMode()
}

const handleSeekTo = (event) => {
  event.stopPropagation()
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  seekTo(percent * duration.value)
}

const handleSongClick = (e, songIndex) => {
  e.stopPropagation()
  playSong(songIndex)
}

const handleCardClick = () => {
  router.push('/music')
}

onMounted(() => {
  initAudio()
  loadMusicData()
})
</script>

<template>
  <div class="card bg-music-purple" @click="handleCardClick">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
          <Music :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">音乐播放</h3>
          <span v-if="currentSong" class="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">{{ isPlaying.value ? '播放中' : '已暂停' }}</span>
          <span v-else class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">待播放</span>
        </div>
      </div>
      <button 
        @click.stop="handleCardClick"
        class="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
      >
        <span class="text-xs">管理</span>
        <ChevronRight :size="14" />
      </button>
    </div>

    <div class="space-y-2 mb-3 max-h-28 overflow-y-auto">
      <div class="text-xs text-gray-500 mb-1">我的歌单</div>
      <div 
        v-for="(song, index) in currentFolder.songs" 
        :key="song.id"
        class="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors"
        :class="currentSongIndex.value === index ? 'bg-purple-200' : 'hover:bg-purple-100'"
        @click.stop="(e) => handleSongClick(e, index)"
      >
        <Music :size="14" :class="currentSongIndex.value === index ? 'text-purple-600' : 'text-gray-400'" />
        <span class="flex-1 text-sm text-gray-700 truncate">{{ song.name }}</span>
      </div>
      <div v-if="currentFolder.songs.length === 0" class="text-center py-4 text-gray-400 text-sm">
        暂无音乐，点击管理上传
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 mb-3">
      <button 
        @click.stop="handlePrevSong" 
        :disabled="currentFolder.songs.length === 0"
        class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SkipBack :size="16" class="text-gray-600" />
      </button>
      
      <button 
        @click.stop="handleTogglePlay" 
        :disabled="!currentSong"
        class="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <Pause v-if="isPlaying.value" :size="24" class="text-white" />
        <Play v-else :size="24" class="text-white ml-0.5" />
      </button>
      
      <button 
        @click.stop="handleNextSong" 
        :disabled="currentFolder.songs.length === 0"
        class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SkipForward :size="16" class="text-gray-600" />
      </button>
    </div>

    <div class="flex items-center justify-center gap-3 mb-3">
      <button 
        @click.stop="handleLoopMode"
        :disabled="currentFolder.songs.length === 0"
        class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        :class="loopMode.value !== 'list' ? 'bg-purple-200 text-purple-600' : 'hover:bg-purple-100 text-gray-500'"
      >
        <Repeat v-if="loopMode.value === 'single'" :size="16" />
        <List v-else :size="16" />
      </button>
    </div>

    <div v-if="currentSong" class="space-y-1">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span class="truncate max-w-[60%]">{{ currentSong.name }}</span>
        <span>{{ formatTime(currentTime.value) }} / {{ formatTime(duration.value) }}</span>
      </div>
      <div 
        class="h-1 bg-purple-200 rounded-full cursor-pointer"
        @click.stop="handleSeekTo"
      >
        <div 
          class="h-full bg-purple-500 rounded-full transition-all"
          :style="{ width: `${progress()}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
}
</style>
