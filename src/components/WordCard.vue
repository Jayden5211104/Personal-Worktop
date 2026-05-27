<script setup>
import { onMounted } from 'vue'
import { BookOpen, ChevronLeft, ChevronRight, Star, ChevronRight as ChevronRightIcon } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useWordStore } from '../stores/wordStore'

const router = useRouter()
const {
  currentWord,
  isFavorited,
  reviewWords,
  loadWordsData,
  nextWord,
  prevWord,
  toggleFavorite
} = useWordStore()

const navigateToWords = () => {
  router.push('/words')
}

onMounted(() => {
  loadWordsData()
})
</script>

<template>
  <div class="card bg-word-green">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <BookOpen :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">单词记忆</h3>
          <span class="text-xs text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">{{ reviewWords.length }} 词</span>
        </div>
      </div>
      <button
        @click.stop="navigateToWords"
        class="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
      >
        <span class="text-xs">管理</span>
        <ChevronRightIcon :size="14" />
      </button>
    </div>

    <div class="text-center py-4" @click.stop="navigateToWords">
      <div class="text-3xl font-bold text-emerald-600 mb-2 select-none">
        {{ currentWord ? currentWord.en : '--' }}
      </div>
      <div class="text-sm text-gray-500 min-h-[20px]">
        {{ currentWord ? currentWord.zh : '暂无单词，点击管理添加' }}
      </div>
    </div>

    <div class="flex items-center justify-center gap-4">
      <button
        @click.stop="prevWord"
        :disabled="reviewWords.length === 0"
        class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-emerald-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
      >
        <ChevronLeft :size="20" class="text-gray-600" />
      </button>

      <button
        @click.stop="toggleFavorite"
        :disabled="!currentWord"
        class="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        :class="isFavorited ? 'bg-yellow-400 text-white' : 'bg-white hover:bg-yellow-50 text-gray-400'"
      >
        <Star :size="18" :fill="isFavorited ? 'white' : 'none'" />
      </button>

      <button
        @click.stop="nextWord"
        :disabled="reviewWords.length === 0"
        class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-emerald-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
      >
        <ChevronRight :size="20" class="text-gray-600" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}
</style>
