<template>
  <span
    v-if="active"
    class="text-sm font-normal text-blue-500 w-42 inline-block"
    style="height: 25px; line-height: 25px"
  >
    <span>请设置快捷键</span>
    <span
      style="width: 40px; margin-left: 10px"
      class="kbd animate-pulse"
      @click="$emit('esc')"
      >esc
    </span></span
  >
  <span
    v-else
    :class="disabled ? 'cursor-not-allowed w-auto' : 'cursor-context-menu w-36'"
    class="text-base font-normal text-gray-400 inline-block"
    @dblclick="!disabled && $emit('setShortcut')"
  >
    <span class="kbd" v-if="value && value[0]">{{ format(value[0]) }}</span>
    <span
      class="kbd"
      :key="index"
      v-for="(kbd, index) in value ? value.slice(1) : []"
    >
      {{ format(kbd) }}
    </span>
  </span>
</template>
<script lang="ts">
import { defineComponent } from "vue";

const acceleratorMap = {
  shift: "⇧",
  meta: "⌘",
  alt: "⌥",
  ctrl: "⌃",
};

export default defineComponent({
  props: ["value", "active", "disabled"],
  emits: ["setShortcut", "esc"],
  setup() {
    const format = (kbdName: string) => {
      return kbdName.includes("Key")
        ? acceleratorMap[
            kbdName.slice(0, kbdName.length - 3) as keyof typeof acceleratorMap
          ]
        : kbdName.toUpperCase();
    };
    return {
      format,
    };
  },
});
</script>
