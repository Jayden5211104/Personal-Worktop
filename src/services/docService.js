const MODELSCOPE_TOKEN = 'ms-11a156bb-e5de-4d6c-a6a0-403d9498839f'
const MODEL = 'Qwen/Qwen3-235B-A22B'
const API_BASE = '/api/modelscope'

const DOC_TYPES = {
  ppt: 'PPT演示文稿',
  speech: '演讲稿',
  report: '工作报告',
  article: '公众号文章',
  plan: '项目方案',
  summary: '会议纪要'
}

function buildPrompt(topic, wordCount, docType) {
  const typeName = DOC_TYPES[docType] || '文稿'
  return `你是一位专业的文稿撰写专家。请根据以下要求生成一篇${typeName}：

主题：${topic}
文章类型：${typeName}
字数要求：约${wordCount}字

要求：
1. 内容专业、结构清晰、语言流畅
2. 使用中文撰写
3. 包含标题和分段结构
4. 结尾可以加上总结或建议
5. 直接输出正文内容，不要输出"好的，我来帮你写"之类的开场白

请严格按照上述要求输出文稿内容。`
}

export async function generateDocument(topic, wordCount, docType, onChunk) {
  const systemPrompt = buildPrompt(topic, wordCount, docType)
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请撰写关于"${topic}"的${DOC_TYPES[docType] || '文稿'}，约${wordCount}字。` }
  ]

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MODELSCOPE_TOKEN}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: Math.max(4096, wordCount * 2),
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
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

    for (const line of lines) {
      const jsonStr = line.slice(6).trim()
      if (jsonStr === '[DONE]') continue

      try {
        const data = JSON.parse(jsonStr)
        const content = data.choices?.[0]?.delta?.content
        if (content) {
          fullText += content
          if (onChunk) onChunk(fullText)
        }
      } catch (e) {
        // 跳过解析失败的行
      }
    }
  }

  if (!fullText) {
    throw new Error('AI未返回任何内容，请重试')
  }

  return fullText
}

export { DOC_TYPES }
