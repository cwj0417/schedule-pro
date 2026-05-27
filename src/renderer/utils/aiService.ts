export interface AIProvider {
  value: string
  label: string
  apiEndpoint?: string
  models: AIModel[]
}

export interface AIModel {
  id: string
  name: string
}

export interface ConfiguredProvider {
  value: string
  label: string
  models: AIModel[]
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-5.5', name: 'GPT-5.5' },
      { id: 'gpt-5.5-instant', name: 'GPT-5.5 Instant' },
      { id: 'gpt-5.4', name: 'GPT-5.4' },
      { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini' },
      { id: 'gpt-5.3-instant', name: 'GPT-5.3 Instant' },
      { id: 'o3', name: 'o3' },
      { id: 'o4-mini', name: 'o4-mini' }
    ]
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' }
    ]
  },
  {
    value: 'bigmodel',
    label: '智谱 BigModel',
    apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { id: 'glm-5.1', name: 'GLM-5.1' },
      { id: 'glm-5-turbo', name: 'GLM-5 Turbo' },
      { id: 'glm-5', name: 'GLM-5' },
      { id: 'glm-4.7', name: 'GLM-4.7' },
      { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash' }
    ]
  },
  {
    value: 'baidu',
    label: '百度文心一言',
    apiEndpoint: 'https://qianfan.baidubce.com/v2/chat/completions',
    models: [
      { id: 'ernie-5.1', name: '文心 5.1' },
      { id: 'ernie-5.0', name: '文心 5.0' },
      { id: 'ernie-4.0-8k-latest', name: '文心 4.0 8K' }
    ]
  },
  {
    value: 'ali',
    label: '阿里云通义千问',
    apiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { id: 'qwen3.7-max', name: 'Qwen3.7 Max' },
      { id: 'qwen3.6-plus', name: 'Qwen3.6 Plus' },
      { id: 'qwen3.6-flash', name: 'Qwen3.6 Flash' },
      { id: 'qwen-long', name: 'Qwen Long' }
    ]
  },
  {
    value: 'google',
    label: 'Google AI',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: [
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
      { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }
    ]
  },
  {
    value: 'azure',
    label: 'Azure OpenAI',
    apiEndpoint: '',
    models: [
      { id: 'gpt-5.5', name: 'GPT-5.5' },
      { id: 'gpt-5.4', name: 'GPT-5.4' },
      { id: 'gpt-5.3-instant', name: 'GPT-5.3 Instant' },
      { id: 'gpt-4.1', name: 'GPT-4.1' }
    ]
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    apiEndpoint: 'https://api.deepseek.com/chat/completions',
    models: [
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
      { id: 'deepseek-r1', name: 'DeepSeek R1' }
    ]
  }
]

function getInvoke() {
  return (window as any).apis?.invoke
}

export async function getAIConfig(): Promise<{ provider: string; token: string } | null> {
  try {
    const invoke = getInvoke()
    if (!invoke) {
      throw new Error('无法访问invoke')
    }
    const provider = await invoke('getSelectedAIProvider') as string
    const token = await invoke('getAIToken', provider) as string
    if (!provider || !token) {
      return null
    }
    return { provider, token }
  } catch (error) {
    console.error('获取AI配置失败:', error)
    return null
  }
}

export async function getConfiguredProviders(): Promise<ConfiguredProvider[]> {
  try {
    const invoke = getInvoke()
    if (!invoke) {
      return []
    }
    
    const configuredProviders: ConfiguredProvider[] = []
    
    for (const provider of AI_PROVIDERS) {
      const token = await invoke('getAIToken', provider.value) as string
      if (token && token.trim() !== '') {
        configuredProviders.push({
          value: provider.value,
          label: provider.label,
          models: provider.models
        })
      }
    }
    
    return configuredProviders
  } catch (error) {
    console.error('获取已配置的AI提供商失败:', error)
    return []
  }
}

export interface GenerateOptions {
  optimizeTitle?: boolean
  addDessert?: boolean
  isOutline?: boolean
}

