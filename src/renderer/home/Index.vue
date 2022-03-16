<template>
  <div class="w-full h-full select-none">
    <div class="w-full h-16 py-4 dragable flex">
      <div
        class="absolute left-3 top-3 p-2 rounded-md"
        :class="searchContent ? 'border-2 border-blue-300' : ''"
      >
        <input
          type="text"
          class="outline-none caret-transparent cursor-default"
          ref="searchInput"
          v-model="searchContent"
          @keydown.esc="searchContent = ''"
        />
      </div>
      <div class="flex w-full justify-center">
        <img class="h-6 mr-3 mt-1" src="@/assets/logo.png" alt />
        <span class="w-44 mt-1">
          <keyboard
            @esc="
              keydown({
                keyCode: 27,
              })
            "
            :active="data.editing === 'main' && !editingAccelerator.length"
            @setShortcut="edit('main')"
            :value="data.editing === 'main' ? editingAccelerator : config.main"
          />
        </span>
      </div>
      <div class="flex leading-7 ml-5 absolute right-5 top-5">
        <span class="text-sm text-gray-400 text-center leading-6 mr-3">v{{ versionInfo.curVersion }}</span>
        <RefreshSvg
          @click="checkForUpdate"
          :class="{ 'animate-spin': versionInfo.checkingForUpdate }"
          class="mt-1 mr-2 cursor-pointer"
        />
        <span
          class="cursor-pointer text-gray-400 text-xs mt-1"
          v-if="versionInfo.latestVersion"
          @click="gotoLatestVertion"
        >
          点击下载最新版本: v{{ versionInfo.latestVersion }} (更新于{{
            versionInfo.releaseDate
          }})
        </span>
      </div>
    </div>
    <div style="height: calc(100% - 64px)" class="w-full flex p-5 space-x-5 bg-gray-100">
      <div style="width: calc(75% - 0.625rem)">
        <div class="h-32">
          <div class="text-sm space-x-2">
            <CountdownSvg class="inline-block" />
            <span class="cursor-pointer" @click="location.replace('#/timer')">倒计时</span>
            <keyboard
              @esc="
                keydown({
                  keyCode: 27,
                })
              "
              :active="data.editing === 'timer' && !editingAccelerator.length"
              @setShortcut="edit('timer')"
              :value="
                data.editing === 'timer' ? editingAccelerator : config.timer
              "
            />
          </div>
          <div class="h-auto flex-grow flex overflow-x-auto space-x-5 mt-3 pb-2">
            <div
              v-if="!timers.length"
              class="w-full flex-none h-20 rounded-lg shadow-md overflow-hidden bg-white font-light"
            >
              <empty />
            </div>
            <div
              class="w-44 flex-none h-20 rounded-lg shadow-md overflow-hidden bg-white font-light"
              v-for="timer of timers"
              :key="timer.id"
            >
              <div class="w-44 h-2">
                <div class="bg-blue-500 h-full" :style="{ width: timer.percent * 100 + '%' }"></div>
              </div>
              <div
                class="my-1 h-4 text-center text-xs text-gray-500"
              >{{ formatCountdown(timer.remain) }}</div>
              <div
                class="text-sm text-black text-center p-2 h-11 overflow-hidden whitespace-nowrap overflow-ellipsis"
              >{{ timer.content }}</div>
            </div>
          </div>
        </div>
        <div style="height: calc(100% - 148px)" class="flex space-x-5 mt-5">
          <div class="h-full" style="width: calc(50% - 0.625rem)">
            <div class="text-sm space-x-2">
              <ScheduleSvg class="inline-block" />
              <span class="cursor-pointer" @click="location.replace('#/schedule')">今日待办</span>
              <keyboard
                @esc="
                  keydown({
                    keyCode: 27,
                  })
                "
                :active="
                  data.editing === 'schedule' && !editingAccelerator.length
                "
                @setShortcut="edit('schedule')"
                :value="
                  data.editing === 'schedule'
                    ? editingAccelerator
                    : config.schedule
                "
              />
            </div>
            <div
              style="height: calc(100% - 44px)"
              class="bg-white mt-3 rounded-xl shadow-lg overflow-y-scroll font-light text-sm border cursor-grab"
              :class="{
                'border-blue-300': isDragging,
              }"
            >
              <draggable
                :disabled="searchContent"
                @start="isDragging = true"
                @end="isDragging = false"
                group="sni"
                item-key="id"
                :modelValue="searchScheduleOrInspiration(schedule?.[getTs()])"
                @update:modelValue="handleScheduleUpdate($event)"
                tag="transition-group"
                :component-data="{ name: 'animate-list', tag: 'div' }"
              >
                <template #item="{ element: item, index }">
                  <div
                    :class="{
                      'bg-gray-50': index % 2 === 1,
                      'line-through': item.done,
                      'text-gray-400': item.done,
                    }"
                    class="w-full h-10 p-2 flex leading-6"
                  >
                    <div
                      :class="{
                        'bg-blue-500': item.done,
                        'bg-white': !item.done,
                      }"
                      class="w-2 h-2 rounded-md m-2 border border-blue-500"
                    ></div>
                    <span
                      class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden"
                      style="width: calc(100% - 24px)"
                    >
                      <search-result :search="searchContent" :value="item.content" />
                    </span>
                  </div>
                </template>
              </draggable>
              <empty
                v-if="!searchScheduleOrInspiration(schedule?.[getTs()])?.length && !isDragging"
              />
            </div>
          </div>
          <div class="h-full" style="width: calc(50% - 0.625rem)">
            <div class="text-sm space-x-2">
              <InspirationSvg class="inline-block" />
              <span class="cursor-pointer" @click="location.replace('#/inspiration')">待办池</span>
              <keyboard
                @esc="
                  keydown({
                    keyCode: 27,
                  })
                "
                :active="
                  data.editing === 'inspiration' && !editingAccelerator.length
                "
                @setShortcut="edit('inspiration')"
                :value="
                  data.editing === 'inspiration'
                    ? editingAccelerator
                    : config.inspiration
                "
              />
            </div>
            <div
              style="height: calc(100% - 44px)"
              class="bg-white mt-3 rounded-xl shadow-lg overflow-y-scroll font-light text-sm border cursor-grab"
              :class="{
                'border-blue-300': isDragging,
              }"
            >
              <draggable
                :disabled="searchContent"
                @start="isDragging = true"
                @end="isDragging = false"
                group="sni"
                item-key="id"
                :modelValue="searchScheduleOrInspiration(inspiration)"
                @update:modelValue="handleInspirationUpdate($event)"
                tag="transition-group"
                :component-data="{ name: 'animate-list', tag: 'div' }"
              >
                <template #item="{ element: item, index }">
                  <div
                    :class="{
                      'bg-gray-50': index % 2 === 1,
                      'line-through': item.done,
                      'text-gray-400': item.done,
                    }"
                    class="w-full h-10 p-2 flex leading-6"
                  >
                    <div
                      :class="{
                        'bg-blue-500': item.done,
                        'bg-white': !item.done,
                      }"
                      class="w-2 h-2 rounded-md m-2 border border-blue-500"
                    ></div>
                    <span
                      class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden"
                      style="width: calc(100% - 24px)"
                    >
                      <search-result :search="searchContent" :value="item.content" />
                    </span>
                  </div>
                </template>
              </draggable>
              <empty v-if="!searchScheduleOrInspiration(inspiration).length" />
            </div>
          </div>
        </div>
      </div>
      <div style="width: calc(25% - 0.625rem)">
        <div class="text-sm space-x-2">
          <StickySvg class="inline-block" />

          <span>便签</span>
          <keyboard :disabled="true" :value="['metaKey', 'n']" />
        </div>
        <div
          style="height: calc(100% - 44px)"
          class="bg-white mt-3 rounded-xl shadow-lg overflow-y-scroll divide-y font-light text-sm"
        >
          <stikies :search="searchContent" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  defineComponent,
  toRaw,
  reactive,
  onMounted,
  ref,
  onUnmounted,
} from "vue";
import empty from "../components/empty.vue";
import { useUserData, useTimer } from "../composition";
import keyboard from "../components/keyboards.vue";
import { keyCodes } from "../utils/keyboard";
import { getTs, formatCountdown } from "../utils/time";
import stikies from "./stickies.vue";
import { useSearchContent } from "../components/searchContent";
import searchResult from "../components/searchResult.vue";
import draggable from "vuedraggable";
import CountdownSvg from "@/assets/svg/countdown.svg";
import StickySvg from "@/assets/svg/sticky.svg";
import ScheduleSvg from "@/assets/svg/schedule.svg";
import InspirationSvg from "@/assets/svg/inspiration.svg";
import RefreshSvg from "@/assets/svg/refresh.svg";

