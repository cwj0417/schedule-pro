<template>
  <Transition name="toast">
    <div v-if="visible" class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-max px-4 py-2.5 rounded-lg shadow-lg text-xs flex items-start gap-2 nodragable"
      :style="{ background: type === 'error' ? '#fee2e2' : 'var(--bg-1)', color: type === 'error' ? '#dc2626' : 'var(--color-1)', border: '1px solid ' + (type === 'error' ? '#fca5a5' : 'var(--border-1)') }">
      <pre class="whitespace-pre-wrap break-words font-mono flex-1">{{ message }}</pre>
      <button @click="visible = false" class="opacity-50 hover:opacity-100 flex-shrink-0 leading-none nodragable">&times;</button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error'>('success')

let timer: any = null

const show = (msg: string, t: 'success' | 'error' = 'success', duration?: number) => {
  clearTimeout(timer)
  message.value = msg
  type.value = t
  visible.value = true
  const d = duration ?? (t === 'error' ? 0 : 4000)
  if (d > 0) timer = setTimeout(() => { visible.value = false }, d)
}

defineExpose({ show })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}
</style>
