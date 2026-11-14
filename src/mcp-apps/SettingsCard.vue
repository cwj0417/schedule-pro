<script setup lang="ts">
import { computed } from 'vue'
import type { SettingsPayload } from './settings'
import CardHeader from './CardHeader.vue'
import CardEmpty from './CardEmpty.vue'

const props = defineProps<{
  state: { payload: SettingsPayload | null, loading: boolean, error: string }
  sectionLabels: Record<string, string>
  onRefresh: () => void
}>()

const sections = computed(() =>
  Object.entries(props.state.payload?.homeSections || {}).map(([key, visible]) => ({
    key,
    label: props.sectionLabels[key] || key,
    visible: visible === true,
  })),
)

const mcp = computed(() => props.state.payload?.mcp || {})
const metaText = computed(() =>
  props.state.payload?.theme ? `主题: ${props.state.payload.theme}` : '',
)
</script>

<template>
  <div class="schedule-card">
    <CardHeader title="应用设置" :meta="metaText" :loading="state.loading" @refresh="onRefresh">
      <template #icon>
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
          <path d="M3 5.3h14M3 10h14M3 14.7h14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <circle cx="6.6" cy="5.3" r="1.7" fill="var(--sp-surface)" stroke="currentColor" stroke-width="1.3" />
          <circle cx="13" cy="10" r="1.7" fill="var(--sp-surface)" stroke="currentColor" stroke-width="1.3" />
          <circle cx="8.2" cy="14.7" r="1.7" fill="var(--sp-surface)" stroke="currentColor" stroke-width="1.3" />
        </svg>
      </template>
    </CardHeader>

    <p v-if="state.error" class="card-error">{{ state.error }}</p>
    <CardEmpty v-else-if="state.loading && !state.payload" loading />

    <template v-else-if="state.payload">
      <dl class="settings-list">
        <div class="settings-row">
          <dt>首页模块</dt>
          <dd class="settings-chips">
            <span
              v-for="section in sections"
              :key="section.key"
              class="settings-chip"
              :class="{ 'is-off': !section.visible }"
            >{{ section.label }}</span>
          </dd>
        </div>
        <div class="settings-row">
          <dt>搜索提示</dt>
          <dd>{{ state.payload.searchHint ? '显示' : '隐藏' }}</dd>
        </div>
        <div class="settings-row">
          <dt>MCP 服务</dt>
          <dd>
            <span class="settings-status" :class="mcp.running ? 'is-ok' : 'is-bad'">
              {{ mcp.running ? '运行中' : '已停止' }}
            </span>
            <span v-if="mcp.port" class="settings-port">:{{ mcp.port }}</span>
          </dd>
        </div>
        <div class="settings-row">
          <dt>严格提及</dt>
          <dd>{{ mcp.strictMention ? '开启 · 明确提及才写入' : '关闭 · 口语化记录直接写入' }}</dd>
        </div>
        <div v-if="mcp.error" class="settings-row">
          <dt>最近错误</dt>
          <dd class="settings-bad">{{ mcp.error }}</dd>
        </div>
      </dl>

      <footer class="card-footer">
        <span class="card-hint">设置需要在应用的设置页修改</span>
      </footer>
    </template>
  </div>
</template>
