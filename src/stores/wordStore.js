import { ref, computed } from 'vue'

const reviewWords = ref([])
const favoriteWords = ref([])
const currentIndex = ref(0)

const loadWordsData = () => {
  const savedReview = localStorage.getItem('workspace_reviewWords')
  const savedFavorites = localStorage.getItem('workspace_favoriteWords')
  if (savedReview) {
    try { reviewWords.value = JSON.parse(savedReview) } catch (e) { reviewWords.value = [] }
  }
  if (savedFavorites) {
    try { favoriteWords.value = JSON.parse(savedFavorites) } catch (e) { favoriteWords.value = [] }
  }
}

const saveReviewWords = () => {
  localStorage.setItem('workspace_reviewWords', JSON.stringify(reviewWords.value))
}

const saveFavoriteWords = () => {
  localStorage.setItem('workspace_favoriteWords', JSON.stringify(favoriteWords.value))
}

const currentWord = computed(() => {
  if (reviewWords.value.length === 0) return null
  if (currentIndex.value >= reviewWords.value.length) {
    currentIndex.value = 0
  }
  return reviewWords.value[currentIndex.value] || null
})

const isFavorited = computed(() => {
  if (!currentWord.value) return false
  return favoriteWords.value.some(w => w.id === currentWord.value.id)
})

const nextWord = () => {
  if (reviewWords.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % reviewWords.value.length
}

const prevWord = () => {
  if (reviewWords.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + reviewWords.value.length) % reviewWords.value.length
}

const toggleFavorite = () => {
  if (!currentWord.value) return
  const idx = favoriteWords.value.findIndex(w => w.id === currentWord.value.id)
  if (idx > -1) {
    favoriteWords.value.splice(idx, 1)
  } else {
    favoriteWords.value.push({ ...currentWord.value })
  }
  saveFavoriteWords()
}

const addReviewWord = (en, zh) => {
  reviewWords.value.unshift({
    id: Date.now() + Math.random(),
    en: en.trim(),
    zh: zh.trim()
  })
  saveReviewWords()
}

const deleteReviewWord = (id) => {
  const idx = reviewWords.value.findIndex(w => w.id === id)
  if (idx > -1) {
    reviewWords.value.splice(idx, 1)
    if (currentIndex.value >= reviewWords.value.length && reviewWords.value.length > 0) {
      currentIndex.value = reviewWords.value.length - 1
    }
    saveReviewWords()
  }
}

const deleteFavoriteWord = (id) => {
  const idx = favoriteWords.value.findIndex(w => w.id === id)
  if (idx > -1) {
    favoriteWords.value.splice(idx, 1)
    saveFavoriteWords()
  }
}

const moveFavoriteToReview = (id) => {
  const idx = favoriteWords.value.findIndex(w => w.id === id)
  if (idx > -1) {
    const word = favoriteWords.value.splice(idx, 1)[0]
    word.id = Date.now() + Math.random()
    reviewWords.value.unshift(word)
    saveReviewWords()
    saveFavoriteWords()
  }
}

export const useWordStore = () => {
  return {
    reviewWords,
    favoriteWords,
    currentIndex,
    currentWord,
    isFavorited,
    loadWordsData,
    nextWord,
    prevWord,
    toggleFavorite,
    addReviewWord,
    deleteReviewWord,
    deleteFavoriteWord,
    moveFavoriteToReview
  }
}
