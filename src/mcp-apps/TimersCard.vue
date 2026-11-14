<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TimerItem, TimersState } from './timers'
import CardHeader from './CardHeader.vue'
import CardEmpty from './CardEmpty.vue'

const props = defineProps<{
  state: TimersState
  remainSeconds: (item: TimerItem) => number
  totalMs: (item: TimerItem) => number
  formatRemain: (seconds: number) => string
  onCancel: (item: TimerItem) => void
  onStart: (minutes: number, content: string) => Promise<boolean>
  onRefresh: () => void
}>()

const metaText = computed(() => {
  if (!props.state.items.length) return ''
  const running = props.state.items.filter(item => props.remainSeconds(item) > 0).length
  return running ? `${running} 个进行中` : '都已到点'
})

const progress = (item: TimerItem) => {
  const total = props.totalMs(item)
  if (total <= 0) return 0
  const remain = props.remainSeconds(item) * 1000
  return Math.min(100, Math.max(0, (1 - remain / total) * 100))
}

const minutesInput = ref('')
const contentInput = ref('')
const starting = ref(false)

const submit = async () => {
  const minutes = Number(minutesInput.value)
  if (!Number.isFinite(minutes) || minutes <= 0 || starting.value) return
  starting.value = true
  const ok = await props.onStart(minutes, contentInput.value.trim() || '到点提醒')
  starting.value = false
  if (ok) {
    minutesInput.value = ''
    contentInput.value = ''
  }
}
</script>

<template>
  <div class="schedule-card">
    <CardHeader title="倒计时" :meta="metaText" :loading="state.loading" @refresh="onRefresh">
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" />
          <path d="M10 5.9v4.3l2.8 1.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <path d="M8 1.6h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </template>
    </CardHeader>

    <p v-if="state.error" class="card-error">{{ state.error }}</p>

    <CardEmpty v-if="state.loading && !state.items.length" loading />
    <CardEmpty
      v-else-if="!state.items.length"
      title="没有正在进行的倒计时"
      hint="在下面设置一个提醒, 到点会通知你"
    >
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" />
          <path d="M10 5.9v4.3l2.8 1.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <path d="M8 1.6h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </template>
    </CardEmpty>
    <ul v-else class="card-list">
      <li v-for="item in state.items" :key="item.id" class="card-row timer-row" :class="{ 'is-done': remainSeconds(item) <= 0 }">
        <div class="timer-main">
          <div class="timer-line">
            <span class="card-content">{{ item.content }}</span>
            <span class="timer-remain">{{ formatRemain(remainSeconds(item)) }}</span>
            <button
              v-if="remainSeconds(item) > 0"
              class="row-button is-danger"
              type="button"
              title="取消倒计时"
              :disabled="state.busyId === item.id"
              @click="onCancel(item)"
            >
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <div class="timer-bar">
            <div class="timer-fill" :style="{ width: `${progress(item)}%` }" />
          </div>
        </div>
      </li>
    </ul>

    <footer class="card-footer card-add">
      <input
        v-model="minutesInput"
        class="card-input is-number"
        type="number"
        min="0.5"
        step="1"
        placeholder="分钟"
        :disabled="starting"
        @keydown.enter="submit"
      />
      <input
        v-model="contentInput"
        class="card-input"
        type="text"
        placeholder="提醒内容, 回车开始"
        :disabled="starting"
        @keydown.enter="submit"
      />
      <button class="card-add-button" type="button" :disabled="starting || !(Number(minutesInput) > 0)" @click="submit">开始</button>
    </footer>
  </div>
</template>
