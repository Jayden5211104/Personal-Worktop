<script setup>
import { ref } from 'vue'
import { Link } from '@lucide/vue'

const links = ref([])
const showAddLink = ref(false)
const newLinkName = ref('')
const newLinkUrl = ref('')

const addLink = () => {
  if (newLinkName.value.trim() && newLinkUrl.value.trim()) {
    links.value.push({
      id: Date.now(),
      name: newLinkName.value.trim(),
      url: newLinkUrl.value.trim()
    })
    newLinkName.value = ''
    newLinkUrl.value = ''
    showAddLink.value = false
  }
}

const deleteLink = (id) => {
  links.value = links.value.filter(l => l.id !== id)
}

const openLink = (url) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="card bg-links-pink">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
          <Link :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">快速链接</h3>
          <span class="text-xs text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">常用链接</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 transition-colors">
        <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="space-y-2 mb-3">
      <div class="text-sm text-gray-600 mb-2">常用链接</div>
      
      <div v-if="links.length === 0" class="text-center py-6">
        <Link :size="32" class="text-pink-300 mx-auto mb-2" />
        <span class="text-gray-400 text-sm">点击添加常用链接</span>
      </div>
      
      <div 
        v-for="link in links" 
        :key="link.id"
        class="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-pink-50 transition-colors group cursor-pointer"
        @click="openLink(link.url)"
      >
        <div class="flex items-center gap-2">
          <Link :size="14" class="text-pink-400" />
          <span class="text-sm text-gray-700">{{ link.name }}</span>
        </div>
        <button 
          @click.stop="deleteLink(link.id)"
          class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
        >
          <svg :width="14" :height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showAddLink" class="space-y-2 mb-3">
      <input 
        v-model="newLinkName"
        type="text" 
        placeholder="链接名称"
        class="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
      <input 
        v-model="newLinkUrl"
        type="url" 
        placeholder="链接地址"
        class="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
      <div class="flex gap-2">
        <button 
          @click="addLink"
          class="flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 transition-colors"
        >
          添加
        </button>
        <button 
          @click="showAddLink = false"
          class="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          取消
        </button>
      </div>
    </div>

    <button 
      v-if="!showAddLink"
      @click="showAddLink = true"
      class="w-full py-2.5 bg-pink-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors"
    >
      <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      <span>添加链接</span>
    </button>
  </div>
</template>