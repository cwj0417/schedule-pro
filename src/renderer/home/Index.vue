<template>
  <div class="wrap">
    <div class="page-title">
      <!-- 左上: logo 与全局快捷键 -->
      <div class="flex items-center absolute left-5 top-4 h-8">
        <img v-if="!isDark" class="h-6 mr-3" src="@/assets/logo.png" draggable="false" />
        <img v-else class="h-6 mr-3" src="@/assets/logoblack.png" draggable="false" />
        <span class="nodragable">
          <keyboard @esc="
            keydown({
              keyCode: 27,
            })
          " :active="data.editing === 'main' && !editingAccelerator.length" @setShortcut="edit('main')"
            :value="data.editing === 'main' ? editingAccelerator : config.main" />
        </span>
      </div>
      <!-- 中间: 搜索栏 -->
      <div class="absolute left-1/3 top-3 px-2 py-1 h-10 w-56 rounded-md transition-all duration-200"
        :style="{
          borderWidth: searchContent ? '1px' : '',
          borderColor: searchContent ? 'var(--border-0)' : ''
        }">
        <input type="text" class="w-full h-8 text-xs outline-none caret-transparent cursor-default bg-transparent search-input"
          ref="searchInput" v-model="searchContent" @keydown.esc="searchContent = ''"
          :placeholder="showSearchHint ? '直接输入以搜索, esc 以清空' : ''" />
      </div>
      <div class="flex leading-7 ml-5 absolute right-5 top-5 nodragable">
        <span style="color: var(--color-2)" class="text-sm text-center leading-6 mr-3" v-if="!versionInfo.downloaded">v{{
          versionInfo.curVersion
        }}</span>
        <RefreshSvg @click="checkForUpdate" v-if="!versionInfo.downloaded"
          :class="{ 'animate-spin': versionInfo.checkingForUpdate }" class="mt-1 mr-2 cursor-pointer" />

        <!-- 更新弹窗: 说明可滚动, 底部提供自动安装与手动下载 -->
        <div v-if="versionInfo.downloaded"
          class="update-card text-xs mt-1 relative z-10 w-[21rem] rounded-xl shadow-lg overflow-hidden"
          style="color: var(--color-2); background-color: var(--bg-0); border: 1px solid var(--border-1);">
          <div class="flex items-center gap-2.5 px-4 pt-3 pb-2.5" style="border-bottom: 1px solid var(--border-1);">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style="background: var(--theme-5); color: var(--theme-0);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </div>
            <div class="flex flex-col leading-4">
              <span class="text-sm font-bold" style="color: var(--color-0);">新版本 v{{ versionInfo.latestVersion }}</span>
              <span class="text-[11px] opacity-70">当前版本 v{{ versionInfo.curVersion }}</span>
            </div>
            <span class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style="background: var(--theme-5); color: var(--theme-0);">已下载</span>
          </div>
          <div class="update-notes px-4 py-3 overflow-y-auto" style="max-height: 216px;"
            v-html="versionInfo.releaseNotes || '<p>暂无更新说明</p>'"></div>
          <div class="px-4 py-3" style="border-top: 1px solid var(--border-1); background: var(--bg-1);">
            <div class="flex items-start gap-1.5 text-[11px] leading-4 mb-2.5"
              :style="{ color: versionInfo.installStatus ? 'var(--theme-0)' : 'var(--color-3)' }">
              <svg class="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
              </svg>
              <span>{{ versionInfo.installStatus || '点"安装并重启"即可覆盖安装, 无需重新下载' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button class="flex-1 h-8 rounded-lg text-xs font-medium transition-opacity hover:opacity-85"
                style="background: var(--theme-0); color: var(--theme-contrast);" @click="restart">安装并重启</button>
              <button class="h-8 px-3 rounded-lg text-xs transition-colors hover:opacity-80"
                style="background: var(--bg-0); color: var(--color-1); border: 1px solid var(--border-1);"
                @click="openReleasePage">下载安装包</button>
            </div>
          </div>
        </div>
        <span style="color: var(--color-2)" class="cursor-pointer text-xs mt-1" v-else-if="versionInfo.status">
          {{ versionInfo.status }}
        </span>
        <!-- 设置入口 -->
        <span class="cursor-pointer ml-3 mt-1 hover:opacity-70 transition-opacity" title="设置"
          @click="send('openSettingsWindow')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-2)">
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
            </path>
          </svg>
        </span>
      </div>
    </div>
    <div class="w-full flex space-x-5 page-body">
      <div v-if="showLeft" :style="{ width: leftWidth }"
        style="transition: width .5s;" class="flex space-x-5">
        <div v-if="showScheduleColumn" class="h-full" style="transition: width .5s;" :style="{ width: scheduleColumnWidth }">
          <template v-if="sections.schedule">
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
            <div :style="{ height: sections.timer ? 'calc(100% - 95px)' : 'calc(100% - 44px)', borderColor: isDragging ? 'var(--theme-0)' : 'var(--border-0)' }"
              class="content-block mt-3 rounded-xl overflow-y-scroll text-sm border cursor-grab transition-colors duration-200">
              <draggable :disabled="searchContent" @start="isDragging = true" @end="isDragging = false" group="sni"
                item-key="id" :modelValue="searchScheduleOrInspiration(schedule?.[getTs()])"
                @update:modelValue="handleScheduleUpdate($event)" tag="div">
                <template #header>
                  <empty v-if="!searchScheduleOrInspiration(schedule?.[getTs()])?.length && !isDragging" />
                  <div v-if="!searchScheduleOrInspiration(schedule?.[getTs()])?.length && isDragging"
                    class="w-full h-10 border-dashed border-2" style="border-color: var(--color-2)"></div>
                </template>
                <template #item="{ element: item, index }">
                  <div :class="{
                    'stripped': index % 2 === 1,
                    'item-done': item.done,
                  }" class="w-full h-10 p-2 flex leading-6 hover-fill">
                    <div :class="item.done ? 'indicator m-2 done' : 'indicator m-2'"></div>
                    <span class="flex items-center min-w-0" style="width: calc(100% - 24px)">
                      <span class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden min-w-0 flex-1">
                        <search-result :search="searchContent" :value="item.content" />
                      </span>
                      <span v-if="item.fromMcp" class="mcp-tag" title="由 MCP 写入">MCP</span>
                    </span>
                  </div>
                </template>
              </draggable>
            </div>
          </template>
          <div v-if="sections.timer" class="h-8" :class="sections.schedule ? 'mt-5' : ''">
            <div v-if="!timers.length" class="text-sm space-x-2">
              <CountdownSvg class="inline-block" />
              <span class="cursor-pointer" @click="location.replace('#/timer')">倒计时</span>
              <keyboard @esc="keydown({
                keyCode: 27,
              })" :active="data.editing === 'timer' && !editingAccelerator.length" @setShortcut="edit('timer')"
                :value="data.editing === 'timer' ? editingAccelerator : config.timer" />
            </div>
            <div v-else class="relative overflow-hidden text-sm cursor-pointer h-full rounded-xl border-2 p-1"
              @click="location.replace('#/timer')" style="color: var(--color-0); border-color: var(--theme-1)">
              <!-- 进度条用真实宽度表示剩余比例, 并配合 transition 让每秒的变化平滑可见 -->
              <div class="absolute left-0 top-0 bottom-0" :style="{
                width: Math.min(100, Math.max(0, timers[0].percent * 100)) + '%',
                background: 'linear-gradient(90deg, var(--theme-2), var(--theme-0))',
                transition: 'width 1s linear',
              }"></div>
              <span class="relative">{{ timers[0].content }}<span v-if="timers[0].fromMcp" class="mcp-tag"
                  title="由 MCP 写入">MCP</span></span>
            </div>
          </div>
        </div>
        <div v-if="sections.inspiration" class="h-full" style="transition: width .5s;" :style="{ width: inspirationColumnWidth }">
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
          <div style="height: calc(100% - 44px);" :style="{ borderColor: isDragging ? 'var(--theme-0)' : 'var(--border-0)' }"
            class="content-block mt-3 rounded-xl overflow-y-scroll text-sm border cursor-grab transition-colors duration-200">
            <draggable :disabled="searchContent" @start="isDragging = true" @end="isDragging = false" group="sni"
              item-key="id" :modelValue="searchScheduleOrInspiration(inspiration)"
              @update:modelValue="handleInspirationUpdate($event)" tag="div">
              <template #header>
                <empty v-if="!searchScheduleOrInspiration(inspiration).length && !isDragging" />
                <div v-if="!searchScheduleOrInspiration(inspiration).length && isDragging"
                  class="w-full h-10 border-dashed border-2" style="border-color: var(--color-2)"></div>
              </template>
              <template #item="{ element: item, index }">
                <div :class="{
                  'stripped': index % 2 === 1,
                  'item-done': item.done,
                }" class="w-full h-10 p-2 flex leading-6 hover-fill">
                  <div :class="item.done ? 'indicator m-2 done' : 'indicator m-2'"></div>
                  <span class="flex items-center min-w-0" style="width: calc(100% - 24px)">
                    <span class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden min-w-0 flex-1">
                      <search-result :search="searchContent" :value="item.content" />
                    </span>
                    <span v-if="item.fromMcp" class="mcp-tag" title="由 MCP 写入">MCP</span>
                  </span>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
      <div v-if="sections.sticky" :style="{ width: stickyWidth }" style="transition: width .5s;">
        <div class="text-sm flex items-center gap-2">
          <StickySvg class="inline-block flex-none" />
          <span class="cursor-pointer" @click="location.replace('#/stickies-list')">便签</span>
          <keyboard @esc="keydown({
            keyCode: 27,
          })" :active="data.editing === 'stickiesList' && !editingAccelerator.length"
            @setShortcut="edit('stickiesList')" :value="data.editing === 'stickiesList'
              ? editingAccelerator
              : config.stickiesList" />
          <keyboard v-if="data.editing !== 'stickiesList'" class="shortcut-mini ml-auto flex-none"
            :disabled="true" :value="['metaKey', 'n']" />
        </div>
        <div style="height: calc(100% - 44px); border: 1px solid var(--border-0);"
          class="content-block mt-3 rounded-xl overflow-y-scroll divide-y text-sm">
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
  watch,
} from "vue";
import empty from "../components/empty.vue";
import { useUserData, useTimer } from "../composition";
import keyboard from "../components/keyboards.vue";
import { keyCodes } from "../utils/keyboard";
import { getTs, formatCountdown } from "../utils/time";
import { resolveThemeBase } from "../utils/theme";
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
const isDark = computed(() => resolveThemeBase(themeState.currentTheme) === 'dark')

