<template>
  <div class="wrap">
    <div class="page-title">
      <div class="absolute left-3 top-3 px-2 py-1 h-10 rounded-md" :style="{
        borderWidth: searchContent ? '2px' : '',
        borderColor: searchContent ? 'var(--theme-2)' : ''
      }">
        <input type="text" class="outline-none caret-transparent cursor-default bg-transparent" ref="searchInput"
          v-model="searchContent" @keydown.esc="searchContent = ''" />
      </div>
      <div class="flex justify-center w-64 absolute left-1/3">
        <img v-if="!isDark" class="h-6 mr-3 mt-1" src="@/assets/logo.png" draggable="false" />
        <img v-else class="h-6 mr-3 mt-1" src="@/assets/logoblack.png" draggable="false" />
        <span class="nodragable">
          <keyboard @esc="
            keydown({
              keyCode: 27,
            })
          " :active="data.editing === 'main' && !editingAccelerator.length" @setShortcut="edit('main')"
            :value="data.editing === 'main' ? editingAccelerator : config.main" />
        </span>
      </div>
      <div class="flex leading-7 ml-5 absolute right-5 top-5 nodragable">
        <span style="color: var(--color-2)" class="text-sm text-center leading-6 mr-3" v-if="!versionInfo.downloaded">v{{
          versionInfo.curVersion
        }}</span>
        <RefreshSvg @click="checkForUpdate" v-if="!versionInfo.downloaded"
          :class="{ 'animate-spin': versionInfo.checkingForUpdate }" class="mt-1 mr-2 cursor-pointer" />

        <div style="color: var(--color-2); backgroundColor: var(--bg-0);"
          class="text-xs mt-1 relative w-40 z-10 p-2 shadow-md" v-if="versionInfo.downloaded">
          <div v-html="versionInfo.releaseNotes"></div>
          <span @click="restart" class="cursor-pointer inline-block" style="color: var(--color-0);">点击安装</span>
        </div>
        <span style="color: var(--color-2)" class="cursor-pointer text-xs mt-1" v-else-if="versionInfo.status">
          {{ versionInfo.status }}
        </span>
      </div>
    </div>
    <div class="w-full flex space-x-5 page-body">
      <div style="width: calc(75% - 0.625rem)" class="flex space-x-5">
        <div class="h-full" style="transition: width .5s;" :style="{
          width: (searchScheduleOrInspiration(inspiration)!.length === 0) === (searchScheduleOrInspiration(schedule?.[getTs()])!.length === 0) ? 'calc(50% - 0.625rem)' : searchScheduleOrInspiration(inspiration).length ? '11rem' : 'calc(100% - 12.5rem)'
        }">
          <div class="text-sm space-x-2">
            <ScheduleSvg class="inline-block" />
            <span class="cursor-pointer" @click="location.replace('#/schedule')">今日办</span>
            <keyboard @esc="keydown({
              keyCode: 27,
            })" :active="data.editing === 'schedule' && !editingAccelerator.length" @setShortcut="edit('schedule')"
              :value="data.editing === 'schedule'
                ? editingAccelerator
                : config.schedule" />
          </div>
          <div style="height: calc(100% - 95px);" :style="{ borderColor: isDragging ? 'var(--theme-2)' : 'var(--bg-2)' }"
            class="content-block mt-3 rounded-xl shadow-lg overflow-y-scroll text-sm border cursor-grab">
            <draggable :disabled="searchContent" @start="isDragging = true" @end="isDragging = false" group="sni"
              item-key="id" :modelValue="searchScheduleOrInspiration(schedule?.[getTs()])"
              @update:modelValue="handleScheduleUpdate($event)" tag="transition-group"
              :component-data="{ name: 'animate-list', tag: 'div' }">
              <template #header>
                <empty v-if="!searchScheduleOrInspiration(schedule?.[getTs()])?.length && !isDragging" />
                <div v-if="!searchScheduleOrInspiration(schedule?.[getTs()])?.length && isDragging"
                  class="w-full h-10 border-dashed border-2" style="border-color: var(--color-2)"></div>
              </template>
              <template #item="{ element: item, index }">
                <div :class="{
                  'stripped': index % 2 === 1,
                  'item-done': item.done,
                }" class="w-full h-10 p-2 flex leading-6">
                  <div :class="item.done ? 'indicator m-2 done' : 'indicator m-2'"></div>
                  <span class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden"
                    style="width: calc(100% - 24px)">
                    <search-result :search="searchContent" :value="item.content" />
                  </span>
                </div>
              </template>
            </draggable>
          </div>
          <div class="h-8 mt-5">
            <div v-if="!timers.length" class="text-sm space-x-2">
              <CountdownSvg class="inline-block" />
              <span class="cursor-pointer" @click="location.replace('#/timer')">倒计时</span>
              <keyboard @esc="keydown({
                keyCode: 27,
              })" :active="data.editing === 'timer' && !editingAccelerator.length" @setShortcut="edit('timer')"
                :value="data.editing === 'timer' ? editingAccelerator : config.timer" />
            </div>
            <div v-else class="text-sm space-x-2 cursor-pointer h-full rounded-xl border-2 p-1"
              @click="location.replace('#/timer')" style="color: var(--color-0); border-color: var(--theme-1)"
              :style="`background: linear-gradient(90deg, var(--theme-2), var(--theme-4) ${timers[0].percent * 100 + '%'}, transparent 0);`">
              {{ timers[0].content }}
            </div>
          </div>
        </div>
        <div class="h-full" style="transition: width .5s;" :style="{
          width: (searchScheduleOrInspiration(inspiration)!.length === 0) === (searchScheduleOrInspiration(schedule?.[getTs()])!.length === 0) ? 'calc(50% - 0.625rem)' : searchScheduleOrInspiration(inspiration).length ? 'calc(100% - 12.5rem)' : '11rem'
        }">
          <div class="text-sm space-x-2">
            <InspirationSvg class="inline-block" />
            <span class="cursor-pointer" @click="location.replace('#/inspiration')">待办池</span>
            <keyboard @esc="keydown({
              keyCode: 27,
            })" :active="data.editing === 'inspiration' && !editingAccelerator.length"
              @setShortcut="edit('inspiration')" :value="data.editing === 'inspiration'
                ? editingAccelerator
                : config.inspiration" />
          </div>
          <div style="height: calc(100% - 44px);" :style="{ borderColor: isDragging ? 'var(--theme-2)' : 'var(--bg-2)' }"
            class="content-block mt-3 rounded-xl shadow-lg overflow-y-scroll text-sm border cursor-grab">
            <draggable :disabled="searchContent" @start="isDragging = true" @end="isDragging = false" group="sni"
              item-key="id" :modelValue="searchScheduleOrInspiration(inspiration)"
              @update:modelValue="handleInspirationUpdate($event)" tag="transition-group"
              :component-data="{ name: 'animate-list', tag: 'div' }">
              <template #header>
                <empty v-if="!searchScheduleOrInspiration(inspiration).length && !isDragging" />
                <div v-if="!searchScheduleOrInspiration(inspiration).length && isDragging"
                  class="w-full h-10 border-dashed border-2" style="border-color: var(--color-2)"></div>
              </template>
              <template #item="{ element: item, index }">
                <div :class="{
                  'stripped': index % 2 === 1,
                  'item-done': item.done,
                }" class="w-full h-10 p-2 flex leading-6">
                  <div :class="item.done ? 'indicator m-2 done' : 'indicator m-2'"></div>
                  <span class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden"
                    style="width: calc(100% - 24px)">
                    <search-result :search="searchContent" :value="item.content" />
                  </span>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
      <div style="width: calc(25% - 0.625rem)">
        <div class="text-sm space-x-2">
          <StickySvg class="inline-block" />
          <span>便签</span>
          <keyboard :disabled="true" :value="['metaKey', 'n']" />
        </div>
        <div style="height: calc(100% - 44px)"
          class="content-block mt-3 rounded-xl shadow-lg overflow-y-scroll divide-y text-sm">
          <stikies :search="searchContent" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  toRaw,
  reactive,
  onMounted,
  ref,
  onUnmounted,
  computed,
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

