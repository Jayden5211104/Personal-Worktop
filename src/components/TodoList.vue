<script setup>
import { ref, onMounted, watch } from 'vue'
import { CheckCircle, Plus, Circle } from '@lucide/vue'

const tasks = ref([])
const newTask = ref('')

const loadTasks = () => {
  const saved = localStorage.getItem('workspace_tasks')
  if (saved) {
    try {
      tasks.value = JSON.parse(saved)
    } catch (e) {
      tasks.value = []
    }
  }
}

const saveTasks = () => {
  localStorage.setItem('workspace_tasks', JSON.stringify(tasks.value))
}

const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({
      id: Date.now(),
      text: newTask.value.trim(),
      completed: false
    })
    newTask.value = ''
  }
}

const toggleTask = (id) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
  }
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

const completedCount = () => tasks.value.filter(t => t.completed).length

onMounted(() => {
  loadTasks()
})

watch(tasks, () => {
  saveTasks()
}, { deep: true })
</script>

<template>
  <div class="card bg-todo-green">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
          <CheckCircle :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">待办清单</h3>
          <span class="text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded-full">待完成</span>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 transition-colors">
        <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="flex justify-between text-sm text-gray-500 mb-3">
      <span>已完成 <span class="font-semibold text-green-600">{{ completedCount() }}</span></span>
      <span>共 <span class="font-semibold text-green-600">{{ tasks.length }}</span> 项</span>
    </div>

    <div class="space-y-2 max-h-40 overflow-y-auto mb-3">
      <div v-if="tasks.length === 0" class="text-center py-6 text-gray-400 text-sm">
        暂无任务
      </div>
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors group"
      >
        <button @click="toggleTask(task.id)" class="flex-shrink-0">
          <CheckCircle v-if="task.completed" :size="18" class="text-green-500" />
          <Circle v-else :size="18" class="text-gray-400 hover:text-green-500" />
        </button>
        <span 
          :class="[
            'flex-1 text-sm',
            task.completed ? 'line-through text-gray-400' : 'text-gray-700'
          ]"
        >{{ task.text }}</span>
        <button 
          @click="deleteTask(task.id)" 
          class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
        >
          <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input 
        v-model="newTask"
        @keyup.enter="addTask"
        type="text" 
        placeholder="添加任务..."
        class="flex-1 px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button 
        @click="addTask"
        class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
      >
        <Plus :size="16" class="text-white" />
      </button>
    </div>
  </div>
</template>