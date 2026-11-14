import { createApp, reactive } from 'vue'
import TimersCard from './TimersCard.vue'
import { createCardShell, extractStructured, errorText } from './shared'
import './card.css'

export type TimerItem = {
  id: number
  content: string
  // 总时长(分钟)
  cd?: number
  startAt?: number
  endAt?: number
  remainSeconds?: number
}

export type TimersState = {
  items: TimerItem[]
  loading: boolean
  error: string
  busyId: number | null
  // 本地时钟(已校准服务端偏差), 每秒更新用于剩余时间与进度条
  now: number
}

const state = reactive<TimersState>({
  items: [],
  loading: true,
  error: '',
  busyId: null,
  now: Date.now(),
})

// 服务端时间与本地时间的偏差, 剩余时间按 endAt 计算时用 now 校准
let clockSkew = 0

const shell = createCardShell<{ now: number, items: TimerItem[] }>({
  name: 'schedule-pro 倒计时',
  listTool: 'list_timers',
  state,
  extract: (result) => extractStructured(result, data => Array.isArray(data.items)),
  apply: (payload) => {
    state.items = payload.items
    if (typeof payload.now === 'number') {
      clockSkew = payload.now - Date.now()
      state.now = payload.now
    }
  },
})

const totalMs = (item: TimerItem) => {
  if (item.startAt && item.endAt && item.endAt > item.startAt) return item.endAt - item.startAt
  return (item.cd || 0) * 60000
}

const remainSeconds = (item: TimerItem) => {
  if (typeof item.remainSeconds === 'number' && !item.endAt) return item.remainSeconds
  if (!item.endAt) return 0
  return Math.max(0, Math.round((item.endAt - state.now) / 1000))
}

const formatRemain = (seconds: number) => {
  if (seconds <= 0) return '已到点'
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return mm >= 60
    ? `${Math.floor(mm / 60)} 小时 ${mm % 60} 分`
    : `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

// 每秒走表; 某个倒计时到点后自动刷新一次, 让已结束的条目消失
const autoRefreshed = new Set<number>()
setInterval(() => {
  state.now = Date.now() + clockSkew
  for (const item of state.items) {
    if (remainSeconds(item) <= 0 && !autoRefreshed.has(item.id)) {
      autoRefreshed.add(item.id)
      shell.refresh()
    }
  }
}, 1000)

const cancel = async (item: TimerItem) => {
  if (!shell.isConnected() || state.busyId !== null) return
  state.busyId = item.id
  state.error = ''
  try {
    const result = await shell.call('cancel_countdown', { id: item.id })
    if (result.isError) throw new Error('取消失败')
    state.items = state.items.filter(i => i.id !== item.id)
  } catch (error) {
    state.error = `取消失败: ${errorText(error)}`
  } finally {
    state.busyId = null
  }
}

const start = async (minutes: number, content: string): Promise<boolean> => {
  if (!shell.isConnected()) return false
  state.error = ''
  try {
    const result = await shell.call('start_countdown', { minutes, content })
    if (result.isError) throw new Error('启动失败')
    await shell.refresh()
    return true
  } catch (error) {
    state.error = `启动失败: ${errorText(error)}`
    return false
  }
}

createApp(TimersCard, {
  state,
  remainSeconds,
  totalMs,
  formatRemain,
  onCancel: cancel,
  onStart: start,
  onRefresh: shell.refresh,
}).mount('#app')
