import { ref, computed } from 'vue'

const folders = ref([{ id: 1, name: '我的音乐', songs: [] }])
const currentFolderId = ref(1)
const currentSongIndex = ref(-1)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const loopMode = ref('single')
let audioRef = null
let pendingPlay = false

const currentFolder = computed(() => {
  const folder = folders.value.find(f => f.id === currentFolderId.value)
  if (!folder && folders.value.length > 0) {
    currentFolderId.value = folders.value[0].id
    return folders.value[0]
  }
  if (folder) {
    // 确保 songs 始终是数组
    if (!Array.isArray(folder.songs)) {
      folder.songs = []
    }
    return folder
  }
  return { id: 0, name: '我的音乐', songs: [] }
})

const currentSong = computed(() => {
  const songs = currentFolder.value.songs
  if (currentSongIndex.value >= 0 && currentSongIndex.value < songs.length) {
    return songs[currentSongIndex.value]
  }
  return null
})

const progress = () => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
}

const initAudio = () => {
  if (!audioRef) {
    audioRef = new Audio()
    audioRef.volume = volume.value
    audioRef.addEventListener('timeupdate', handleTimeUpdate)
    audioRef.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioRef.addEventListener('ended', handleEnded)
    audioRef.addEventListener('canplay', handleCanPlay)
    audioRef.addEventListener('play', () => {
      isPlaying.value = true
    })
    audioRef.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }
}

const handleCanPlay = () => {
  if (!duration.value && audioRef && audioRef.duration && isFinite(audioRef.duration)) {
    duration.value = audioRef.duration
  }
  if (pendingPlay && audioRef) {
    audioRef.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('播放失败:', err)
      isPlaying.value = false
    })
    pendingPlay = false
  }
}

const handleTimeUpdate = () => {
  if (audioRef) {
    currentTime.value = audioRef.currentTime
  }
}

const handleLoadedMetadata = () => {
  if (audioRef) {
    duration.value = audioRef.duration
  }
}

const handleEnded = () => {
  const songs = currentFolder.value.songs
  if (songs.length === 0) return
  
  if (loopMode.value === 'single') {
    audioRef.currentTime = 0
    audioRef.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('播放失败:', err)
    })
  } else if (loopMode.value === 'shuffle') {
    currentSongIndex.value = Math.floor(Math.random() * songs.length)
    playSong(currentSongIndex.value)
  } else {
    if (currentSongIndex.value < songs.length - 1) {
      currentSongIndex.value++
      playSong(currentSongIndex.value)
    } else {
      currentSongIndex.value = 0
      playSong(0)
    }
  }
}

const playSong = (songIndex) => {
  if (!audioRef) initAudio()
  
  const songs = currentFolder.value.songs
  if (songIndex < 0 || songIndex >= songs.length) return
  
  const song = songs[songIndex]
  currentSongIndex.value = songIndex
  
  if (audioRef.src !== song.url) {
    audioRef.pause()
    audioRef.currentTime = 0
    audioRef.src = song.url
    audioRef.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('播放失败:', err)
      isPlaying.value = false
    })
  } else {
    // 如果是同一首歌，直接播放
    if (!isPlaying.value) {
      audioRef.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.error('播放失败:', err)
        isPlaying.value = false
      })
    }
  }
}

const togglePlay = () => {
  if (!audioRef || !currentSong.value) return
  
  if (isPlaying.value) {
    audioRef.pause()
    isPlaying.value = false
  } else {
    audioRef.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('播放失败:', err)
      isPlaying.value = false
    })
  }
}

const prevSong = () => {
  const songs = currentFolder.value.songs
  if (songs.length === 0) return
  
  if (loopMode.value === 'shuffle') {
    currentSongIndex.value = Math.floor(Math.random() * songs.length)
  } else {
    currentSongIndex.value = currentSongIndex.value > 0 
      ? currentSongIndex.value - 1 
      : songs.length - 1
  }
  
  playSong(currentSongIndex.value)
}

const nextSong = () => {
  const songs = currentFolder.value.songs
  if (songs.length === 0) return
  
  if (loopMode.value === 'shuffle') {
    currentSongIndex.value = Math.floor(Math.random() * songs.length)
  } else {
    currentSongIndex.value = currentSongIndex.value < songs.length - 1 
      ? currentSongIndex.value + 1 
      : 0
  }
  
  playSong(currentSongIndex.value)
}

