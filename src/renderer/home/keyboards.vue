<template>
  <kbd v-if="value && value[0]">{{ format(value[0]) }}</kbd>
  <template :key="index" v-for="(kbd, index) in value ? value.slice(1) : []">
    +
    <kbd>{{ format(kbd) }}</kbd>
  </template>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["value"],
  setup () {
    const format = (kbdName: string) => {
      return kbdName.includes("Key")
        ? kbdName.slice(0, kbdName.length - 3).replace("meta", "cmd") // todo: 这个 meta 要根据平台来显示
        : kbdName.toUpperCase();
    }
    return {
      format,
    }
  },
});
</script>
<style lang="less" scoped>
kbd {
  background: linear-gradient(180deg, #eee, #fff);
  background-color: #eee;
  border: 1px solid #cdd5d7;
  border-radius: 6px;
  box-shadow: 0 1px 2px 1px #cdd5d7;
  font-family: consolas, "Liberation Mono", courier, monospace;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  margin: 3px;
  padding: 4px 6px;
  white-space: nowrap;
}
</style>