// 全局主题状态管理
const themeState = reactive({
  currentTheme: 'system'
})

// 计算当前是否为深色模式
const isDark = computed(() => {
  if (themeState.currentTheme === 'dark') return true
  if (themeState.currentTheme === 'light') return false
  // system theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})

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
declare global {
  interface Window {
    apis: {
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      onMessage: (callback: (message: any) => void) => void
      platform: string
    }
  }
}

const { invoke, send, onMessage, platform } = window.apis;

const edit = (type: string) => {
  data.editing = type;
  send("removeShortCut", {
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
  send("setShortCut", {
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
  status: "",
  downloaded: false,
  releaseNotes: '',
});

const checkForUpdate = () => {
  if (!versionInfo.checkingForUpdate) {
    versionInfo.checkingForUpdate = true;
    send("checkforupdate");
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
    }
    if (type === "update-not-available" || type === "update-error") {
      versionInfo.status = value;
      versionInfo.latestVersion = "";
      versionInfo.checkingForUpdate = false;
    }

    if (type === "download-progress") {
      versionInfo.status = '下载中' + Math.round(value.percent) + '%';
    }

    if (type === "update-downloaded") {
      versionInfo.downloaded = true;
      versionInfo.latestVersion = value;
      versionInfo.releaseNotes = `<p>当前版本 : ${versionInfo.curVersion}</p><hr class='my-2'/>` + value.releaseNotes.replace('chore(release)', '最新版本').replace(/\<p(\>[^\<]+\<\/p\>)/, '<p style="color: var(--color-0);padding-bottom: 5px;" $1') + `<hr class='my-2'/>`;
    }

    // 监听主题变化
    if (type === 'themeChanged') {
      themeState.currentTheme = value;
    }
  });
  
  invoke("getVersion").then((version: string) => {
    versionInfo.curVersion = version;
  });
  
  // 初始化主题状态
  invoke("getTheme").then((theme: string) => {
    if (theme) {
      themeState.currentTheme = theme;
    }
  }).catch((error) => {
    console.error('获取主题设置失败:', error);
  });
});

const restart = () => {
  send("quitAndInstall");
}

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
<style lang="less">
.content-block {
  @apply font-light;
  background-color: var(--bg-0);
}

.stripped {
  background-color: var(--bg-1);
}

.item-done {
  @apply line-through;
  color: var(--color-2);
}
</style>