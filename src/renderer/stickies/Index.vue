<template>
  <div :style="{ background: data?.value.color, height: '100%' }">
    <div class="dragable h-5 w-full" style="border: 1px solid gray">
      <button @click="retract">最小化</button>
      <button @click="deleteSticky">删除</button>
      <button @click="changeColor('#c3fdaa')">绿</button>
      <button @click="changeColor('#fcf4a7')">黄</button>
    </div>
    <textarea
      class="non-border w-full h-full p-2"
      name=""
      id=""
      cols="30"
      rows="10"
      :value="data?.value.content"
      @input="(e) => (data.value.content = e.target.value)"
    ></textarea>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useUserData } from "../composition";

export default defineComponent({
  setup() {
    let data = ref<any>(null);
    let timerHandler: NodeJS.Timeout | null = null;
    onMounted(() => {
      const query = location.href.split("?id=")[1];
      if (query) {
        data.value = useUserData(
          "sticky" + query,
          {
            content: "",
          },
          (val: any) => {
            if (timerHandler) clearTimeout(timerHandler);
            timerHandler = setTimeout(
              window.apis.electron.ipcRenderer.send,
              350,
              "setStickyTitle",
              {
                key: query,
                val: val.content,
              }
            );
          }
        );
      }
    });

    const retract = () => {
      const query = location.href.split("?id=")[1];
      window.apis.electron.ipcRenderer.send("retractSticky", query);
    };
    const deleteSticky = () => {
      const query = location.href.split("?id=")[1];
      window.apis.electron.ipcRenderer.send("deleteSticky", query);
    };
    const changeColor = (color: string) => {
      const query = location.href.split("?id=")[1];
      window.apis.electron.ipcRenderer.send("changeStickyColor", {
        stickyId: query,
        color,
      });
    };
    return {
      data,
      retract,
      deleteSticky,
      changeColor,
    };
  },
});
</script>
<style lang="less" scoped>
.non-border {
  border: 0;
  resize: none;
  background: transparent;
  &:focus {
    outline: none;
  }
}
</style>