<script setup>
import { ref, computed } from 'vue'
import { Presentation, Upload, FileText, Download, Loader2, X, CheckCircle2, AlertCircle, ChevronRight } from '@lucide/vue'
import { generatePptContent, createAndDownloadPptx } from '../services/pptService'

const isOpen = ref(false)
const isGenerating = ref(false)
const inputText = ref('')
const generatedData = ref(null)
const errorMessage = ref('')
const fileName = ref('')
const slideCount = ref(0)

const canGenerate = computed(() => inputText.value.trim().length >= 20)

const statusText = computed(() => {
  if (isGenerating.value) return '生成中...'
  if (generatedData.value) return '已完成'
  return '待输入'
})

const statusClass = computed(() => {
  if (isGenerating.value) return 'text-blue-500 bg-blue-100'
  if (generatedData.value) return 'text-green-500 bg-green-100'
  return 'text-yellow-500 bg-yellow-100'
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  fileName.value = file.name
  const ext = file.name.split('.').pop().toLowerCase()
  const validExts = ['txt', 'md']

  if (!validExts.includes(ext)) {
    errorMessage.value = '仅支持 .txt 和 .md 格式文件'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    inputText.value = e.target.result
    errorMessage.value = ''
  }
  reader.onerror = () => {
    errorMessage.value = '文件读取失败，请重试'
  }
  reader.readAsText(file, 'UTF-8')
  event.target.value = ''
}

const handleDrop = (e) => {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (!file) return
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = (ev) => {
    inputText.value = ev.target.result
    errorMessage.value = ''
  }
  reader.readAsText(file, 'UTF-8')
}

const handleDragOver = (e) => {
  e.preventDefault()
}

const clearInput = () => {
  inputText.value = ''
  fileName.value = ''
  errorMessage.value = ''
}

const handleGenerate = async () => {
  if (!canGenerate.value || isGenerating.value) return

  isGenerating.value = true
  errorMessage.value = ''
  generatedData.value = null

  try {
    const data = await generatePptContent(inputText.value)
    generatedData.value = data
    slideCount.value = data.slides.length
  } catch (err) {
    errorMessage.value = err.message || '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}

const handleDownload = () => {
  if (!generatedData.value) return
  createAndDownloadPptx(generatedData.value)
}
</script>

<template>
  <div class="card bg-ppt-yellow" @click.stop="isOpen = true">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
          <Presentation :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">PPT 生成</h3>
          <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass">{{ statusText }}</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
        <span class="text-xs">展开</span>
        <ChevronRight :size="14" />
      </button>
    </div>

    <div
      class="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-3"
      :class="inputText ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click.stop
    >
      <template v-if="!inputText">
        <Upload :size="24" class="mx-auto text-gray-400 mb-2" />
        <p class="text-sm text-gray-500">拖拽或点击上传文稿</p>
        <p class="text-xs text-gray-400 mt-1">支持 .txt / .md 文件</p>
        <input
          type="file"
          accept=".txt,.md"
          class="hidden"
          id="ppt-file-input"
          @change="handleFileUpload"
        />
        <label
          for="ppt-file-input"
          class="mt-2 inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-sm rounded-lg cursor-pointer hover:bg-yellow-200 transition-colors"
          @click.stop
        >
          选择文件
        </label>
      </template>
      <template v-else>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <FileText :size="16" class="text-yellow-500" />
            <span class="text-sm text-gray-700 truncate max-w-[150px]">{{ fileName || '手动输入' }}</span>
          </div>
          <button @click.stop="clearInput" class="text-gray-400 hover:text-red-500 transition-colors">
            <X :size="16" />
          </button>
        </div>
        <textarea
          v-model="inputText"
          class="w-full h-24 text-sm p-2 border border-yellow-200 rounded-lg resize-none focus:outline-none focus:border-yellow-400 bg-white"
          placeholder="在此输入或粘贴文稿内容..."
          @click.stop
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">已输入 {{ inputText.length }} 字</p>
      </template>
    </div>

    <button
      @click.stop="handleGenerate"
      :disabled="!canGenerate || isGenerating"
      class="w-full py-3 bg-yellow-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      <Loader2 v-if="isGenerating" :size="18" class="animate-spin" />
      <Presentation v-else :size="18" />
      <span>{{ isGenerating ? 'AI 正在生成 PPT...' : '生成 PPT' }}</span>
    </button>

    <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
      <AlertCircle :size="16" class="text-red-500 mt-0.5 shrink-0" />
      <p class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>

    <div v-if="generatedData && !isGenerating" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center gap-2 mb-2">
        <CheckCircle2 :size="16" class="text-green-500" />
        <span class="text-sm font-medium text-green-700">PPT 大纲已生成</span>
      </div>
      <p class="text-sm text-green-600 mb-2">标题：{{ generatedData.title }}（共 {{ slideCount }} 页）</p>
      <div class="max-h-32 overflow-y-auto space-y-1 mb-3">
        <div v-for="(slide, i) in generatedData.slides" :key="i" class="text-xs text-gray-600 pl-2 border-l-2 border-green-300">
          <span class="font-medium">{{ i + 1 }}. {{ slide.title }}</span>
        </div>
      </div>
      <button
        @click.stop="handleDownload"
        class="w-full py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors text-sm font-medium"
      >
        <Download :size="16" />
        <span>下载 PPTX 文件</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}
</style>