// global search

const searchInput = ref<any>(null);
const searchContent = ref("");

const focusSearchInput = () => {
  searchInput.value.focus();
  setTimeout(() => {
    if (data.editing) {
      searchInput.value.blur();
    }
  })
};

onMounted(() => {
  focusSearchInput();
  document.addEventListener("mouseup", focusSearchInput);
});

onUnmounted(() => {
  document.removeEventListener("mouseup", focusSearchInput);
});

// shortcuts
const data = reactive({
  editing: "",
});
let editingAccelerator = ref<any>([]);

const config = useUserData("shortcuts");
setTimeout(() => {
  config.value.timer = config.value.timer ?? ["metaKey", "shiftKey", "i"];
  config.value.schedule = config.value.schedule ?? [
    "metaKey",
    "shiftKey",
    "j",
  ];
  config.value.inspiration = config.value.inspiration ?? [
    "metaKey",
    "shiftKey",
    "l",
  ];
  config.value.main = config.value.main ?? ["metaKey", "shiftKey", "h"];
});
const { ipcRenderer, onMessage, platform, openUrl } = window.apis;

const edit = (type: string) => {
  data.editing = type;
  ipcRenderer.send("removeShortCut", {
    key: toRaw(config.value[type]) ?? [],
  });
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
};

const getAccelerator = (keyEvent: any) =>
  ["altKey", "ctrlKey", "metaKey", "shiftKey"].filter((i) => keyEvent[i]);

