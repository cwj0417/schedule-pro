import { createApp, reactive } from 'vue'
import SettingsCard from './SettingsCard.vue'
import { createCardShell, extractStructured } from './shared'
import './card.css'

export type SettingsPayload = {
  theme?: string
  searchHint?: boolean
  homeSections?: Record<string, boolean>
  mcp?: {
    running?: boolean
    enabled?: boolean
    strictMention?: boolean
    port?: number
    url?: string
    error?: string
  }
}

const state = reactive<{ payload: SettingsPayload | null, loading: boolean, error: string }>({
  payload: null,
  loading: true,
  error: '',
})

const shell = createCardShell<SettingsPayload>({
  name: 'schedule-pro 应用设置',
  listTool: 'get_settings',
  state,
  extract: (result) => extractStructured<SettingsPayload>(result, data => data && typeof data === 'object' && !Array.isArray(data)),
  apply: (payload) => {
    state.payload = payload
  },
})

// key 与应用内 homeSections 配置一致
const SECTION_LABELS: Record<string, string> = {
  schedule: '今日办',
  timer: '倒计时',
  inspiration: '待办池',
  sticky: '便签',
}

createApp(SettingsCard, {
  state,
  sectionLabels: SECTION_LABELS,
  onRefresh: shell.refresh,
}).mount('#app')
