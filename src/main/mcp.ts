import http from 'http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

// 主进程向 MCP 工具暴露的数据操作接口
// 所有写操作都在主进程完成, 由 index.ts 负责落盘并广播给各个窗口
export interface McpBridge {
  getVersion: () => string
  listSchedule: (dayKey: number) => any[]
  addSchedule: (dayKey: number, content: string) => any
  updateSchedule: (id: number, patch: { content?: string, done?: boolean }) => any
  deleteSchedule: (id: number) => boolean
  listInspiration: () => any[]
  addInspiration: (content: string) => any
  updateInspiration: (id: number, patch: { content?: string, done?: boolean }) => any
  deleteInspiration: (id: number) => boolean
  listTimers: () => any[]
  addTimer: (minutes: number, content: string) => any
  removeTimer: (id: number) => boolean
  listStickies: () => any[]
  readSticky: (id: number) => string | null
  createSticky: (content: string, title?: string) => any
  updateSticky: (id: number, content: string) => boolean
  deleteSticky: (id: number) => boolean
  getSettings: () => any
}

// 日期参数 YYYY-MM-DD 转成应用使用的当天零点时间戳
const dayKeyOf = (date?: string) => {
  if (date) {
    const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
    if (matched) {
      return new Date(+matched[1], +matched[2] - 1, +matched[3]).getTime()
    }
  }
  return new Date().setHours(0, 0, 0, 0)
}

const formatDate = (dayKey: number) => {
  const d = new Date(dayKey)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const text = (value: any) => ({
  content: [{
    type: 'text' as const,
    text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  }],
})

const fail = (error: any) => ({
  isError: true,
  content: [{ type: 'text' as const, text: `操作失败: ${error?.message || error}` }],
})

const withCatch = (handler: (...args: any[]) => Promise<any> | any) =>
  async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return fail(error)
    }
  }

