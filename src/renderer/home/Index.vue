<template>
  请设置快捷键
  <div class="wrapper">
    <div class="setting">
      <div class="up">计时器</div>
      <div
        class="down"
        :class="data.editing === 'timer' ? 'active' : ''"
        @click="edit('timer')"
      >
        <keyboard :value="config.timer" />
      </div>
    </div>
    <div class="setting">
      <div class="up">计划</div>
      <div
        class="down"
        :class="data.editing === 'schedule' ? 'active' : ''"
        @click="edit('schedule')"
      >
        <keyboard :value="config.schedule" />
      </div>
    </div>
    <div class="setting">
      <div class="up">灵感</div>
      <div
        class="down"
        :class="data.editing === 'inspiration' ? 'active' : ''"
        @click="edit('inspiration')"
      >
        <keyboard :value="config.inspiration" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRaw, reactive } from "vue";
import { useUserData } from "../composition";
import keyboard from "./keyboards.vue";

export default defineComponent({
  name: "home",
  components: {
    keyboard,
  },
  setup() {
    const data = reactive({
      editing: "",
    })
    const config = useUserData("shortcuts", {});
    const edit = (type: string) => {
      data.editing = type;
      window.apis.electron.ipcRenderer.send("removeShortCut", {
        key: toRaw(config.value[type]) ?? [],
      });
      document.addEventListener("keydown", keydown);
    }
    const keydown = (event: any) => {
      const { key } = event;
      if (["Meta", "Shift", "Alt", "Control"].indexOf(key) > -1) return;
      const shortcutContent = ["altKey", "ctrlKey", "metaKey", "shiftKey"]
        .filter((i) => event[i])
        .concat(event.key);
      config.value[data.editing] = shortcutContent;
      window.apis.electron.ipcRenderer.send("setShortCut", {
        window: data.editing,
        key: shortcutContent,
      });
      document.removeEventListener("keydown", keydown);
      data.editing = "";
    }
    return {
      data,
      config,
      edit,
      keydown,
    };
  },
});
</script>
<style lang="less" scoped>
.wrapper {
  display: flex;
  .setting {
    width: 250px;
    .up {
      font-size: 16px;
    }
    .down {
      border: 1px solid black;
      height: 25px;
      padding: 10px;
      &.active {
        background: #ccc;
      }
    }
  }
}
</style>