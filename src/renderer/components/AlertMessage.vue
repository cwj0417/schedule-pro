<template>
  <Transition name="tip">
    <div
      v-if="visible"
      class="tip-toast nodragable"
      :class="`tip-${type}`"
      role="alert"
      aria-live="polite"
    >
      <svg v-if="type === 'success'" class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
      <svg v-else-if="type === 'error'" class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
      <svg v-else-if="type === 'warning'" class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      <svg v-else class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <pre class="tip-text">{{ message }}</pre>
      <button class="tip-close" aria-label="关闭" @click="close">&times;</button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

const visible = ref(false)
const message = ref('')
const type = ref<AlertType>('info')

const durationMap: Record<AlertType, number> = {
    success: 3000,
    info: 3000,
    warning: 4000,
    // 错误信息保留到用户手动关闭, 避免一闪而过看不到原因
    error: 0,
}

let timer: any = null

const close = () => {
    clearTimeout(timer)
    visible.value = false
}

const show = (msg: string, t: AlertType = 'info', duration?: number) => {
    clearTimeout(timer)
    message.value = msg
    type.value = t
    visible.value = true
    const d = duration ?? durationMap[t]
    if (d > 0) timer = setTimeout(close, d)
}

onBeforeUnmount(() => clearTimeout(timer))

defineExpose({ show })
</script>

<style scoped>
.tip-toast {
  position: fixed;
  top: 3.5rem;
  left: 50%;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  box-sizing: border-box;
  width: max-content;
  max-width: min(30rem, calc(100vw - 2rem));
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-1);
  border: 1px solid var(--border-1);
  border-left-width: 3px;
  box-shadow: 0 8px 24px var(--shadow-0);
  color: var(--color-0);
  font-size: 12px;
  line-height: 1.5;
  -webkit-app-region: no-drag;
  transform: translateX(-50%);
}

.tip-icon {
  flex: none;
  width: 15px;
  height: 15px;
  margin-top: 1px;
}

.tip-success {
  border-left-color: var(--success-0);
}
.tip-success .tip-icon {
  color: var(--success-0);
}
.tip-error {
  border-left-color: var(--error-0);
}
.tip-error .tip-icon {
  color: var(--error-0);
}
.tip-warning {
  border-left-color: var(--warning-0);
}
.tip-warning .tip-icon {
  color: var(--warning-0);
}
.tip-info {
  border-left-color: var(--theme-0);
}
.tip-info .tip-icon {
  color: var(--theme-0);
}

.tip-text {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-1);
}

.tip-close {
  flex: none;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-2);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
.tip-close:hover {
  opacity: 1;
}

.tip-enter-active,
.tip-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.tip-enter-from,
.tip-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