const buildServer = (bridge: McpBridge) => {
  const server = new McpServer(
    { name: 'schedule-pro', version: bridge.getVersion() },
    {
      instructions: [
        'schedule-pro 是一个只在本机运行的个人日程应用, 数据存在本地, 读写都通过下面的工具完成。',
        '数据分为四类, 请按用户意图选对工具:',
        '1. 今日办(schedule): 按日期分组的待办。用户提到具体某天(今天/明天/周五/10月30日)要做的事时, 用名字以 _schedule 结尾的工具。',
        '2. 待办池(inspiration): 没有排期的待办和想法。用户说"先记一下""回头再说""加个想法"时, 用名字以 _inspiration 结尾的工具; 拿不准放哪边时优先待办池。',
        '3. 倒计时(countdown/timer): 需要在若干分钟后提醒的场景, 用户说"X 分钟后提醒我""到点叫我"时使用, 时长单位是分钟。',
        '4. 便签(sticky): 承载文章、笔记、清单、代码等长文本, 单条待办不要用便签。',
        '修改和删除都按 id 操作, id 只能来自对应 list_* 工具的返回, 不要自行编造; 缺 id 时先查询。',
        '日期统一用 YYYY-MM-DD, 不传则为今天; 用户说"明天""下周一"时先换算成具体日期再传。',
        '一次请求可能对应多次工具调用(例如"完成这条待办并新建一个便签"), 按顺序依次调用即可。',
        '通过 MCP 写入的待办/倒计时会在界面上标注 MCP, 便签内容末尾会自动追加 (from mcp) 标注。',
      ].join('\n'),
    },
  )

  server.registerTool('list_schedule', {
    title: '查询今日办',
    description: '查询某一天的今日办列表。用户问"今天/明天/某天有什么安排""待办做完了吗"时使用; 返回该日期下每条待办的 id、内容和完成状态。默认查询今天。',
    inputSchema: {
      date: z.string().optional().describe('日期 YYYY-MM-DD, 默认今天; 用户说"明天""下周一"时先换算成具体日期'),
    },
  }, withCatch(async ({ date }) => {
    const dayKey = dayKeyOf(date)
    return text({ date: formatDate(dayKey), items: bridge.listSchedule(dayKey) })
  }))

  server.registerTool('add_schedule', {
    title: '添加今日办',
    description: '在指定日期的今日办里新增一条待办。用户给出明确日期(今天/明天/周五/10月30日)要安排事情时使用; 如果只是"先记一下、回头再做"这类没有日期的需求, 应改用 add_inspiration。',
    inputSchema: {
      content: z.string().min(1).describe('待办内容, 只写要做的事, 不要把日期写进内容里'),
      date: z.string().optional().describe('日期 YYYY-MM-DD, 默认今天; 相对日期请先换算'),
    },
  }, withCatch(async ({ content, date }) => {
    const dayKey = dayKeyOf(date)
    return text({ ok: true, date: formatDate(dayKey), item: bridge.addSchedule(dayKey, content) })
  }))

  server.registerTool('update_schedule', {
    title: '修改今日办',
    description: '按 id 修改今日办中某条待办的文字或完成状态。id 必须来自 list_schedule 的返回; 用户说"做完了""勾掉"时把 done 传 true, 不要用 delete_schedule。本工具不能改日期, 需要换天请删除后重新 add_schedule。',
    inputSchema: {
      id: z.number().int().describe('待办 id, 来自 list_schedule 返回'),
      content: z.string().optional().describe('新的待办内容, 不传则不修改文字'),
      done: z.boolean().optional().describe('true 标记为已完成, false 标记为未完成, 不传则不修改状态'),
    },
  }, withCatch(async ({ id, content, done }) => {
    const result = bridge.updateSchedule(id, { content, done })
    return result ? text({ ok: true, ...result }) : fail('未找到该待办')
  }))

  server.registerTool('delete_schedule', {
    title: '删除今日办',
    description: '按 id 永久删除今日办中的一条待办, 删除后无法恢复。仅在用户明确要求删除时使用; 用户只是说"做完了"请改用 update_schedule 的 done=true。',
    inputSchema: {
      id: z.number().int().describe('待办 id, 来自 list_schedule 返回'),
    },
  }, withCatch(async ({ id }) => {
    return bridge.deleteSchedule(id) ? text({ ok: true, id }) : fail('未找到该待办')
  }))

  server.registerTool('list_inspiration', {
    title: '查询待办池',
    description: '查询待办池(没有排期的待办集合)。用户问"我记过哪些事没做""待办池里有什么"时使用; 修改或删除前也先用它获取 id。',
    inputSchema: {
      done: z.boolean().optional().describe('true 只看已完成, false 只看未完成, 不传返回全部'),
    },
  }, withCatch(async ({ done }) => {
    const items = bridge.listInspiration()
      .filter((item: any) => done === undefined ? true : !!item.done === done)
    return text(items)
  }))

  server.registerTool('add_inspiration', {
    title: '添加待办池',
    description: '向待办池添加一条没有排期的待办。适合"先记下来""回头再说""加个想法"这类没有明确日期的场景; 有明确日期请用 add_schedule。',
    inputSchema: {
      content: z.string().min(1).describe('待办内容, 只写要做的事'),
    },
  }, withCatch(async ({ content }) => {
    return text({ ok: true, item: bridge.addInspiration(content) })
  }))

  server.registerTool('update_inspiration', {
    title: '修改待办池',
    description: '按 id 修改待办池某条记录的文字或完成状态。id 必须来自 list_inspiration 的返回; 想把它排到某一天, 请用 add_schedule 新建, 本工具不支持跨列表移动。',
    inputSchema: {
      id: z.number().int().describe('待办 id, 来自 list_inspiration 返回'),
      content: z.string().optional().describe('新的待办内容, 不传则不修改文字'),
      done: z.boolean().optional().describe('true 标记为已完成, false 标记为未完成, 不传则不修改状态'),
    },
  }, withCatch(async ({ id, content, done }) => {
    const result = bridge.updateInspiration(id, { content, done })
    return result ? text({ ok: true, item: result }) : fail('未找到该待办')
  }))

  server.registerTool('delete_inspiration', {
    title: '删除待办池',
    description: '按 id 永久删除待办池中的一条记录, 删除后无法恢复。仅在用户明确要求删除时使用。',
    inputSchema: {
      id: z.number().int().describe('待办 id, 来自 list_inspiration 返回'),
    },
  }, withCatch(async ({ id }) => {
    return bridge.deleteInspiration(id) ? text({ ok: true, id }) : fail('未找到该待办')
  }))

  server.registerTool('list_timers', {
    title: '查询倒计时',
    description: '查询当前正在运行的倒计时, 返回 id、剩余时长和标题。用户问"还有几分钟""倒计时还剩多久"时使用; 已经结束的倒计时不会出现在结果里。',
    inputSchema: {},
  }, withCatch(async () => {
    return text(bridge.listTimers())
  }))

  server.registerTool('start_countdown', {
    title: '启动倒计时',
    description: '启动一个新的倒计时, 到点后应用会发系统通知。用户说"X 分钟后提醒我""倒计时 X 分钟""到点叫我"时使用; 时长单位是分钟, 小时请换算(1 小时 = 60)。',
    inputSchema: {
      minutes: z.number().positive().describe('倒计时时长, 单位分钟, 必须大于 0; 1 小时请传 60'),
      content: z.string().min(1).describe('到点通知里显示的标题, 例如"喝水""站起来活动一下"'),
    },
  }, withCatch(async ({ minutes, content }) => {
    return text({ ok: true, item: bridge.addTimer(minutes, content) })
  }))

  server.registerTool('cancel_countdown', {
    title: '取消倒计时',
    description: '按 id 取消一个正在运行的倒计时。id 需要先用 list_timers 查询; 用户说"取消刚才那个提醒"时先 list_timers 找到对应 id 再调用。',
    inputSchema: {
      id: z.number().int().describe('倒计时 id, 来自 list_timers 返回'),
    },
  }, withCatch(async ({ id }) => {
    return bridge.removeTimer(id) ? text({ ok: true, id }) : fail('未找到该倒计时')
  }))

  server.registerTool('list_stickies', {
    title: '查询便签',
    description: '列出所有便签的 id、标题和创建/更新时间, 不含正文。用户问"我有哪些便签""找一下那篇笔记"时先调用它定位, 再用 read_sticky 按 id 读正文。',
    inputSchema: {},
  }, withCatch(async () => {
    return text(bridge.listStickies())
  }))

  server.registerTool('read_sticky', {
    title: '读取便签',
    description: '按 id 读取一条便签的完整正文。id 来自 list_stickies 的返回; 用户要求总结、改写、续写、追加内容时, 先把原文读出来再操作。',
    inputSchema: {
      id: z.number().int().describe('便签 id, 来自 list_stickies 返回'),
    },
  }, withCatch(async ({ id }) => {
    const content = bridge.readSticky(id)
    return content === null ? fail('未找到该便签') : text(content)
  }))

  server.registerTool('create_sticky', {
    title: '创建便签',
    description: '创建一条新便签并自动打开窗口, 适合文章、笔记、清单、代码片段等长文本; 单条待办不要用便签, 请用 add_schedule 或 add_inspiration。',
    inputSchema: {
      content: z.string().min(1).describe('便签正文, 纯文本, 支持换行'),
      title: z.string().optional().describe('便签标题; 不传时取正文第一条非空行'),
    },
  }, withCatch(async ({ content, title }) => {
    return text({ ok: true, sticky: bridge.createSticky(content, title) })
  }))

  server.registerTool('update_sticky', {
    title: '修改便签',
    description: '按 id 用新内容整体覆盖便签正文, 是覆盖不是追加。要追加内容时先 read_sticky 读出原文, 拼接后整体写回。',
    inputSchema: {
      id: z.number().int().describe('便签 id, 来自 list_stickies 返回'),
      content: z.string().describe('新的完整正文, 会覆盖原来的内容'),
    },
  }, withCatch(async ({ id, content }) => {
    return bridge.updateSticky(id, content) ? text({ ok: true, id }) : fail('未找到该便签')
  }))

  server.registerTool('delete_sticky', {
    title: '删除便签',
    description: '按 id 删除便签及其正文, 删除后无法恢复。用户说"这篇不要了""删掉那个便签"时使用, 删除前建议先 list_stickies 确认标题。',
    inputSchema: {
      id: z.number().int().describe('便签 id, 来自 list_stickies 返回'),
    },
  }, withCatch(async ({ id }) => {
    return bridge.deleteSticky(id) ? text({ ok: true, id }) : fail('未找到该便签')
  }))

  server.registerTool('get_settings', {
    title: '查询应用设置',
    description: '查询应用当前的设置: 主题、首页各模块显隐、搜索提示、MCP 服务状态与端口。用户问"我的主题是什么""首页为什么看不到便签/倒计时""MCP 端口是多少"时使用。只读, 不能修改设置。',
    inputSchema: {},
  }, withCatch(async () => {
    return text(bridge.getSettings())
  }))

  return server
}

const readBody = (req: http.IncomingMessage) => new Promise<any>((resolve, reject) => {
  let raw = ''
  req.on('data', chunk => raw += chunk)
  req.on('end', () => {
    if (!raw) return resolve(undefined)
    try {
      resolve(JSON.parse(raw))
    } catch (error) {
      reject(error)
    }
  })
  req.on('error', reject)
})

// 无状态 Streamable HTTP: 每个请求建一套 server/transport, 断线重连不需要会话恢复
export const createMcpHttpServer = (bridge: McpBridge) => http.createServer(async (req, res) => {
  const path = (req.url || '').split('?')[0]
  if (path !== '/mcp') {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  const server = buildServer(bridge)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  res.on('close', () => {
    transport.close().catch(() => { })
    server.close().catch(() => { })
  })

  try {
    await server.connect(transport)
    const body = req.method === 'POST' ? await readBody(req) : undefined
    await transport.handleRequest(req, res, body)
  } catch (error: any) {
    console.error('[mcp] request failed', error)
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32700, message: String(error?.message || error) },
        id: null,
      }))
    }
  }
})
