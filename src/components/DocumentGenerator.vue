<script setup>
import { ref, computed } from 'vue'
import { FileText, ChevronRight, Loader2, Copy, Check, RefreshCw, ChevronDown } from '@lucide/vue'
import { generateDocument, DOC_TYPES } from '../services/docService'

const topic = ref('')
const wordCount = ref(800)
const selectedType = ref('ppt')
const isGenerating = ref(false)
const generatedText = ref('')
const errorMessage = ref('')
const copied = ref(false)
const showTypeMenu = ref(false)

const canGenerate = computed(() => topic.value.trim().length >= 2 && !isGenerating.value)

const statusText = computed(() => {
  if (isGenerating.value) return '生成中...'
  if (generatedText.value) return '已完成'
  return '待输入'
})

const statusClass = computed(() => {
  if (isGenerating.value) return 'text-blue-500 bg-blue-100'
  if (generatedText.value) return 'text-green-500 bg-green-100'
  return 'text-teal-500 bg-teal-100'
})

const wordCountPresets = [300, 500, 800, 1000, 1500, 2000, 3000]

const handleGenerate = async () => {
  if (!canGenerate.value) return

  isGenerating.value = true
  errorMessage.value = ''
  generatedText.value = ''

  try {
    await generateDocument(topic.value, wordCount.value, selectedType.value, (text) => {
      generatedText.value = text
    })
  } catch (err) {
    errorMessage.value = err.message || '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}

const handleCopy = async () => {
  if (!generatedText.value) return
  try {
    await navigator.clipboard.writeText(generatedText.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = generatedText.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const handleReset = () => {
  generatedText.value = ''
  errorMessage.value = ''
}

const selectType = (type) => {
  selectedType.value = type
  showTypeMenu.value = false
}
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
          <FileText :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">文稿生成</h3>
          <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass">{{ statusText }}</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
        <span class="text-xs">AI</span>
        <ChevronRight :size="14" />
      </button>
    </div>

    <div class="relative mb-2">
      <button
        @click.stop="showTypeMenu = !showTypeMenu"
        class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-teal-300 transition-colors"
      >
        <span>{{ DOC_TYPES[selectedType] }}</span>
        <ChevronDown :size="14" class="text-gray-400" />
      </button>
      <div
        v-if="showTypeMenu"
        class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
      >
        <div
          v-for="(label, key) in DOC_TYPES"
          :key="key"
          @click.stop="selectType(key)"
          class="px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 transition-colors"
          :class="selectedType === key ? 'text-teal-600 bg-teal-50 font-medium' : 'text-gray-600'"
        >
          {{ label }}
        </div>
      </div>
    </div>

    <input
      v-model="topic"
      type="text"
      placeholder="输入文稿主题..."
      class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors mb-2"
      @keyup.enter="handleGenerate"
    />

    <div class="flex items-center gap-2 mb-3">
      <span class="text-xs text-gray-500 shrink-0">字数</span>
      <div class="flex gap-1 flex-1 overflow-x-auto">
        <button
          v-for="n in wordCountPresets"
          :key="n"
          @click.stop="wordCount = n"
          class="px-2 py-0.5 text-xs rounded-full border transition-colors shrink-0"
          :class="wordCount === n ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'"
        >
          {{ n }}
        </button>
      </div>
      <input
        v-model.number="wordCount"
        type="number"
        min="100"
        max="5000"
        step="100"
        class="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-xs text-center focus:outline-none focus:border-teal-400"
      />
    </div>

    <button
      @click.stop="handleGenerate"
      :disabled="!canGenerate"
      class="w-full py-2.5 bg-teal-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      <Loader2 v-if="isGenerating" :size="16" class="animate-spin" />
      <FileText v-else :size="16" />
      <span>{{ isGenerating ? 'AI 正在撰写...' : '生成文稿' }}</span>
    </button>

    <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
      {{ errorMessage }}
    </div>

    <div v-if="generatedText && !isGenerating" class="mt-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-gray-500">已生成 {{ generatedText.length }} 字</span>
        <div class="flex gap-1">
          <button
            @click.stop="handleCopy"
            class="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
            :class="copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <Check v-if="copied" :size="12" />
            <Copy v-else :size="12" />
            {{ copied ? '已复制' : '复制' }}
          </button>
          <button
            @click.stop="handleReset"
            class="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw :size="12" />
            重写
          </button>
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {{ generatedText }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
}
</style>
