import { reactive } from 'vue'
import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
  type McpUiHostContext,
  type McpUiToolResultNotification,
} from '@modelcontextprotocol/ext-apps'

// 工具调用结果的最小形状(兼容 structuredContent 与纯文本两种宿主行为)
export type CardResult = {
  isError?: boolean
  content?: Array<{ type: string, text?: string }>
  structuredContent?: unknown
}

export const errorText = (error: unknown) => error instanceof Error ? error.message : String(error)

export const applyHostContext = (app: App, context?: McpUiHostContext) => {
  if (context?.theme) applyDocumentTheme(context.theme)
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables)
}

// structuredContent 优先, 宿主只透传文本时从 text JSON 兜底解析
export const extractStructured = <P>(result: CardResult, guard: (data: any) => boolean): P | null => {
  if (result.structuredContent && guard(result.structuredContent)) return result.structuredContent as P
  const text = result.content?.find(item => item.type === 'text')?.text
  if (!text) return null
  try {
    const data = JSON.parse(text)
    return guard(data) ? (data as P) : null
  } catch {
    return null
  }
}

export type CardShell<P> = {
  app: App
  state: { loading: boolean, error: string }
  isConnected: () => boolean
  call: (name: string, args?: Record<string, unknown>) => Promise<CardResult>
  refresh: () => Promise<void>
}

// 卡片运行时: 处理与宿主的握手、初始结果推送、主题同步和刷新,
// 各卡片只需要提供数据提取(extract)与应用(apply)逻辑
export const createCardShell = <P>(options: {
  name: string
  listTool: string
  // 刷新时附加的查询参数(如今日办的 date)
  listArgs?: () => Record<string, unknown>
  // 复用卡片已有的响应式状态(含 loading/error), 不传则内部自建
  state?: { loading: boolean, error: string }
  extract: (result: CardResult) => P | null
  apply: (payload: P) => void
  // 模型调用 list 工具时携带的参数(如 date), 用于刷新时保持同一视图
  onToolInput?: (args: Record<string, any>) => void
}): CardShell<P> => {
  const app = new App({ name: options.name, version: '1.0.0' })
  const state = options.state || reactive({ loading: true, error: '' })
  let connected = false
  let gotResult = false

  const call = async (name: string, args: Record<string, unknown> = {}) =>
    app.callServerTool({ name, arguments: args }) as Promise<CardResult>

  const refresh = async () => {
    if (!connected) return
    state.loading = true
    state.error = ''
    try {
      const result = await call(options.listTool, options.listArgs?.() || {})
      if (result.isError) throw new Error('查询失败')
      const payload = options.extract(result)
      if (!payload) throw new Error('返回数据格式异常')
      options.apply(payload)
    } catch (error) {
      state.error = `刷新失败: ${errorText(error)}`
    } finally {
      state.loading = false
    }
  }

  app.ontoolinput = (params) => options.onToolInput?.((params.arguments || {}) as Record<string, any>)

  app.ontoolresult = (params: McpUiToolResultNotification['params']) => {
    if (params.isError) {
      state.loading = false
      state.error = '查询失败'
      return
    }
    const payload = options.extract(params as CardResult)
    if (payload) {
      gotResult = true
      options.apply(payload)
      state.loading = false
      state.error = ''
    }
  }

  app.onhostcontextchanged = (context) => applyHostContext(app, context)

  app.connect()
    .then(() => {
      connected = true
      applyHostContext(app, app.getHostContext())
      // 宿主没有推送初始结果时主动拉一次, 保证卡片不会一直停在加载中
      if (!gotResult) refresh()
    })
    .catch((error) => {
      state.loading = false
      state.error = `连接宿主失败: ${errorText(error)}`
    })

  return { app, state, isConnected: () => connected, call, refresh }
}
