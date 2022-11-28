<template>
  <div class="h-full">
    <div class="dragable h-10 w-full flex items-center" :style="{ backgroundColor: bgColor }" @dblclick="fullscreen">
      <div style="backgroundColor: var(--color-2)"
        class="w-5 h-5 ml-5 hover:w-60 rounded-xl transition-all duration-500 overflow-hidden">
        <div class="w-3 h-3 rounded-lg m-1 float-left" :style="{ backgroundColor: bgColor }" />
        <div class="w-px h-2.5 float-left ml-2 mr-0.5" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="w-3 h-3 rounded-lg ml-2.5 mt-1 cursor-pointer float-left" v-for="color in colors"
          :class="{ 'ring-1 ring-offset-1': color === bgColor }" :key="color" style="--tw-ring-color: var(--color-3)"
          :style="{ backgroundColor: color }" @click="changeColor(color)" />
      </div>
      <div class="flex-grow"></div>
      <div class="h-5 pr-5 flex leading-4">
        <div class="cursor-pointer ml-3" @click="togglePin">
          <ArrowupSvg class="inline-block" :fill="isPin ? '#333333' : '#999999'" />
        </div>
        <div class="cursor-pointer ml-3" @click="toggleTransparent">
          <TransparentSvg class="inline-block" :fill="isTransparent ? '#333333' : '#999999'" />
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="cursor-pointer ml-3">
          <TrashSvg @click="deleteSticky" class="inline-block" fill="#333333" />
        </div>
      </div>
    </div>
    <div class="p-2" style="height: calc(100% - 2.5rem)" :style="{ backgroundColor: bgColor + '66' }">
      <textarea autofocus class="non-border w-full h-full" cols="30" rows="10" :value="data?.value.content"
        @input="(e) => (data.value.content = e.target.value)"></textarea>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useUserData } from "../composition";
import TrashSvg from "@/assets/svg/trash.svg";
import ArrowupSvg from "@/assets/svg/arrowup.svg";
import TransparentSvg from "@/assets/svg/transparent.svg";

const getquery = () => {
  const matched = location.href.match(/\?id=([^&]+)&bg=(.+)/);
  return matched ? [matched[1], matched[2]] : [];
};

const colors = [
  "#F7F7AD",
  "#FFD45D",
  "#AAE29B",
  "#95E3C7",
  "#9AC3FF",
  "#C3ECFF",
  "#BAC7FF",
  "#FFB0AF",
  "#FFDCFE",
];
const { ipcRenderer, onMessage } = window.apis;
const [id, bg] = getquery();
let data = ref<any>(null);
let bgColor = ref<string>("white");
let isPin = ref<boolean>(false);
let isTransparent = ref<boolean>(false);
let timerHandler: NodeJS.Timeout | null = null;

const clickThoughMouseEnter = () => {
  if (isTransparent.value) {
    ipcRenderer.send("set-ignore-mouse-events", false);
  }
};

const clickThoughMouseLeave = () => {
  if (isTransparent.value) {
    ipcRenderer.send("set-ignore-mouse-events", true, {
      forward: true,
    });
  }
};

onMounted(() => {
  onMessage(({ type, value }: any) => {
    if (type === "changebg") {
      bgColor.value = value;
    }
  });
  if (id) {
    bgColor.value = bg;
    data.value = useUserData(
      "sticky" + id,
      {
        content: "",
      },
      (val: any) => {
        if (timerHandler) clearTimeout(timerHandler);
        timerHandler = setTimeout(ipcRenderer.send, val.content ? 350 : 0, "setStickyTitle", {
          key: id,
          val: val.content,
        });
      }
    );
  }
  document
    .getElementsByClassName("dragable")[0]
    .addEventListener("mouseenter", clickThoughMouseEnter);
  document
    .getElementsByClassName("dragable")[0]
    .addEventListener("mouseleave", clickThoughMouseLeave);
});

onUnmounted(() => {
  document
    .getElementsByClassName("dragable")[0]
    .removeEventListener("mouseenter", clickThoughMouseEnter);
  document
    .getElementsByClassName("dragable")[0]
    .removeEventListener("mouseleave", clickThoughMouseLeave);
});

// const retract = () => {
//   ipcRenderer.send("retractSticky", id);
// };
const deleteSticky = () => {
  ipcRenderer.send("deleteSticky", id);
};
const changeColor = (color: string) => {
  ipcRenderer.send("changeStickyColor", {
    stickyId: id,
    color,
  });
};
const fullscreen = () => {
  ipcRenderer.send("toggleFullscreen");
  isPin.value = false;
  ipcRenderer.send("setTransparent", false);
  isTransparent.value = false;
};
const toggleTransparent = () => {
  ipcRenderer.send("setTransparent", !isTransparent.value);
  isTransparent.value = !isTransparent.value;
};
const togglePin = () => {
  ipcRenderer.send("setPin", !isPin.value);
  isPin.value = !isPin.value;
};
</script>
<style lang="less">
.non-border {
  border: 0;
  resize: none;
  background: transparent;

  &:focus {
    outline: none;
  }
}
</style>