export async function generateBlogContent(content: string, providerValue?: string, modelId?: string, options?: GenerateOptions): Promise<string> {
  let config: { provider: string; token: string } | null
  
  if (providerValue) {
    const invoke = getInvoke()
    if (!invoke) {
      throw new Error('无法访问invoke')
    }
    const token = await invoke('getAIToken', providerValue) as string
    if (!token) {
      throw new Error('该提供商未配置API Token')
    }
    config = { provider: providerValue, token }
  } else {
    config = await getAIConfig()
  }
  
  if (!config) {
    throw new Error('请先在设置中配置AI模型')
  }

  const provider = AI_PROVIDERS.find(p => p.value === config!.provider)
  if (!provider) {
    throw new Error('不支持的AI提供商')
  }

  const selectedModel = modelId || provider.models[0]?.id
  if (!selectedModel) {
    throw new Error('未找到可用模型')
  }

  let prompt: string

  if (options?.isOutline) {
    prompt = `请整理以下内容为清晰的提纲。这些内容可能是零碎的、临时记录下来的思路，请：
1. 提取核心观点和关键思路
2. 按逻辑顺序组织成结构化的提纲
3. 使用层级结构（主标题、子标题、要点）
4. 去除重复内容，合并相似观点
5. 保持原意，但使表达更清晰有条理
6. 使用简洁的中文表达

原始内容：
${content}

整理后的提纲：`
  } else {
    const requirements: string[] = [
      '结构清晰，有标题和段落',
      '内容丰富，补充相关背景知识',
      '语言通顺流畅',
      '适合技术博客风格'
    ]

    if (options?.optimizeTitle) {
      requirements.push('生成一个吸引人、有创意的标题，能够引起读者兴趣')
    }

    if (options?.addDessert) {
      requirements.push('在文章适当位置加入"甜点"内容：包括幽默的比喻、轻松的笑话或非技术性的趣闻，让读者在阅读过程中能够放松提神')
    }

    prompt = `请根据以下内容生成一篇博客文章，要求：
${requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

内容：
${content}

生成的博客：`
  }

  switch (config.provider) {
    case 'openai':
      return await callOpenAI(config.token, provider.apiEndpoint!, prompt, selectedModel)
    case 'anthropic':
      return await callAnthropic(config.token, prompt, selectedModel)
    case 'bigmodel':
      return await callBigModel(config.token, provider.apiEndpoint!, prompt, selectedModel)
    case 'baidu':
      return await callBaidu(config.token, prompt, selectedModel)
    case 'ali':
      return await callAli(config.token, provider.apiEndpoint!, prompt, selectedModel)
    case 'google':
      return await callGoogle(config.token, provider.apiEndpoint!, prompt, selectedModel)
    case 'deepseek':
      return await callOpenAI(config.token, provider.apiEndpoint!, prompt, selectedModel)
    case 'azure':
      throw new Error('Azure OpenAI 需要配置endpoint，请稍后支持')
    default:
      throw new Error('不支持的AI提供商')
  }
}

async function callOpenAI(token: string, endpoint: string, prompt: string, modelId?: string): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: modelId || 'gpt-5.3-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callAnthropic(token: string, prompt: string, modelId?: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': token,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelId || 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function callBigModel(token: string, endpoint: string, prompt: string, modelId?: string): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: modelId || 'glm-5.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`字节跳动大模型API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callBaidu(token: string, prompt: string, modelId?: string): Promise<string> {
  const response = await fetch('https://qianfan.baidubce.com/v2/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: modelId || 'ernie-5.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`百度文心一言API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callAli(token: string, endpoint: string, prompt: string, modelId?: string): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-DashScope-SSE': 'disable'
    },
    body: JSON.stringify({
      model: modelId || 'qwen3.6-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`阿里云通义千问API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGoogle(token: string, endpoint: string, prompt: string, modelId?: string): Promise<string> {
  const model = modelId || 'gemini-2.5-flash'
  const response = await fetch(`${endpoint}/${model}:generateContent?key=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Google AI API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}