import { createApp, reactive } from 'vue'
import InspirationCard from './InspirationCard.vue'
import { createCardShell, extractStructured, errorText } from './shared'
import './card.css'

export type InspirationItem = {
  id: number
  content: string
  done?: boolean
  fromMcp?: boolean
}

export type InspirationState = {
  items: InspirationItem[]
  loading: boolean
  error: string
  busyId: number | null
}

const state = reactive<InspirationState>({
  items: [],
  loading: true,
  error: '',
  busyId: null,
})

const shell = createCardShell<{ items: InspirationItem[] }>({
  name: 'schedule-pro 待办池',
  listTool: 'list_inspiration',
  state,
  extract: (result) => extractStructured(result, data => Array.isArray(data.items)),
  apply: (payload) => {
    state.items = payload.items
  },
})

const withBusy = async (id: number, run: () => Promise<void>) => {
  if (!shell.isConnected() || state.busyId !== null) return
  state.busyId = id
  state.error = ''
  try {
    await run()
  } finally {
    state.busyId = null
  }
}

const toggle = (item: InspirationItem) => withBusy(item.id, async () => {
  const nextDone = !item.done
  item.done = nextDone
  try {
    const result = await shell.call('update_inspiration', {
      id: item.id,
      done: nextDone,
    })
    if (result.isError) throw new Error('更新待办池失败')
  } catch (error) {
    item.done = !nextDone
    state.error = `更新失败: ${errorText(error)}`
  }
})

// 转今日办: 加入今天的今日办 + 从待办池删除
const moveToSchedule = (item: InspirationItem) => withBusy(item.id, async () => {
  try {
    const added = await shell.call('add_schedule', { content: item.content })
    if (added.isError) throw new Error()
    const removed = await shell.call('delete_inspiration', { id: item.id })
    if (removed.isError) throw new Error()
  } catch (error) {
    state.error = `转今日办失败: ${errorText(error)}`
    return
  }
  state.items = state.items.filter(i => i.id !== item.id)
})

const remove = (item: InspirationItem) => withBusy(item.id, async () => {
  try {
    const result = await shell.call('delete_inspiration', { id: item.id })
    if (result.isError) throw new Error('删除失败')
    state.items = state.items.filter(i => i.id !== item.id)
  } catch (error) {
    state.error = `删除失败: ${errorText(error)}`
  }
})

const add = async (content: string) => {
  if (!shell.isConnected() || state.busyId !== null) return false
  state.error = ''
  const result = await shell.call('add_inspiration', { content })
  if (result.isError) {
    state.error = '添加失败'
    return false
  }
  await shell.refresh()
  return true
}

createApp(InspirationCard, {
  state,
  onToggle: toggle,
  onMove: moveToSchedule,
  onDelete: remove,
  onAdd: add,
  onRefresh: shell.refresh,
}).mount('#app')
