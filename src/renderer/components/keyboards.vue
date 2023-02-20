<template>
  <span
    v-if="active"
    class="text-sm font-normal inline-block"
    style="height: 25px; line-height: 25px; color: var(--theme-0)"
  >
    <span>请设置快捷键</span>
    <span style="width: 40px; margin-left: 10px" class="kbd animate-pulse" @click="$emit('esc')">esc</span>
  </span>
  <span
    v-else
    style="color: var(--color-2)"
    :class="disabled ? 'cursor-not-allowed w-auto' : 'cursor-context-menu'"
    class="text-base font-normal inline-block"
    @dblclick="!disabled && $emit('setShortcut')"
  >
    <span class="kbd" v-if="value && value[0]">{{ format(value[0]) }}</span>
    <span
      class="kbd"
      :key="index"
      v-for="(kbd, index) in value ? value.slice(1) : []"
    >{{ format(kbd) }}</span>
  </span>
</template>
<script lang="ts" setup>

defineProps(["value", "active", "disabled"]);
defineEmits(["setShortcut", "esc"]);

const acceleratorMap = {
  shift: "⇧",
  meta: "⌘",
  alt: "⌥",
  ctrl: "⌃",
};

const format = (kbdName: string) => {
  return kbdName.includes("Key")
    ? acceleratorMap[
    kbdName.slice(0, kbdName.length - 3) as keyof typeof acceleratorMap
    ]
    : kbdName.toUpperCase();
};
</script>
