<script setup>
import { ref } from 'vue'
import { FileText } from '@lucide/vue'

const notes = ref([])
const showNewNote = ref(false)
const newNoteTitle = ref('')
const newNoteContent = ref('')

const createNote = () => {
  if (newNoteTitle.value.trim()) {
    notes.value.push({
      id: Date.now(),
      title: newNoteTitle.value.trim(),
      content: newNoteContent.value.trim(),
      createdAt: new Date().toLocaleString()
    })
    newNoteTitle.value = ''
    newNoteContent.value = ''
    showNewNote.value = false
  }
}

const deleteNote = (id) => {
  notes.value = notes.value.filter(n => n.id !== id)
}
</script>

<template>
  <div class="card bg-notes-purple">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
          <FileText :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">笔记</h3>
          <span class="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">笔记</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 transition-colors">
        <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="space-y-2 mb-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">我的笔记</span>
        <span class="text-gray-400">{{ notes.length }}</span>
      </div>
      
      <div v-if="notes.length === 0" class="text-center py-6 text-gray-400 text-sm">
        暂无笔记
      </div>
      
      <div 
        v-for="note in notes" 
        :key="note.id"
        class="p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group"
      >
        <div class="flex justify-between items-start">
          <h4 class="font-medium text-gray-800 text-sm">{{ note.title }}</h4>
          <button 
            @click="deleteNote(note.id)"
            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
          >
            <svg :width="14" :height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ note.createdAt }}</p>
      </div>
    </div>

    <div v-if="showNewNote" class="space-y-2 mb-3">
      <input 
        v-model="newNoteTitle"
        type="text" 
        placeholder="笔记标题"
        class="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <textarea 
        v-model="newNoteContent"
        placeholder="笔记内容..."
        rows="2"
        class="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
      ></textarea>
      <div class="flex gap-2">
        <button 
          @click="createNote"
          class="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
        >
          创建
        </button>
        <button 
          @click="showNewNote = false"
          class="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          取消
        </button>
      </div>
    </div>

    <button 
      v-if="!showNewNote"
      @click="showNewNote = true"
      class="w-full py-2.5 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
    >
      <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      <span>新建笔记</span>
    </button>
  </div>
</template>