<script setup>
import { ref, onMounted, watch } from 'vue';
import { ArrowLeft, Plus, Music, Folder, Upload, Play, Pause, SkipBack, SkipForward, Repeat, List, Trash2, Edit3, FolderOpen, Check } from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useMusicStore } from '../stores/musicStore';

const router = useRouter();
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
  stopAudio,
  selectFolder,
  saveMusicData,
  loadMusicData,
  addFolder,
  deleteFolder,
  renameFolder,
  addSongs,
  deleteSong,
  formatTime
} = useMusicStore();

const showAddFolderModal = ref(false);
const newFolderName = ref('');
const isDragging = ref(false);
const fileInputRef = ref(null);
const editingSongId = ref(null);
const editingSongName = ref('');

const handleUploadClick = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    addSongs(files);
  }
  event.target.value = '';
};

const handleDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    addSongs(files);
  }
};

const handleAddFolder = () => {
  if (newFolderName.value.trim()) {
    addFolder(newFolderName.value);
    newFolderName.value = '';
    showAddFolderModal.value = false;
  }
};

const handleDeleteFolder = (folderId) => {
  deleteFolder(folderId);
};

const handleDeleteSong = (songId) => {
  deleteSong(songId);
};

const startEditSong = (song) => {
  editingSongId.value = song.id;
  editingSongName.value = song.name;
};

const saveEditSong = (song) => {
  if (editingSongName.value.trim()) {
    song.name = editingSongName.value.trim();
    saveMusicData();
  }
  editingSongId.value = null;
  editingSongName.value = '';
};

const cancelEditSong = () => {
  editingSongId.value = null;
  editingSongName.value = '';
};

const handleSeekTo = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  seekTo(percent * duration.value);
};

const goBack = () => {
  router.push('/');
};

const handlePlayClick = () => {
  togglePlay();
};

const handlePrevClick = () => {
  prevSong();
};

const handleNextClick = () => {
  nextSong();
};

const handleLoopModeClick = () => {
  toggleLoopMode();
};

const handlePlaySongClick = (index) => {
  playSong(index);
};

onMounted(() => {
  initAudio();
  loadMusicData();
});

watch(currentSongIndex, () => {
  saveMusicData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <button 
          @click="goBack"
          class="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft :size="20" />
          <span>返回首页</span>
        </button>
        <h1 class="text-xl font-bold text-gray-800">音乐管理</h1>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                <Folder :size="18" class="text-purple-500" />
                我的歌单
              </h3>
              <button 
                @click="showAddFolderModal = true"
                class="p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              >
                <Plus :size="16" />
              </button>
            </div>
            
            <div class="space-y-1">
              <div 
                v-for="folder in folders" 
                :key="folder.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors"
                :class="currentFolderId.value === folder.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'"
                @click="selectFolder(folder.id)"
              >
                <span class="flex items-center gap-2 truncate">
                  <FolderOpen :size="16" />
                  {{ folder.name }}
                </span>
                <button 
                  v-if="folders.length > 1"
                  @click.stop="handleDeleteFolder(folder.id)"
                  class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div 
              class="border-2 border-dashed rounded-xl p-12 text-center transition-colors"
              :class="isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
              @click="handleUploadClick"
            >
              <Upload :size="48" :class="isDragging ? 'text-purple-500' : 'text-gray-400'" />
              <p class="mt-4 text-gray-600">点击或拖拽上传音乐</p>
              <p class="mt-1 text-sm text-gray-400">支持 MP3 格式，可多选</p>
            </div>

            <input 
              ref="fileInputRef"
              id="file-input"
              type="file" 
              multiple 
              accept="audio/mpeg,.mp3" 
              class="hidden"
              @change="handleFileUpload"
            />

            <div class="p-4">
              <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Music :size="18" class="text-purple-500" />
                {{ currentFolder.name }}
              </h3>
              
              <div class="space-y-2">
                <div 
                  v-for="(song, index) in currentFolder.songs" 
                  :key="song.id"
                  class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  :class="currentSongIndex.value === index ? 'bg-purple-50' : ''"
                >
                  <button 
                    @click="handlePlaySongClick(index)"
                    class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    :class="currentSongIndex.value === index ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    <Pause v-if="currentSongIndex.value === index && isPlaying.value" :size="14" />
                    <Play v-else :size="14" class="ml-0.5" />
                  </button>
                  
                  <div class="flex-1 min-w-0">
                    <div v-if="editingSongId === song.id" class="flex items-center gap-2">
                      <input 
                        v-model="editingSongName"
                        class="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                        @keyup.enter="saveEditSong(song)"
                      />
                      <button 
                        @click="saveEditSong(song)"
                        class="p-1 text-green-500 hover:bg-green-50 rounded"
                      >
                        <Check :size="14" />
                      </button>
                    </div>
                    <span v-else class="text-sm text-gray-700 truncate">{{ song.name }}</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <button 
                      @click="startEditSong(song)"
                      class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 :size="14" />
                    </button>
                    <button 
                      @click="handleDeleteSong(song.id)"
                      class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>
                <div v-if="currentFolder.songs.length === 0" class="text-center py-8 text-gray-400">
                  暂无音乐，请上传
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div class="max-w-4xl mx-auto flex items-center gap-4">
        <button 
          @click="handlePlaySongClick(currentSongIndex.value)"
          :disabled="!currentSong"
          class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center disabled:opacity-50"
        >
          <Music :size="24" class="text-purple-500" />
        </button>
        
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 truncate">{{ currentSong?.name || '未播放' }}</span>
            <span class="text-xs text-gray-400">{{ formatTime(currentTime.value) }} / {{ formatTime(duration.value) }}</span>
          </div>
          <div 
            class="h-1.5 bg-gray-200 rounded-full cursor-pointer"
            @click="handleSeekTo"
          >
            <div 
              class="h-full bg-purple-500 rounded-full transition-all"
              :style="{ width: `${progress()}%` }"
            ></div>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button 
            @click="handlePrevClick" 
            :disabled="currentFolder.songs.length === 0"
            class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <SkipBack :size="16" class="text-gray-600" />
          </button>
          
          <button 
            @click="handlePlayClick" 
            :disabled="!currentSong"
            class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-lg"
          >
            <Pause v-if="isPlaying.value" :size="20" class="text-white" />
            <Play v-else :size="20" class="text-white ml-0.5" />
          </button>
          
          <button 
            @click="handleNextClick" 
            :disabled="currentFolder.songs.length === 0"
            class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <SkipForward :size="16" class="text-gray-600" />
          </button>
        </div>

        <button 
          @click="handleLoopModeClick"
          :disabled="currentFolder.songs.length === 0"
          class="p-2 rounded-lg transition-colors disabled:opacity-50"
          :class="loopMode.value !== 'list' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-500'"
        >
          <Repeat v-if="loopMode.value === 'single'" :size="18" />
          <List v-else :size="18" />
        </button>
      </div>
    </div>

    <div v-if="showAddFolderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-80">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">新建歌单</h3>
        <input 
          v-model="newFolderName"
          type="text" 
          placeholder="歌单名称"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          @keyup.enter="handleAddFolder"
        />
        <div class="flex justify-end gap-2 mt-4">
          <button 
            @click="showAddFolderModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            @click="handleAddFolder"
            class="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
