<template>
  计时器
  <br />
  内容:
  <input v-focus ref="contentinput" type="text" @keypress.enter="handleEnter" />
  倒计时
  <input
    ref="countdown"
    type="number"
    value="5"
    @keypress.enter="handleEnter"
  />
  <br />
  这里可能显示正在倒数的计时器
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
export default defineComponent({
  name: "timer",
  setup() {
    const contentinput = ref<any>(null);
    const countdown = ref<any>(null);

    const handleEnter = () => {
      const content = contentinput.value.value;
      const cd = countdown.value.value;
      if (content && cd) {
        window.apis.electron.ipcRenderer.send("addCountDown", {
          cd,
          content,
        });
        window.close();
      }
    };
    return {
      contentinput,
      countdown,
      handleEnter,
    };
  },
});
</script>
<style lang="less" scoped>
</style>