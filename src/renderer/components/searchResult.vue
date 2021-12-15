<template>
  <span
    v-for="(item, index) in getHighlightedText(value, search)"
    :key="index"
    :class="item.highlight ? 'text-yellow-400 font-bold' : ''"
  >
    {{ item.match }}
  </span>
</template>

<script>
import { getHighlightedText } from "./searchContent";
export default {
  props: ["value", "search"],
  setup() {
    return {
      getHighlightedText,
    };
  },
};
</script>