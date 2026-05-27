<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ArrowLeft, Send, Image, Paperclip, Sparkles, X, FileText, Trash2, MessageCircle } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAiStore } from '../stores/aiStore'

const router = useRouter()
const { messages, isLoading, sendMessage, clearMessages, loadDailyQuote } = useAiStore()

const inputText = ref('')
const attachments = ref([])
const chatContainer = ref(null)
const fileInput = ref(null)
const imageInput = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const reader = new FileReader()
    reader.onload = (ev) => {
      attachments.value.push({
        type: 'image',
        name: file.name,
        data: ev.target.result,
        preview: ev.target.result
      })
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

const handlePdfUpload = (e) => {
  const files = Array.from(e.target.files)
  for (const file of files) {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) continue
    attachments.value.push({
      type: 'pdf',
      name: file.name,
      data: file.name
    })
  }
  e.target.value = ''
}

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text && attachments.value.length === 0) return
  if (isLoading.value) return

  const content = text || '请查看附件内容'
  const atts = [...attachments.value]
  inputText.value = ''
  attachments.value = []

  scrollToBottom()
  await sendMessage(content, atts)
  scrollToBottom()
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const goBack = () => {
  router.push('/')
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(async () => {
  await loadDailyQuote()
  scrollToBottom()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <header class="bg-white shadow-sm shrink-0">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft :size="20" />
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <Sparkles :size="16" class="text-white" />
            </div>
            <div>
              <h1 class="font-semibold text-gray-800">台台</h1>
              <p class="text-[11px] text-gray-400">你的AI问答助手</p>
            </div>
          </div>
        </div>
        <button
          @click="clearMessages"
          class="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          :disabled="messages.length === 0"
        >
          <Trash2 :size="14" />
          <span>清空对话</span>
        </button>
      </div>
    </header>

    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto px-4 py-6"
    >
      <div class="max-w-2xl mx-auto space-y-4">
        <div v-if="messages.length === 0" class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <MessageCircle :size="32" class="text-purple-500" />
          </div>
          <h2 class="text-lg font-semibold text-gray-700 mb-1">你好呀！我是台台 ✨</h2>
          <p class="text-sm text-gray-500">阳光、快乐、喜欢鼓励人的问答助手</p>
          <p class="text-sm text-gray-400 mt-1">可以问我任何问题，也支持上传图片和PDF哦</p>
          <div class="flex flex-wrap justify-center gap-2 mt-4">
            <button
              v-for="q in ['今天心情不太好怎么办？', '帮我写一篇演讲稿', '解释一下什么是人工智能']"
              :key="q"
              @click="inputText = q; handleSend()"
              class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shrink-0 mt-1"
          >
            <Sparkles :size="12" class="text-white" />
          </div>

          <div
            class="max-w-[80%] rounded-2xl px-4 py-3"
            :class="msg.role === 'user'
              ? 'bg-purple-500 text-white rounded-br-md'
              : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md'"
          >
            <div v-if="msg.attachments?.length" class="flex flex-wrap gap-1 mb-2">
              <div
                v-for="(att, ai) in msg.attachments"
                :key="ai"
                class="relative"
              >
                <img
                  v-if="att.type === 'image'"
                  :src="att.preview"
                  class="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                />
                <div
                  v-if="att.type === 'pdf'"
                  class="flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-xs"
                >
                  <FileText :size="12" />
                  {{ att.name }}
                </div>
              </div>
            </div>
            <div
              class="text-sm leading-relaxed whitespace-pre-wrap"
              :class="msg.role === 'assistant' ? 'ai-response' : ''"
            >{{ msg.content || '...' }}</div>
            <div
              v-if="msg.isStreaming"
              class="inline-block w-1.5 h-4 bg-purple-400 rounded-full animate-pulse align-middle ml-1"
            ></div>
          </div>

          <div
            v-if="msg.role === 'user'"
            class="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center shrink-0 mt-1 text-xs text-white font-medium"
          >
            U
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white border-t border-gray-100 shrink-0">
      <div class="max-w-2xl mx-auto px-4 py-3">
        <div v-if="attachments.length" class="flex gap-2 mb-2 flex-wrap">
          <div
            v-for="(att, i) in attachments"
            :key="i"
            class="relative group"
          >
            <img
              v-if="att.type === 'image'"
              :src="att.preview"
              class="w-16 h-16 rounded-lg object-cover border border-gray-200"
            />
            <div
              v-if="att.type === 'pdf'"
              class="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600"
            >
              <FileText :size="12" />
              {{ att.name }}
            </div>
            <button
              @click="removeAttachment(i)"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X :size="10" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleImageUpload"
          />
          <button
            @click="imageInput?.click()"
            class="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
            title="上传图片"
          >
            <Image :size="20" />
          </button>

          <input
            ref="fileInput"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handlePdfUpload"
          />
          <button
            @click="fileInput?.click()"
            class="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
            title="上传PDF"
          >
            <Paperclip :size="20" />
          </button>

          <div class="flex-1 relative">
            <textarea
              v-model="inputText"
              @keydown="handleKeydown"
              placeholder="问台台任何问题..."
              rows="1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
            ></textarea>
          </div>

          <button
            @click="handleSend"
            :disabled="(!inputText.trim() && attachments.length === 0) || isLoading"
            class="p-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-response {
  line-height: 1.8;
}

.ai-response :deep(strong) {
  color: #7c3aed;
}
</style>
