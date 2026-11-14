<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleItem, ScheduleState } from './schedule'
import CardHeader from './CardHeader.vue'
import CardEmpty from './CardEmpty.vue'

const props = defineProps<{
  state: ScheduleState
  onToggle: (item: ScheduleItem) => void
  onRefresh: () => void
}>()

const pending = computed(() => props.state.items.filter(item => !item.done).length)

const pendingText = computed(() => {
  if (!props.state.items.length) return ''
  return pending.value ? `${pending.value} 项未完成` : '全部完成'
})

const metaText = computed(() =>
  [props.state.date, pendingText.value].filter(Boolean).join(' · '),
)
</script>

<template>
  <div class="schedule-card">
    <CardHeader title="今日办" :meta="metaText" :loading="state.loading" @refresh="onRefresh">
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <rect x="3" y="4.2" width="14" height="12.3" rx="2.5" stroke="currentColor" stroke-width="1.3" />
          <path d="M3 8.2h14M6.4 2.8v2.6M13.6 2.8v2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <path d="m7.3 12.2 1.5 1.5 3.4-3.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
    </CardHeader>

    <p v-if="state.error" class="card-error">{{ state.error }}</p>

    <CardEmpty v-if="state.loading && !state.items.length" loading />
    <CardEmpty
      v-else-if="!state.items.length"
      :title="state.date ? `${state.date} 没有安排` : '今天没有安排'"
      hint="让模型帮你记一条, 或在应用里添加"
    >
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <rect x="3" y="4.2" width="14" height="12.3" rx="2.5" stroke="currentColor" stroke-width="1.3" />
          <path d="M3 8.2h14M6.4 2.8v2.6M13.6 2.8v2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <path d="m7.3 12.2 1.5 1.5 3.4-3.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
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
      </li>
    </ul>

    <footer v-if="state.items.length" class="card-footer">
      <span class="card-hint">勾选即可标记完成</span>
    </footer>
  </div>
</template>
