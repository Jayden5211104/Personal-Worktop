import PptxGenJS from 'pptxgenjs'

const MODELSCOPE_TOKEN = 'ms-2709a238-9d52-4d44-abf2-635127da8e73'
const MODEL = 'Qwen/Qwen3-235B-A22B'
const API_BASE = '/api/modelscope'

const SYSTEM_PROMPT = `你是一个专业的PPT制作助手。请根据用户提供的文稿内容，生成一份结构清晰的PPT大纲。

要求：
1. 输出必须是严格的JSON格式，不要包含任何其他文字或markdown标记
2. JSON包含两个字段：title（PPT总标题，字符串）和 slides（幻灯片数组）
3. 每张幻灯片包含 title（页标题）和 content（要点数组，每项一个字符串）
4. 幻灯片总数控制在6-10张
5. 每张幻灯片内容要点2-5条，每条不超过30字
6. 根据文稿内容自动提炼重点，不要照搬原文

输出格式：
{"title":"PPT总标题","slides":[{"title":"第一页标题","content":["要点1","要点2"]},{"title":"第二页标题","content":["要点1","要点2","要点3"]}]}`

function extractJson(text) {
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }
  const braceStart = text.indexOf('{')
  const braceEnd = text.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1)
  }
  return text.trim()
}

export async function generatePptContent(userInput) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `请根据以下文稿生成PPT大纲：\n\n${userInput}` }
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
      max_tokens: 4096
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API调用失败 (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const rawContent = data.choices[0].message.content
  const jsonStr = extractJson(rawContent)

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    throw new Error(`AI返回的内容无法解析为JSON：${jsonStr.slice(0, 200)}...`)
  }

  if (!parsed.title || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('AI返回的数据缺少必要的title或slides字段')
  }

  return parsed
}

export function createAndDownloadPptx(pptData) {
  const pres = new PptxGenJS()

  pres.layout = 'LAYOUT_WIDE'
  pres.author = 'Workspace PPT Generator'

  const titleSlide = pres.addSlide()
  titleSlide.background = { fill: '1a1a2e' }
  titleSlide.addText(pptData.title, {
    x: 0.5, y: 1.5, w: '90%', h: 1.5,
    fontSize: 36, bold: true, color: 'FFFFFF',
    align: 'center', fontFace: 'Microsoft YaHei'
  })
  titleSlide.addText('Workspace 智能生成', {
    x: 0.5, y: 3.2, w: '90%', h: 0.8,
    fontSize: 14, color: 'AAAAAA',
    align: 'center', fontFace: 'Microsoft YaHei'
  })

  const slideColors = ['16213e', '0f3460', '533483', '1a1a2e', '2d4059', '4a235a', '1b4332', '3d2c2e']

  pptData.slides.forEach((slide, index) => {
    const s = pres.addSlide()
    const bgColor = slideColors[index % slideColors.length]
    s.background = { fill: bgColor }

    s.addText(slide.title, {
      x: 0.5, y: 0.3, w: '90%', h: 1.0,
      fontSize: 28, bold: true, color: 'FFFFFF',
      fontFace: 'Microsoft YaHei'
    })

    s.addShape(pres.ShapeType.rect, {
      x: 0.5, y: 1.2, w: 0.08, h: 0.4,
      fill: { color: 'e94560' }
    })

    const bullets = slide.content.map(item => ({
      text: item,
      options: {
        fontSize: 16, color: 'E0E0E0',
        fontFace: 'Microsoft YaHei',
        bullet: { color: 'e94560', type: 'number' },
        paraSpaceAfter: 8
      }
    }))

    s.addText(bullets, {
      x: 0.8, y: 1.8, w: '85%', h: 3.5,
      valign: 'top'
    })
  })

  pres.writeFile({ fileName: `${pptData.title || 'presentation'}.pptx` })
}
