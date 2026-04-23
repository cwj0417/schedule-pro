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
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ]
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240229', name: 'Claude 3 Haiku' }
    ]
  },
  {
    value: 'bigmodel',
    label: '字节跳动大模型',
    apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash' },
      { id: 'glm-4', name: 'GLM-4' },
      { id: 'glm-4-airx', name: 'GLM-4 AirX' },
      { id: 'glm-4-air', name: 'GLM-4 Air' },
      { id: 'glm-3-turbo', name: 'GLM-3 Turbo' }
    ]
  },
  {
    value: 'baidu',
    label: '百度文心一言',
    apiEndpoint: 'https://qianfan.baidubce.com/v2/chat/completions',
    models: [
      { id: 'ernie-4.0-8k-latest', name: '文心一言 4.0 8K' },
      { id: 'ernie-4.0-8k', name: '文心一言 4.0' },
      { id: 'ernie-3.5-8k', name: '文心一言 3.5 8K' },
      { id: 'ernie-speed-8k', name: 'ernie-speed-8K' },
      { id: 'ernie-lite-8k', name: 'ernie-lite-8K' }
    ]
  },
  {
    value: 'ali',
    label: '阿里云通义千问',
    apiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { id: 'qwen-max', name: 'Qwen Max' },
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-turbo', name: 'Qwen Turbo' },
      { id: 'qwen-long', name: 'Qwen Long' }
    ]
  },
  {
    value: 'google',
    label: 'Google AI',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B' },
      { id: 'gemini-pro', name: 'Gemini Pro' }
    ]
  },
  {
    value: 'azure',
    label: 'Azure OpenAI',
    apiEndpoint: '',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo' }
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

export async function generateBlogContent(content: string, providerValue?: string, modelId?: string): Promise<string> {
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

  const prompt = `请根据以下内容生成一篇博客文章，要求：
1. 结构清晰，有标题和段落
2. 内容丰富，补充相关背景知识
3. 语言通顺流畅
4. 适合技术博客风格

内容：
${content}

生成的博客：`

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
      model: modelId || 'gpt-3.5-turbo',
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
      model: modelId || 'claude-3-sonnet-20240229',
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
      model: modelId || 'glm-4',
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
      model: modelId || 'ernie-4.0-8k-latest',
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
      model: modelId || 'qwen-turbo',
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
  const model = modelId || 'gemini-1.5-flash'
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