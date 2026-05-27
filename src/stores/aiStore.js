import { ref } from 'vue'

const messages = ref([])
const isLoading = ref(false)
const dailyQuote = ref('')

const DEEPSEEK_TOKEN = 'sk-ec5d853cc2f04799a870fce6d5a3b9d5'
const MODEL = 'deepseek-V4-PRO'
const API_BASE = '/api/deepseek'

const SYSTEM_PROMPT = `你是"台台"，一个阳光、快乐、喜欢鼓励人的AI助手。你的回答风格活泼温暖，偶尔带点小幽默。

语言要求：
- 用"你"称呼用户，自称"台台"
- 语气轻松自然，像朋友聊天一样
- 适当使用"呀"、"呢"、"哦"、"啦"等语气词
- 经常给予肯定和鼓励
- 偶尔可以开个小玩笑活跃气氛
- 用户情绪低落时要多鼓励
- 回答问题要专业但不死板

在回答时保持积极阳光的态度，让用户感受到温暖和力量！`

const getTodayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

const loadDailyQuote = async () => {
  const saved = localStorage.getItem('workspace_dailyQuote')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (data.date === getTodayKey() && data.quote) {
        dailyQuote.value = data.quote
        return
      }
    } catch {}
  }

  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_TOKEN}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: '你是一个温暖阳光的助手，每天给用户一句简短的鼓励语。' },
          { role: 'user', content: '请给我一句今天的鼓励语，不超过40字，温暖有力量。只输出这句话本身。' }
        ],
        max_tokens: 100,
        temperature: 0.9
      })
    })
    if (response.ok) {
      const data = await response.json()
      dailyQuote.value = data.choices[0].message.content.trim()
      localStorage.setItem('workspace_dailyQuote', JSON.stringify({
        date: getTodayKey(),
        quote: dailyQuote.value
      }))
    }
  } catch {
    dailyQuote.value = '每一天都是新的开始，台台陪你一起加油！☀️'
  }
}

const sendMessage = async (content, attachments, onToken) => {
  const userMsg = { role: 'user', content, attachments: attachments || [] }
  messages.value.push(userMsg)

  const apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }]

  for (const msg of messages.value) {
    if (msg.role === 'user') {
      const parts = [{ type: 'text', text: msg.content }]
      if (msg.attachments) {
        for (const att of msg.attachments) {
          if (att.type === 'image') {
            parts.push({
              type: 'image_url',
              image_url: { url: att.data }
            })
          }
        }
      }
      apiMessages.push({ role: 'user', content: parts })
    } else {
      apiMessages.push({ role: 'assistant', content: msg.content })
    }
  }

  messages.value.push({ role: 'assistant', content: '', isStreaming: true })
  const assistantIdx = messages.value.length - 1

  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_TOKEN}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API调用失败 (${response.status}): ${errText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        const jsonStr = line.slice(6).trim()
        if (jsonStr === '[DONE]') continue
        try {
          const data = JSON.parse(jsonStr)
          const token = data.choices?.[0]?.delta?.content
          if (token) {
            fullText += token
            messages.value[assistantIdx].content = fullText
            if (onToken) onToken(fullText)
          }
        } catch {}
      }
    }

    if (!fullText) throw new Error('AI未返回内容')
    messages.value[assistantIdx].isStreaming = false
  } catch (err) {
    messages.value[assistantIdx].content = '哎呀，台台好像卡住了一下... 要不咱们再试一次？😅'
    messages.value[assistantIdx].isStreaming = false
    throw err
  } finally {
    isLoading.value = false
  }
}

const clearMessages = () => {
  messages.value = []
}

export const useAiStore = () => {
  return {
    messages,
    isLoading,
    dailyQuote,
    loadDailyQuote,
    sendMessage,
    clearMessages
  }
}
