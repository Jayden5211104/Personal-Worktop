<script setup>
import { onMounted } from 'vue'
import { MessageCircle, ChevronRight, Sparkles } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAiStore } from '../stores/aiStore'

const router = useRouter()
const { dailyQuote, loadDailyQuote } = useAiStore()

const navigateToChat = () => {
  router.push('/aichat')
}

onMounted(() => {
  loadDailyQuote()
})
</script>

<template>
  <div class="card bg-ai-purple">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
          <Sparkles :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">台台 AI</h3>
          <span class="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">问答助手</span>
        </div>
      </div>
      <button
        @click.stop="navigateToChat"
        class="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
      >
        <span class="text-xs">聊天</span>
        <ChevronRight :size="14" />
      </button>
    </div>

    <div class="text-center py-4" @click.stop="navigateToChat">
      <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
        <MessageCircle :size="24" class="text-purple-500" />
      </div>
      <p class="text-sm text-gray-600 italic leading-relaxed px-2">
        "{{ dailyQuote || '正在获取今日鼓励...' }}"
      </p>
    </div>

    <p class="text-[11px] text-center text-gray-400">
      点击与台台聊天，解答你的疑问
    </p>
  </div>
</template>

<style scoped>
.card {
  border-radius: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
}
</style>
