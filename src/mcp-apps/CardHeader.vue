<script setup lang="ts">
defineProps<{
  title: string
  meta?: string
  loading?: boolean
}>()

const emit = defineEmits<{ (e: 'refresh'): void }>()
</script>

<template>
  <header class="card-header">
    <span class="card-icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <div class="card-heading">
      <span class="card-title-row">
        <span class="card-brand">
          <span class="brand-mark" aria-hidden="true">S</span>
          <span class="brand-name">schedule-pro</span>
        </span>
        <span class="card-title-divider" aria-hidden="true">·</span>
        <span class="card-title">{{ title }}</span>
      </span>
      <span v-if="meta" class="card-meta">{{ meta }}</span>
    </div>
    <button
      class="icon-button"
      :class="{ 'is-loading': loading }"
      type="button"
      title="刷新"
      aria-label="刷新"
      :disabled="loading"
      @click="emit('refresh')"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
        <path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        <path d="M13.5 2.75V5.5H10.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </header>
</template>