// global search

const searchInput = ref<any>(null);
const searchContent = ref("");

// 搜索栏提示语, 可在设置中关闭
const showSearchHint = ref(true);

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

// 补齐默认快捷键: shortcuts.json 可能来自旧版本, 需在异步读取完成后重新合并
const ensureShortcutDefaults = () => {
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
  config.value.stickiesList = config.value.stickiesList ?? [
    "metaKey",
    "shiftKey",
    "k",
  ];
  config.value.main = config.value.main ?? ["metaKey", "shiftKey", "h"];
};
watch(config, ensureShortcutDefaults, { deep: true, immediate: true });
declare global {
  interface Window {
    apis: {
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      onMessage: (callback: (message: any) => void) => void
      copyText: (text: string) => void
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
  installStatus: '',
});

const checkForUpdate = () => {
  if (!versionInfo.checkingForUpdate) {
    versionInfo.checkingForUpdate = true;
    send("checkforupdate");
  }
};

onMounted(() => {
  invoke("getSearchHint")
    .then((value: any) => {
      if (typeof value === "boolean") showSearchHint.value = value;
    })
    .catch(() => {});

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
      versionInfo.status = (value && value.message) || value || '';
      versionInfo.checkingForUpdate = false;
      if (versionInfo.downloaded) {
        // 已下载完成时保留版本信息, 只提示安装失败原因
        versionInfo.installStatus = '安装失败, 可点击"下载安装包"手动安装';
      } else {
        versionInfo.latestVersion = "";
      }
    }

    if (type === "update-installing") {
      versionInfo.installStatus = (value && value.message) || '正在安装更新, 应用即将重启…';
    }

    // 无法直接覆盖安装时, 安装包已解压到下载目录
    if (type === "update-install-fallback") {
      versionInfo.installStatus = (value && value.message) || '安装包已解压到下载目录, 请手动覆盖安装';
    }

    if (type === "download-progress") {
      versionInfo.status = '下载中' + Math.round(value.percent) + '%';
    }

    if (type === "update-downloaded") {
      versionInfo.downloaded = true;
      versionInfo.latestVersion = (value && value.version) || versionInfo.latestVersion;
      // 部分版本 releaseNotes 可能为空, 这里兜底避免更新弹窗渲染异常
      versionInfo.releaseNotes = (value && value.releaseNotes) || '';
    }

    // 监听主题变化
    if (type === 'themeChanged') {
      themeState.currentTheme = value;
    }

    // 设置页修改首页模块显隐
    if (type === 'homeSectionsChanged') {
      Object.assign(sections, value);
    }

    // 设置页开关搜索栏提示语
    if (type === 'searchHintChanged') {
      showSearchHint.value = !!value;
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
  versionInfo.installStatus = '正在安装更新, 应用即将重启…';
  send("installCachedUpdate", versionInfo.latestVersion);
}

// 手动下载: 打开对应版本的 Release 页面
const openReleasePage = () => {
  versionInfo.installStatus = '已在浏览器打开下载页';
  send("openReleasePage", versionInfo.latestVersion);
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

// 首页模块显隐配置
const sections = reactive({
  schedule: true,
  timer: true,
  inspiration: true,
  sticky: true,
});

// 设置页保存后立即同步; 窗口重新获得焦点时再拉一次兜底
const refreshSections = () => {
  invoke("getHomeSections").then((value: any) => {
    if (value) Object.assign(sections, value);
  });
};

onMounted(() => {
  refreshSections();
  window.addEventListener("focus", refreshSections);
});

onUnmounted(() => {
  window.removeEventListener("focus", refreshSections);
});

const showScheduleColumn = computed(() => sections.schedule || sections.timer);
const showLeft = computed(() => showScheduleColumn.value || sections.inspiration);
const leftColumnCount = computed(
  () => (showScheduleColumn.value ? 1 : 0) + (sections.inspiration ? 1 : 0)
);

// 隐藏的列按"空"处理, 宽度分配才能和可见内容匹配
const scheduleEmpty = computed(
  () =>
    !sections.schedule ||
    !searchScheduleOrInspiration(schedule.value?.[getTs()])?.length
);
const inspirationEmpty = computed(
  () => !sections.inspiration || !searchScheduleOrInspiration(inspiration.value)?.length
);
const bothVisibleEmpty = computed(() => scheduleEmpty.value && inspirationEmpty.value);

// "两列都为空就收窄"只是为了给便签让空间, 便签隐藏时各列应正常占满
const narrowWhenEmpty = computed(() => sections.sticky && bothVisibleEmpty.value);

const leftWidth = computed(() => {
  if (!sections.sticky) return "100%";
  if (!bothVisibleEmpty.value) return "calc(75% - 0.625rem)";
  return leftColumnCount.value === 2 ? "27.25rem" : "13rem";
});

const stickyWidth = computed(() => {
  if (!showLeft.value) return "100%";
  if (!bothVisibleEmpty.value) return "calc(25% - 0.625rem)";
  return leftColumnCount.value === 2
    ? "calc(100% - 28.5rem)"
    : "calc(100% - 14.25rem)";
});

const scheduleColumnWidth = computed(() => {
  if (!sections.inspiration) return "100%";
  if (!narrowWhenEmpty.value) return "calc(50% - 0.625rem)";
  if (scheduleEmpty.value === inspirationEmpty.value) return "calc(50% - 0.625rem)";
  return scheduleEmpty.value ? "13rem" : "calc(100% - 14.5rem)";
});

const inspirationColumnWidth = computed(() => {
  if (!showScheduleColumn.value) return "100%";
  if (!narrowWhenEmpty.value) return "calc(50% - 0.625rem)";
  if (scheduleEmpty.value === inspirationEmpty.value) return "calc(50% - 0.625rem)";
  return inspirationEmpty.value ? "calc(100% - 14.5rem)" : "13rem";
});

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
@reference "tailwindcss";

.content-block {
  @apply font-light;
  background-color: var(--bg-1);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--bg-0);
  }
}

.stripped {
  background-color: var(--bg-0);
}

.item-done {
  @apply line-through;
  color: var(--color-3);
  opacity: 0.7;
}

/* 列表项 hover 效果: 底色从鼠标位置展开 */
.w-full.h-10.p-2 {
  border-radius: 6px;
  margin: 1px 4px;
}

/* 搜索栏提示语 */
.search-input::placeholder {
  color: var(--color-3);
  opacity: 1;
}

/* 更新说明内容样式, 适配 GitHub Release 返回的 HTML */
.update-notes {
  font-size: 12px;
  line-height: 1.7;

  :deep(p) {
    margin: 4px 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 8px 0 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-0);
  }

  :deep(ul),
  :deep(ol) {
    margin: 4px 0;
    padding-left: 16px;
  }

  :deep(ul) {
    list-style: disc;
  }

  :deep(ol) {
    list-style: decimal;
  }

  :deep(li) {
    margin: 3px 0;
  }

  :deep(strong) {
    font-weight: 600;
    color: var(--color-0);
  }

  :deep(hr) {
    margin: 6px 0;
    border: none;
    border-top: 1px solid var(--border-1);
  }

  :deep(a) {
    color: var(--theme-0);
    text-decoration: underline;
    word-break: break-all;
  }

  :deep(code) {
    padding: 0 3px;
    border-radius: 3px;
    background: var(--bg-1);
  }

  :deep(hr) {
    margin: 6px 0;
    border-color: var(--border-1);
  }
}

/* 拖拽占位样式 */
.border-dashed.border-2 {
  border-radius: 6px;
  transition: border-color 0.2s ease;
}
</style>