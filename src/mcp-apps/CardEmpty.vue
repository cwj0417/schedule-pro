<script setup lang="ts">
defineProps<{
  title?: string
  hint?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="card-empty">
    <span class="empty-icon" aria-hidden="true">
      <svg v-if="loading" class="empty-spinner" viewBox="0 0 16 16" width="16" height="16" fill="none">
        <circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4" opacity="0.35" />
        <path d="M13.6 8A5.6 5.6 0 0 0 8 2.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </svg>
      <slot v-else name="icon" />
    </span>
    <p class="empty-title">{{ loading ? '加载中…' : title }}</p>
    <p v-if="!loading && hint" class="empty-hint">{{ hint }}</p>
  </div>
</template>
