<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content" :style="{ background: 'var(--glass-bg)', border: '1px solid var(--border-1)' }">
      <div class="modal-header">
        <h3 class="modal-title" :style="{ color: 'var(--color-0)' }">{{ title }}</h3>
        <button class="close-btn" @click="handleCancel" :style="{ color: 'var(--color-1)' }">×</button>
      </div>
      <div class="modal-body">
        <div
          v-for="(option, index) in options"
          :key="option.value"
          class="option-item"
          :class="{ selected: selectedIndex === index }"
          @click="selectOption(index)"
          :style="{
            background: selectedIndex === index ? 'var(--theme-5)' : 'var(--bg-0)',
            borderColor: selectedIndex === index ? 'var(--theme-0)' : 'var(--border-1)',
            color: 'var(--color-1)'
          }"
        >
          <span class="option-index" :style="{ color: 'var(--color-2)' }">{{ index + 1 }}.</span>
          <span class="option-label">{{ option.label }}</span>
          <span v-if="option.description" class="option-desc" :style="{ color: 'var(--color-2)' }">
            {{ option.description }}
          </span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="handleCancel" :style="{ background: 'var(--bg-0)', color: 'var(--color-1)', borderColor: 'var(--border-1)' }">
          取消
        </button>
        <button class="confirm-btn" @click="handleConfirm" :style="{ background: 'var(--theme-0)', color: 'white' }">
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface SelectOption {
  value: string
  label: string
  description?: string
}

const props = defineProps<{
  visible: boolean
  title: string
  options: SelectOption[]
}>()

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const selectedIndex = ref(0)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedIndex.value = 0
  }
})

const selectOption = (index: number) => {
  selectedIndex.value = index
}

const handleConfirm = () => {
  const option = props.options[selectedIndex.value]
  if (option) {
    emit('confirm', option.value)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  min-width: 320px;
  max-width: 480px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.option-item {
  padding: 12px;
  border-radius: 8px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item:hover {
  border-color: var(--border-2) !important;
}

.option-index {
  font-size: 14px;
  min-width: 24px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
}

.option-desc {
  font-size: 12px;
  margin-left: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: var(--border-2) !important;
}

.confirm-btn:hover {
  opacity: 0.9;
}
</style>