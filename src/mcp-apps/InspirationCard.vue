<script setup lang="ts">
import { computed, ref } from 'vue'
import type { InspirationItem, InspirationState } from './inspiration'
import CardHeader from './CardHeader.vue'
import CardEmpty from './CardEmpty.vue'

const props = defineProps<{
  state: InspirationState
  onToggle: (item: InspirationItem) => void
  onMove: (item: InspirationItem) => void
  onDelete: (item: InspirationItem) => void
  onAdd: (content: string) => Promise<boolean>
  onRefresh: () => void
}>()

const pending = computed(() => props.state.items.filter(item => !item.done).length)
const metaText = computed(() => {
  if (!props.state.items.length) return ''
  return pending.value ? `${props.state.items.length} 条 · ${pending.value} 项未完成` : `${props.state.items.length} 条 · 全部完成`
})

const draft = ref('')
const adding = ref(false)

const submit = async () => {
  const content = draft.value.trim()
  if (!content || adding.value) return
  adding.value = true
  const ok = await props.onAdd(content)
  adding.value = false
  if (ok) draft.value = ''
}
</script>

<template>
  <div class="schedule-card">
    <CardHeader title="待办池" :meta="metaText" :loading="state.loading" @refresh="onRefresh">
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <path d="M10 3.1a4.5 4.5 0 0 0-2.6 8.2c.4.3.6.7.6 1.2v.9h4v-.9c0-.5.2-.9.6-1.2A4.5 4.5 0 0 0 10 3.1Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8.3 14.2h3.4M9 16.4h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <path d="M10 1.1V.4M4.3 4.4l-.5-.5M15.7 4.4l.5-.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </template>
    </CardHeader>

    <p v-if="state.error" class="card-error">{{ state.error }}</p>

    <CardEmpty v-if="state.loading && !state.items.length" loading />
    <CardEmpty
      v-else-if="!state.items.length"
      title="待办池是空的"
      hint="在下面记一条想法, 或直接告诉模型"
    >
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <path d="M10 3.1a4.5 4.5 0 0 0-2.6 8.2c.4.3.6.7.6 1.2v.9h4v-.9c0-.5.2-.9.6-1.2A4.5 4.5 0 0 0 10 3.1Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8.3 14.2h3.4M9 16.4h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <path d="M10 1.1V.4M4.3 4.4l-.5-.5M15.7 4.4l.5-.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </template>
    </CardEmpty>
    <ul v-else class="card-list">
      <li v-for="item in state.items" :key="item.id" class="card-row" :class="{ 'is-done': item.done }">
        <button
          class="check"
          type="button"
          role="checkbox"
          :aria-checked="!!item.done"
          :disabled="state.busyId === item.id"
          @click="onToggle(item)"
        >
          <svg v-if="item.done" viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
            <path d="M3.2 8.4 6.4 11.6 12.8 4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="card-content">{{ item.content }}</span>
        <span v-if="item.fromMcp" class="card-badge">MCP</span>
        <span v-if="!item.done" class="card-actions">
          <button
            class="row-button"
            type="button"
            title="转入今天的今日办"
            :disabled="state.busyId === item.id"
            @click="onMove(item)"
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
              <path d="M3 8h9.2M8.6 4.2 12.4 8l-3.8 3.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </span>
        <button
          class="row-button is-danger"
          type="button"
          title="删除"
          :disabled="state.busyId === item.id"
          @click="onDelete(item)"
        >
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
            <path d="M2.8 4.2h10.4M6.4 4V2.9h3.2V4M4.2 4.4l.5 8.2c0 .3.3.5.5.5h5.6c.2 0 .5-.2.5-.5l.5-8.2M6.5 6.7v4.1M9.5 6.7v4.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </li>
    </ul>

    <footer class="card-footer card-add">
      <input
        v-model="draft"
        class="card-input"
        type="text"
        placeholder="记一条想法或待办, 回车添加"
        :disabled="adding"
        @keydown.enter="submit"
      />
      <button class="card-add-button" type="button" :disabled="adding || !draft.trim()" @click="submit">添加</button>
    </footer>
  </div>
</template>
