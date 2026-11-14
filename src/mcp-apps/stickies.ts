import { createApp, reactive } from 'vue'
import StickiesCard from './StickiesCard.vue'
import { createCardShell, extractStructured, errorText } from './shared'
import './card.css'

export type StickyItem = {
  id: number
  title: string
  backgroundColor?: string
  createdAt?: number
  updatedAt?: number
  fromMcp?: boolean
}

export type StickiesState = {
  items: StickyItem[]
  loading: boolean
  error: string
  busyId: number | null
}

const state = reactive<StickiesState>({
  items: [],
  loading: true,
  error: '',
  busyId: null,
})

const shell = createCardShell<{ items: StickyItem[] }>({
  name: 'schedule-pro 便签',
  listTool: 'list_stickies',
  state,
  extract: (result) => extractStructured(result, data => Array.isArray(data.items)),
  apply: (payload) => {
    state.items = payload.items
  },
})

// read_sticky 的 text 就是纯正文, 不走 JSON 解析
const open = async (item: StickyItem): Promise<string> => {
  const result = await shell.call('read_sticky', { id: item.id })
  if (result.isError) throw new Error('读取便签失败')
  const text = result.content?.find(part => part.type === 'text')?.text
  if (typeof text !== 'string') throw new Error('返回数据格式异常')
  return text
}

const formatTime = (ts?: number) => {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const save = async (item: StickyItem, content: string): Promise<boolean> => {
  if (!shell.isConnected()) return false
  state.error = ''
  try {
    const result = await shell.call('update_sticky', { id: item.id, content })
    if (result.isError) throw new Error('保存失败')
    // 与应用内逻辑一致: 标题取正文第一行
    item.title = content.match(/\s?([^\n]+)/)?.[1] || item.title
    item.updatedAt = Date.now()
    return true
  } catch (error) {
    state.error = `保存失败: ${errorText(error)}`
    return false
  }
}

const remove = async (item: StickyItem) => {
  if (!shell.isConnected() || state.busyId !== null) return
  state.busyId = item.id
  state.error = ''
  try {
    const result = await shell.call('delete_sticky', { id: item.id })
    if (result.isError) throw new Error('删除失败')
    state.items = state.items.filter(i => i.id !== item.id)
  } catch (error) {
    state.error = `删除失败: ${errorText(error)}`
  } finally {
    state.busyId = null
  }
}

const create = async (content: string): Promise<boolean> => {
  if (!shell.isConnected()) return false
  state.error = ''
  try {
    const result = await shell.call('create_sticky', { content })
    if (result.isError) throw new Error('创建失败')
    await shell.refresh()
    return true
  } catch (error) {
    state.error = `创建失败: ${errorText(error)}`
    return false
  }
}

createApp(StickiesCard, {
  state,
  formatTime,
  onOpen: open,
  onSave: save,
  onDelete: remove,
  onCreate: create,
  onRefresh: shell.refresh,
}).mount('#app')
