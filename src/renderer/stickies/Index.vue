<template>
  <div class="h-full">
    <div class="dragable h-10 w-full flex items-center" :style="{ backgroundColor: bgColor }" @dblclick="fullscreen">
      <div style="backgroundColor: var(--bg-1);"
        class="w-5 h-5 ml-5 hover:w-60 rounded-xl transition-all duration-500 overflow-hidden nodragable shadow-sm shadow-gray-400">
        <div class="w-3 h-3 rounded-lg m-1 float-left shadow-sm shadow-gray-400"
          :style="{ backgroundColor: bgColor }" />
        <div class="w-px h-2.5 float-left ml-2 mr-0.5 shadow-sm shadow-gray-400"
          style="backgroundColor: var(--color-2);margin-top: 5px" />
        <div class="w-3 h-3 rounded-lg ml-2.5 mt-1 cursor-pointer float-left shadow-sm shadow-gray-400"
          v-for="color in 9" :key="color" style="--tw-ring-color: var(--color-3)"
          :style="`backgroundColor: var(--sticky-${color})`" @click="changeColor(color)" />
      </div>
      <div class="flex-grow"></div>
      <div class="h-5 pr-5 flex leading-4 nodragable">
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
    <div id="code-mirror" class="p-2 text-sm" style="height: calc(100% - 2.5rem); color: var(--color-0)"
      :style="`background: ${bgColor}`">
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useUserData, getBg } from "../composition";
import TrashSvg from "@/assets/svg/trash.svg";
import ArrowupSvg from "@/assets/svg/arrowup.svg";
import TransparentSvg from "@/assets/svg/transparent.svg";
import { useEditor } from '../composition/editor';

const getquery = () => {
  const matched = location.href.match(/\?id=([^&]+)&bg=(.+)/);
  return matched ? [matched[1], matched[2]] : [];
};

const { send, onMessage } = window.apis;
const [id, bg] = getquery();
let bgColor = ref<string>("white");
let isPin = ref<boolean>(false);
let isTransparent = ref<boolean>(false);
let timerHandler: NodeJS.Timeout | null = null;

let data: any;

const clickThoughMouseEnter = () => {
  if (isTransparent.value) {
    send("set-ignore-mouse-events", false);
  }
};

const clickThoughMouseLeave = () => {
  if (isTransparent.value) {
    send("set-ignore-mouse-events", true, {
      forward: true,
    });
  }
};

onMounted(() => {
  if (id) {
    bgColor.value = getBg(bg);
    data = useUserData(
      "sticky" + id,
      {
        content: "",
      },
      (val: any) => {
        if (timerHandler) clearTimeout(timerHandler);
        timerHandler = setTimeout(send, val.content ? 350 : 0, "setStickyTitle", {
          key: id,
          val: val.content,
        });
      },
      () => {
        useEditor(() => data.value.content, v => data.value.content = v, () => document.getElementById('code-mirror')!)
      }
    );
  }
  onMessage(({ type, value }: any) => {
    if (type === "changebg") {
      bgColor.value = getBg(value);
    }
  });
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
//   send("retractSticky", id);
// };
const deleteSticky = () => {
  send("deleteSticky", id);
};
const changeColor = (color: number) => {
  send("changeStickyColor", {
    stickyId: id,
    color: color.toString(),
  });
};
const fullscreen = () => {
  send("toggleFullscreen");
  isPin.value = false;
  send("setTransparent", false);
  isTransparent.value = false;
};
const toggleTransparent = () => {
  send("setTransparent", !isTransparent.value);
  isTransparent.value = !isTransparent.value;
};
const togglePin = () => {
  send("setPin", !isPin.value);
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