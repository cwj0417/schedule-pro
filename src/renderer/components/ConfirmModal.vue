<template>
  <Transition name="confirm">
    <div v-if="visible" class="confirm-overlay nodragable" @click.self="cancel">
      <div class="confirm-card" role="dialog" aria-modal="true">
        <div class="confirm-head">
          <span class="confirm-icon" :style="{ background: danger ? 'var(--error-0)' : 'var(--theme-0)' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </span>
          <h3 class="confirm-title">{{ title }}</h3>
        </div>
        <pre class="confirm-message">{{ message }}</pre>
        <div class="confirm-actions">
          <button
            ref="cancelBtnRef"
            class="confirm-btn confirm-btn-cancel hover-fill"
            style="--hover-fill: var(--bg-2);"
            @click="cancel"
          >{{ cancelText }}</button>
          <button
            ref="confirmBtnRef"
            class="confirm-btn confirm-btn-ok"
            :style="{ background: danger ? 'var(--error-0)' : 'var(--theme-0)' }"
            @click="confirm"
          >{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
}

const visible = ref(false)
const title = ref('确认操作')
const message = ref('')
const confirmText = ref('确定')
const cancelText = ref('取消')
const danger = ref(false)

const cancelBtnRef = ref<HTMLButtonElement | null>(null)
const confirmBtnRef = ref<HTMLButtonElement | null>(null)

let resolver: ((value: boolean) => void) | null = null

const finish = (result: boolean) => {
    if (!visible.value) return
    visible.value = false
    const resolve = resolver
    resolver = null
    resolve?.(result)
}

const confirm = () => finish(true)
const cancel = () => finish(false)

const show = (options: ConfirmOptions): Promise<boolean> => {
    // 上一次确认还没结束时直接按取消处理, 避免 Promise 悬挂
    if (resolver) finish(false)

    title.value = options.title || '确认操作'
    message.value = options.message
    confirmText.value = options.confirmText || '确定'
    cancelText.value = options.cancelText || '取消'
    danger.value = !!options.danger
    visible.value = true

    nextTick(() => {
        // 危险操作默认聚焦取消, 避免误按回车
        if (danger.value) cancelBtnRef.value?.focus()
        else confirmBtnRef.value?.focus()
    })

    return new Promise<boolean>((resolve) => {
        resolver = resolve
    })
}

const onKeydown = (event: KeyboardEvent) => {
    if (!visible.value) return
    if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
    }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    finish(false)
})

defineExpose({ show })
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--backdrop);
  -webkit-app-region: no-drag;
}

.confirm-card {
  box-sizing: border-box;
  width: min(400px, calc(100vw - 32px));
  padding: 20px;
  border-radius: 14px;
  background: var(--glass-bg);
  border: 1px solid var(--border-1);
  box-shadow: 0 16px 40px var(--shadow-0);
  backdrop-filter: blur(16px);
}

.confirm-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.confirm-icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  color: #fff;
}

.confirm-icon svg {
  width: 17px;
  height: 17px;
}

.confirm-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-0);
}

.confirm-message {
  margin: 12px 0 20px;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-1);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease, border-color 0.15s ease;
}

.confirm-btn-cancel {
  background: var(--bg-0);
  border-color: var(--border-1);
  color: var(--color-1);
}

.confirm-btn-ok {
  color: #fff;
}

.confirm-btn-ok:hover {
  opacity: 0.9;
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.18s ease;
}
.confirm-enter-active .confirm-card,
.confirm-leave-active .confirm-card {
  transition: transform 0.18s ease;
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
.confirm-enter-from .confirm-card,
.confirm-leave-to .confirm-card {
  transform: scale(0.96) translateY(-4px);
}
</style>
