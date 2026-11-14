import { createApp, reactive } from 'vue'
import ScheduleCard from './ScheduleCard.vue'
import { createCardShell, extractStructured, errorText } from './shared'
import './card.css'

export type ScheduleItem = {
  id: number
  content: string
  done?: boolean
  fromMcp?: boolean
}

export type ScheduleState = {
  date: string
  items: ScheduleItem[]
  loading: boolean
  error: string
  busyId: number | null
}

type SchedulePayload = {
  date: string
  items: ScheduleItem[]
}

const state = reactive<ScheduleState>({
  date: '',
  items: [],
  loading: true,
  error: '',
  busyId: null,
})

let requestedDate = ''

const shell = createCardShell<SchedulePayload>({
  name: 'schedule-pro 今日办',
  listTool: 'list_schedule',
  listArgs: () => {
    const date = state.date || requestedDate
    return date ? { date } : {}
  },
  state,
  extract: (result) => extractStructured<SchedulePayload>(result, data => Array.isArray(data.items)),
  apply: (payload) => {
    state.date = payload.date || state.date
    state.items = payload.items
  },
  onToolInput: (args) => {
    if (typeof args.date === 'string') requestedDate = args.date
  },
})

const toggle = async (item: ScheduleItem) => {
  if (!shell.isConnected() || state.busyId !== null) return
  const nextDone = !item.done
  state.busyId = item.id
  state.error = ''
  // 先改本地状态, 失败时回滚, 避免勾选出现可感知的延迟
  item.done = nextDone
  try {
    const result = await shell.call('update_schedule', {
      id: item.id,
      done: nextDone,
    })
    if (result.isError) throw new Error('更新今日办失败')
  } catch (error) {
    item.done = !nextDone
    state.error = `更新失败: ${errorText(error)}`
  } finally {
    state.busyId = null
  }
}

createApp(ScheduleCard, {
  state,
  onToggle: toggle,
  onRefresh: shell.refresh,
}).mount('#app')