const toggleLoopMode = () => {
  loopMode.value = loopMode.value === 'list' ? 'single' : 'list'
}

const setVolume = (newVolume) => {
  volume.value = Math.max(0, Math.min(1, newVolume))
  if (audioRef) {
    audioRef.volume = volume.value
  }
}

const seekTo = (time) => {
  if (audioRef) {
    audioRef.currentTime = time
  }
}

const stopAudio = () => {
  if (audioRef) {
    audioRef.pause()
    audioRef.currentTime = 0
    isPlaying.value = false
  }
}

const selectFolder = (folderId) => {
  stopAudio()
  currentFolderId.value = folderId
  currentSongIndex.value = -1
}

const saveMusicData = () => {
  const dataToSave = folders.value.map(folder => ({
    id: folder.id,
    name: folder.name,
    songs: folder.songs.map(song => ({
      id: song.id,
      name: song.name,
      url: song.url
    }))
  }))
  localStorage.setItem('workspace_music', JSON.stringify(dataToSave))
}

const loadMusicData = () => {
  const saved = localStorage.getItem('workspace_music')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      folders.value = data.length > 0 ? data.map(folder => ({
        ...folder,
        name: folder.name || '我的音乐',
        songs: Array.isArray(folder.songs) ? folder.songs.filter(song => {
          if (song.url && song.url.startsWith('blob:')) {
            console.warn('移除无效的 blob URL:', song.name)
            return false
          }
          return true
        }) : []
      })) : [{ id: 1, name: '我的音乐', songs: [] }]
    } catch (e) {
      console.error('加载音乐数据失败:', e)
      folders.value = [{ id: 1, name: '我的音乐', songs: [] }]
    }
  }
}

const addFolder = (name) => {
  if (name.trim()) {
    folders.value.push({
      id: Date.now(),
      name: name.trim(),
      songs: []
    })
    saveMusicData()
  }
}

const deleteFolder = (folderId) => {
  if (folders.value.length > 1) {
    const index = folders.value.findIndex(f => f.id === folderId)
    if (index > -1) {
      folders.value.splice(index, 1)
      if (currentFolderId.value === folderId) {
        currentFolderId.value = folders.value[0].id
        currentSongIndex.value = -1
        stopAudio()
      }
      saveMusicData()
    }
  }
}

const renameFolder = (folderId, name) => {
  const folder = folders.value.find(f => f.id === folderId)
  if (folder && name.trim()) {
    folder.name = name.trim()
    saveMusicData()
  }
}

const addSongs = (files) => {
  const mp3Files = files.filter(f => f.type === 'audio/mpeg' || f.name.endsWith('.mp3'))
  mp3Files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Data = e.target.result
      const songData = {
        id: Date.now() + Math.random(),
        name: file.name.replace('.mp3', ''),
        url: base64Data,
        isBase64: true
      }
      currentFolder.value.songs.push(songData)
      saveMusicData()
    }
    reader.readAsDataURL(file)
  })
}

const deleteSong = (songId) => {
  const index = currentFolder.value.songs.findIndex(s => s.id === songId)
  if (index > -1) {
    currentFolder.value.songs.splice(index, 1)
    if (currentSongIndex.value === index) {
      stopAudio()
      currentSongIndex.value = -1
    } else if (currentSongIndex.value > index) {
      currentSongIndex.value--
    }
    saveMusicData()
  }
}

const moveSong = (songId, targetFolderId) => {
  const sourceFolder = folders.value.find(f => f.id === currentFolderId.value)
  const targetFolder = folders.value.find(f => f.id === targetFolderId)
  
  if (sourceFolder && targetFolder && sourceFolder.id !== targetFolder.id) {
    const songIndex = sourceFolder.songs.findIndex(s => s.id === songId)
    if (songIndex > -1) {
      const [song] = sourceFolder.songs.splice(songIndex, 1)
      targetFolder.songs.push(song)
      
      if (currentSongIndex.value === songIndex) {
        stopAudio()
        currentSongIndex.value = -1
      } else if (currentSongIndex.value > songIndex) {
        currentSongIndex.value--
      }
      saveMusicData()
    }
  }
}

const formatTime = (seconds) => {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const useMusicStore = () => {
  return {
    folders,
    currentFolderId,
    currentSongIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
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
    setVolume,
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
    moveSong,
    formatTime
  }
}
