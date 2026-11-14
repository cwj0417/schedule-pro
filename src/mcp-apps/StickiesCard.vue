<script setup lang="ts">
import { ref } from 'vue'
import type { StickyItem, StickiesState } from './stickies'
import CardHeader from './CardHeader.vue'
import CardEmpty from './CardEmpty.vue'

const props = defineProps<{
  state: StickiesState
  formatTime: (ts?: number) => string
  onOpen: (item: StickyItem) => Promise<string>
  onSave: (item: StickyItem, content: string) => Promise<boolean>
  onDelete: (item: StickyItem) => Promise<void>
  onCreate: (content: string) => Promise<boolean>
  onRefresh: () => void
}>()

const stickyColor = (item: StickyItem) => {
  const bg = item.backgroundColor || '9'
  return bg.length === 1 ? `var(--sp-sticky-${bg})` : bg
}

// 展开编辑(编辑器状态属于组件内部)
const openId = ref<number | null>(null)
const editorContent = ref('')
const editorBusy = ref(false)
const loadError = ref('')

const open = async (item: StickyItem) => {
  if (editorBusy.value) return
  if (openId.value === item.id) {
    openId.value = null
    return
  }
  openId.value = item.id
  loadError.value = ''
  editorContent.value = ''
  editorBusy.value = true
  try {
    editorContent.value = await props.onOpen(item)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    editorBusy.value = false
  }
}

const save = async () => {
  const item = props.state.items.find(i => i.id === openId.value)
  if (!item || editorBusy.value) return
  editorBusy.value = true
  const ok = await props.onSave(item, editorContent.value)
  editorBusy.value = false
  if (ok) openId.value = null
}

const remove = async (item: StickyItem) => {
  if (props.state.busyId !== null) return
  await props.onDelete(item)
  if (openId.value === item.id) openId.value = null
}

// 新建
const creating = ref(false)
const newContent = ref('')
const creatingBusy = ref(false)

const toggleCreating = () => {
  creating.value = !creating.value
  if (!creating.value) newContent.value = ''
  if (creating.value) openId.value = null
}

const create = async () => {
  const content = newContent.value.trim()
  if (!content || creatingBusy.value) return
  creatingBusy.value = true
  const ok = await props.onCreate(content)
  creatingBusy.value = false
  if (ok) {
    newContent.value = ''
    creating.value = false
  }
}
</script>

<template>
  <div class="schedule-card">
    <CardHeader
      title="便签"
      :meta="state.items.length ? `${state.items.length} 条` : ''"
      :loading="state.loading"
      @refresh="onRefresh"
    >
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <path d="M5.2 2.8h9.6a1.8 1.8 0 0 1 1.8 1.8v8.3l-3 3.3H5.2A1.8 1.8 0 0 1 3.4 14.4V4.6A1.8 1.8 0 0 1 5.2 2.8Z" stroke="currentColor" stroke-width="1.3" />
          <path d="M13.6 16.1v-3.2h3.2" stroke="currentColor" stroke-width="1.3" />
          <path d="M6.4 7.1h7.2M6.4 10.1h4.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </template>
    </CardHeader>

    <p v-if="state.error" class="card-error">{{ state.error }}</p>

    <CardEmpty v-if="state.loading && !state.items.length" loading />
    <CardEmpty
      v-else-if="!state.items.length"
      title="还没有便签"
      hint="点下面的新建便签开始记录"
    >
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <path d="M5.2 2.8h9.6a1.8 1.8 0 0 1 1.8 1.8v8.3l-3 3.3H5.2A1.8 1.8 0 0 1 3.4 14.4V4.6A1.8 1.8 0 0 1 5.2 2.8Z" stroke="currentColor" stroke-width="1.3" />
          <path d="M13.6 16.1v-3.2h3.2" stroke="currentColor" stroke-width="1.3" />
          <path d="M6.4 7.1h7.2M6.4 10.1h4.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </template>
    </CardEmpty>
    <ul v-else class="card-list">
      <li
        v-for="item in state.items"
        :key="item.id"
        class="card-row sticky-row"
        :class="{ 'is-open': openId === item.id }"
        :style="{ '--sticky-color': stickyColor(item) }"
      >
        <button class="sticky-main" type="button" @click="open(item)">
          <span class="card-content">{{ item.title || '未命名便签' }}</span>
          <span class="sticky-time">{{ formatTime(item.updatedAt) }}</span>
        </button>

        <div v-if="openId === item.id" class="sticky-editor">
          <p v-if="loadError" class="card-error">{{ loadError }}</p>
          <template v-else>
            <textarea
              v-model="editorContent"
              class="card-textarea"
              rows="5"
              :placeholder="editorBusy ? '加载中…' : ''"
              :disabled="editorBusy"
            />
            <div class="sticky-editor-actions">
              <button class="card-add-button" type="button" :disabled="editorBusy" @click="save">保存</button>
              <button class="card-cancel-button" type="button" :disabled="editorBusy" @click="open(item)">收起</button>
              <button class="card-cancel-button is-danger" type="button" :disabled="state.busyId === item.id || editorBusy" @click="remove(item)">删除</button>
            </div>
          </template>
        </div>
      </li>
    </ul>

    <footer class="card-footer">
      <div v-if="creating" class="sticky-editor">
        <textarea
          v-model="newContent"
          class="card-textarea"
          rows="4"
          placeholder="便签正文, 首行将作为标题"
          :disabled="creatingBusy"
        />
        <div class="sticky-editor-actions">
          <button class="card-add-button" type="button" :disabled="creatingBusy || !newContent.trim()" @click="create">创建</button>
          <button class="card-cancel-button" type="button" :disabled="creatingBusy" @click="toggleCreating">取消</button>
        </div>
      </div>
      <button v-else class="sticky-new" type="button" @click="toggleCreating">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        新建便签
      </button>
    </footer>
  </div>
</template>
