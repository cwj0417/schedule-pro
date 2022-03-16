<template>
  <span
    v-for="(item, index) in getHighlightedText(value, search)"
    :key="index"
    :class="item.highlight ? 'text-yellow-400 font-bold' : ''"
  >
    {{ item.match }}
  </span>
</template>

<script lang="ts" setup>
import { getHighlightedText } from "./searchContent";
defineProps(['value', 'search'])
</script>