const keydown = (event: any) => {
  const key = keyCodes?.[event.keyCode]?.[platform as "darwin" | "win32"];

  if (
    !key ||
    !["normal", "accelerator", "esc"].includes(key.type) ||
    !key.value
  )
    return;

  if (key.type === "accelerator") {
    editingAccelerator.value = getAccelerator(event);
    return;
  }

  const shortcutContent =
    key.value === "esc"
      ? toRaw(config.value[data.editing])
      : getAccelerator(event).concat(key.value);
  config.value[data.editing] = shortcutContent;
  ipcRenderer.send("setShortCut", {
    window: data.editing,
    key: shortcutContent,
  });
  editingAccelerator.value = [];
  document.removeEventListener("keydown", keydown);
  document.removeEventListener("keyup", keyup);
  data.editing = "";
  focusSearchInput();
};

const keyup = (event: any) => {
  const key = keyCodes?.[event.keyCode]?.[platform as "darwin" | "win32"];

  if (!key || !["normal", "accelerator"].includes(key.type) || !key.value)
    return;

  if (key.type === "accelerator") {
    editingAccelerator.value = getAccelerator(event);
    return;
  }
};

// checking for update status

const versionInfo = reactive({
  curVersion: "",
  checkingForUpdate: false,
  latestVersion: "",
  releaseDate: "",
});

const checkForUpdate = () => {
  if (!versionInfo.checkingForUpdate) {
    ipcRenderer.send("checkforupdate");
  }
};

onMounted(() => {
  onMessage(({ type, value }: any) => {
    if (type === "checking-for-update") {
      versionInfo.checkingForUpdate = true;
    }
    if (type === "update-available") {
      versionInfo.latestVersion = value.version;
      versionInfo.releaseDate = new Date(
        value.releaseDate
      ).toLocaleDateString();
      versionInfo.checkingForUpdate = false;
    }
    if (type === "update-not-available" || type === "update-error") {
      versionInfo.latestVersion = "";
      versionInfo.checkingForUpdate = false;
    }
  });
  ipcRenderer.invoke("getVersion").then((version: string) => {
    versionInfo.curVersion = version;
  });
});

const gotoLatestVertion = () => {
  openUrl("https://github.com/cwj0417/schedule-pro/releases");
};

// timer
let { timers } = useTimer();

// inspiration

let inspiration = useUserData("inspiration", []);

// schedule

let schedule = useUserData("schedule");

// define search

const searchScheduleOrInspiration = useSearchContent(
  searchContent,
  "content"
);

// schedule and inspiration sort

const isDragging = ref(false);

const handleInspirationUpdate = (val: any[]) => {
  // 可以通过判断val和inspiration.value的长度 来判断是否要保留 inspiration, 直接return
  if (searchContent.value) return;
  inspiration.value = val
    .map((i) => toRaw(i))
    .map((i) => ({
      ...i,
      finish_time: i.finish_time ?? Date.now(),
    }));
};

const handleScheduleUpdate = (val: any[]) => {
  if (searchContent.value) return;
  schedule.value[getTs()] = val
    .map((i) => toRaw(i))
    .map((i) => {
      delete i.finish_time;
      return i;
    });
};

const location = window.location

</script>
