<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, BookOpen, Plus, Star, Trash2, FileUp, Eye } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useWordStore } from '../stores/wordStore'

const router = useRouter()
const {
  reviewWords,
  favoriteWords,
  loadWordsData,
  addReviewWord,
  deleteReviewWord,
  deleteFavoriteWord,
  moveFavoriteToReview
} = useWordStore()

const activeTab = ref('review')
const newEn = ref('')
const newZh = ref('')

const goBack = () => {
  router.push('/')
}

const handleAdd = () => {
  if (newEn.value.trim() && newZh.value.trim()) {
    addReviewWord(newEn.value, newZh.value)
    newEn.value = ''
    newZh.value = ''
  }
}

const handleDeleteReview = (id) => {
  deleteReviewWord(id)
}

const handleDeleteFavorite = (id) => {
  deleteFavoriteWord(id)
}

const handleMoveToReview = (id) => {
  moveFavoriteToReview(id)
}

onMounted(() => {
  loadWordsData()
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
        <h1 class="text-xl font-bold text-gray-800">单词管理</h1>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'review'"
          class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'review' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 border border-gray-200'"
        >
          <span class="flex items-center justify-center gap-2">
            <BookOpen :size="16" />
            复习单词 ({{ reviewWords.length }})
          </span>
        </button>
        <button
          @click="activeTab = 'favorite'"
          class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'favorite' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border border-gray-200'"
        >
          <span class="flex items-center justify-center gap-2">
            <Star :size="16" />
            遗忘单词 ({{ favoriteWords.length }})
          </span>
        </button>
      </div>

      <div v-if="activeTab === 'review'" class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <div class="flex gap-2">
            <input
              v-model="newEn"
              type="text"
              placeholder="英文"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
              @keyup.enter="handleAdd"
            />
            <input
              v-model="newZh"
              type="text"
              placeholder="中文"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
              @keyup.enter="handleAdd"
            />
            <button
              @click="handleAdd"
              :disabled="!newEn.trim() || !newZh.trim()"
              class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus :size="16" />
              <span>添加</span>
            </button>
          </div>
        </div>
        <div class="p-2">
          <div
            v-for="word in reviewWords"
            :key="word.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-800">{{ word.en }}</div>
              <div class="text-sm text-gray-500">{{ word.zh }}</div>
            </div>
            <button
              @click="handleDeleteReview(word.id)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 :size="16" />
            </button>
          </div>
          <div v-if="reviewWords.length === 0" class="text-center py-12 text-gray-400">
            <BookOpen :size="40" class="mx-auto mb-2 opacity-30" />
            <p>暂无单词，在上方输入英文和中文添加</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'favorite'" class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <p class="text-sm text-gray-500">已收藏的遗忘单词（首页点击星标收藏的单词）</p>
        </div>
        <div class="p-2">
          <div
            v-for="word in favoriteWords"
            :key="word.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-800">{{ word.en }}</div>
              <div class="text-sm text-gray-500">{{ word.zh }}</div>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="handleMoveToReview(word.id)"
                class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                title="移入复习列表"
              >
                <Eye :size="16" />
              </button>
              <button
                @click="handleDeleteFavorite(word.id)"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
          <div v-if="favoriteWords.length === 0" class="text-center py-12 text-gray-400">
            <Star :size="40" class="mx-auto mb-2 opacity-30" />
            <p>暂无遗忘单词</p>
            <p class="text-xs mt-1">在首页看到需要复习的单词时点击星标即可收藏</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
