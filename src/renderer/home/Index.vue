<template>
  <div class="wrap">
    <div class="page-title">
      <!-- 左上: logo 与全局快捷键 -->
      <div class="flex items-center absolute left-5 top-4 h-8">
        <Logo class="h-6 mr-3" draggable="false" />
        <span class="nodragable">
          <keyboard @esc="
            keydown({
              keyCode: 27,
            })
          " :active="data.editing === 'main'" @setShortcut="edit('main')"
            :value="config.main" :pressed="data.editing === 'main' ? editingAccelerator : []" />
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
      <div v-if="showLeft" class="h-full flex flex-col min-w-0" :style="{ width: leftWidth }"
        style="transition: width .5s;">
        <!-- 顶部一行: 今日办标题 / 今日办轮播 -->
        <div v-if="showScheduleColumn" class="flex-none h-8 flex items-center gap-3">
          <div class="flex-none flex items-center gap-2 text-sm whitespace-nowrap">
            <ScheduleSvg class="inline-block flex-none" />
            <span class="cursor-pointer" @click="location.replace('#/schedule')">今日办</span>
            <keyboard @esc="keydown({
              keyCode: 27,
            })" :active="data.editing === 'schedule'" @setShortcut="edit('schedule')"
              :value="config.schedule"
              :pressed="data.editing === 'schedule' ? editingAccelerator : []" />
          </div>
          <div class="flex-1 min-w-0 h-full">
            <div v-if="!currentSchedule" class="flex items-center h-full text-sm" style="color: var(--color-2)">
              暂无内容
            </div>
            <div v-else class="carousel-item" @mouseenter="carouselHover = true" @mouseleave="carouselHover = false">
              <!-- 切换条目时横向滚动: 旧条目向左滑出, 新条目从右侧滑入 -->
              <transition name="carousel-slide">
                <div class="carousel-slide-item" :key="currentSchedule.id">
                  <span class="carousel-text" :class="{
                    'is-done': currentSchedule.done,
                    overdue: isOverdue(currentSchedule) && !currentSchedule.done,
                  }">
                    <search-result :search="searchContent" :value="currentSchedule.content" />
                  </span>
                  <span v-if="currentSchedule.fromMcp" class="mcp-tag" title="由 MCP 写入">MCP</span>
                  <div class="carousel-actions">
                    <template v-if="currentSchedule.done">
                      <span class="carousel-action" @click.stop="currentSchedule.done = false">撤销</span>
                      <span class="carousel-action" @click.stop="deleteSchedule(currentSchedule)">删除</span>
                    </template>
                    <template v-else>
                      <span class="carousel-action" @click.stop="currentSchedule.done = true">完成</span>
                      <span v-if="isOverdue(currentSchedule)" class="carousel-action"
                        @click.stop="doToday(currentSchedule)">今天做</span>
                      <span class="carousel-action" @click.stop="moveScheduleToInspiration(currentSchedule)">→ 待办池</span>
                    </template>
                    <span class="carousel-action" @click.stop="nextCarousel">下一条</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
        <!-- 待办池 -->
        <div v-if="sections.inspiration" class="flex-1 min-h-0 flex flex-col"
          :class="showScheduleColumn ? 'mt-3' : ''">
          <div class="flex-none text-sm space-x-2">
            <InspirationSvg class="inline-block" />
            <span class="cursor-pointer" @click="location.replace('#/inspiration')">待办池</span>
            <keyboard @esc="keydown({
              keyCode: 27,
            })" :active="data.editing === 'inspiration'"
              @setShortcut="edit('inspiration')" :value="config.inspiration"
              :pressed="data.editing === 'inspiration' ? editingAccelerator : []" />
          </div>
          <div class="content-block mt-2 flex-1 min-h-0 rounded-xl overflow-y-scroll text-sm border"
            style="border-color: var(--border-0)">
            <empty v-if="!poolList.length" />
            <div v-for="(item, index) in poolList" :key="item.id" :class="{
              'stripped': index % 2 === 1,
              'item-done': item.done,
            }" class="pool-row w-full h-10 p-2 flex leading-6 hover-fill">
              <div :class="item.done ? 'indicator m-2 done' : 'indicator m-2'"></div>
              <span class="flex items-center min-w-0 flex-1">
                <span class="overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden min-w-0 flex-1">
                  <search-result :search="searchContent" :value="item.content" />
                </span>
                <span v-if="item.fromMcp" class="mcp-tag" title="由 MCP 写入">MCP</span>
              </span>
              <span v-if="!item.done" class="pool-action" @click.stop="moveInspirationToSchedule(item)">→ 今日</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showRight" class="h-full flex flex-col min-w-0" :style="{ width: rightWidth }"
        style="transition: width .5s;">
        <div class="flex-none text-sm flex items-center gap-2">
          <template v-if="sections.sticky">
            <StickySvg class="inline-block flex-none" />
            <span class="cursor-pointer" @click="location.replace('#/stickies-list')">便签</span>
            <keyboard @esc="keydown({
              keyCode: 27,
            })" :active="data.editing === 'stickiesList'"
              @setShortcut="edit('stickiesList')" :value="config.stickiesList"
              :pressed="data.editing === 'stickiesList' ? editingAccelerator : []" />
          </template>
          <!-- cmd+n 与倒计时都挂在右上角, 倒计时出现时把 cmd+n 向左推开 -->
          <div class="ml-auto flex-none flex items-center gap-2">
            <keyboard v-if="sections.sticky" class="flex-none" size="sm" :disabled="true"
              :value="['metaKey', 'n']" />
            <div v-if="sections.timer" class="timer-badge" :class="timers.length ? 'timer-running' : ''">
              <template v-if="!timers.length">
                <span class="flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  @click="location.replace('#/timer')">
                  <CountdownSvg class="inline-block flex-none" width="12" height="12" />
                  <span>倒计时</span>
                </span>
                <keyboard size="sm" @esc="keydown({
                  keyCode: 27,
                })" :active="data.editing === 'timer'" @setShortcut="edit('timer')"
                  :value="config.timer" :pressed="data.editing === 'timer' ? editingAccelerator : []" />
              </template>
              <template v-else>
                <!-- 进度条用真实宽度表示剩余比例, 并配合 transition 让每秒的变化平滑可见 -->
                <div class="absolute left-0 top-0 bottom-0" @click="location.replace('#/timer')" :style="{
                  width: Math.min(100, Math.max(0, timers[0].percent * 100)) + '%',
                  background: 'linear-gradient(90deg, var(--theme-2), var(--theme-0))',
                  transition: 'width 1s linear',
                }"></div>
                <span class="relative min-w-0 flex-1 truncate cursor-pointer"
                  @click="location.replace('#/timer')">{{ timers[0].content }}<span v-if="timers[0].fromMcp"
                    class="mcp-tag" title="由 MCP 写入">MCP</span></span>
              </template>
            </div>
          </div>
        </div>
        <div v-if="sections.sticky" class="mt-2 flex-1 min-h-0 rounded-xl overflow-y-scroll text-sm font-light">
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
import { getTs } from "../utils/time";
import stikies from "./stickies.vue";
import { useSearchContent } from "../components/searchContent";
import searchResult from "../components/searchResult.vue";

import CountdownSvg from "@/assets/svg/countdown.svg";
import Logo from "@/assets/svg/logo.svg";
import StickySvg from "@/assets/svg/sticky.svg";
import ScheduleSvg from "@/assets/svg/schedule.svg";
import InspirationSvg from "@/assets/svg/inspiration.svg";
import RefreshSvg from "@/assets/svg/refresh.svg";

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

// 倒计时已挂到右列右上角, 左列顶部只剩今日办
const showScheduleColumn = computed(() => sections.schedule);
const showLeft = computed(() => showScheduleColumn.value || sections.inspiration);
const showRight = computed(() => sections.sticky || sections.timer);

// 左列 60% / 右列 40%, 0.625rem 是 space-x-5 间距的一半
const leftWidth = computed(() =>
  !showRight.value ? "100%" : "calc(60% - 0.625rem)"
);
const rightWidth = computed(() =>
  !showLeft.value ? "100%" : "calc(40% - 0.625rem)"
);

// 今日办(单条轮播)与待办池列表
const todaySchedule = computed(
  () => searchScheduleOrInspiration(schedule.value?.[getTs()]) ?? []
);
const poolList = computed(
  () => searchScheduleOrInspiration(inspiration.value ?? [])
);

// 轮播: 每 4 秒切换一条, hover 或搜索时暂停
const carouselIndex = ref(0);
const carouselHover = ref(false);
const currentSchedule = computed(
  () => todaySchedule.value[carouselIndex.value] ?? null
);

const nextCarousel = () => {
  if (!todaySchedule.value.length) return;
  carouselIndex.value = (carouselIndex.value + 1) % todaySchedule.value.length;
};

watch(
  () => todaySchedule.value.length,
  (len) => {
    if (carouselIndex.value >= len) carouselIndex.value = 0;
  }
);
watch(searchContent, () => {
  carouselIndex.value = 0;
});

let carouselTimer: any = null;
onMounted(() => {
  carouselTimer = setInterval(() => {
    if (!carouselHover.value && !searchContent.value) nextCarousel();
  }, 4000);
});
onUnmounted(() => {
  if (carouselTimer) clearInterval(carouselTimer);
});

// 非当天创建的任务(提前安排过来的)用警告色提示
const isOverdue = (item: any) =>
  !!item?.create_time &&
  new Date(item.create_time).setHours(0, 0, 0, 0) !== getTs();

const doToday = (item: any) => {
  if (!item) return;
  item.create_time = Date.now();
};

// 已完成的任务直接从今日办删除, 不做二次确认
const deleteSchedule = (item: any) => {
  const list = schedule.value?.[getTs()];
  if (!list) return;
  const index = list.findIndex((i: any) => i.id === item.id);
  if (index !== -1) list.splice(index, 1);
};

// 今日办 -> 待办池
const moveScheduleToInspiration = (item: any) => {
  const list = schedule.value?.[getTs()];
  if (!list) return;
  const index = list.findIndex((i: any) => i.id === item.id);
  if (index === -1) return;
  list.splice(index, 1);
  inspiration.value = inspiration.value ?? [];
  inspiration.value.unshift({
    id: item.id,
    create_time: item.create_time ?? Date.now(),
    finish_time: Date.now(),
    content: item.content,
    done: false,
    ...(item.fromMcp ? { fromMcp: true } : {}),
  });
};

// 待办池 -> 今日办
const moveInspirationToSchedule = (item: any) => {
  inspiration.value = (inspiration.value ?? []).filter(
    (i: any) => i.id !== item.id
  );
  schedule.value[getTs()] = schedule.value[getTs()] ?? [];
  schedule.value[getTs()].unshift({
    id: item.id,
    // 保留原始创建时间: 非今天创建的任务会在轮播里提示, 可用"今天做"消除
    create_time: item.create_time ?? Date.now(),
    content: item.content,
    done: false,
    ...(item.fromMcp ? { fromMcp: true } : {}),
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

/* 今日办轮播: 一行高度, 悬停暂停并显示操作 */
.carousel-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 8px;
  overflow: hidden;
  border: 1px solid var(--border-0);
  border-radius: 8px;
  background-color: var(--bg-1);
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--border-1);
  }
}

/* 轮播条目横向滚动切换 */
.carousel-slide-item {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

.carousel-slide-enter-active,
.carousel-slide-leave-active {
  transition: transform 0.3s ease;
}

.carousel-slide-leave-active {
  pointer-events: none;
}

.carousel-slide-enter-from {
  transform: translateX(100%);
}

.carousel-slide-leave-to {
  transform: translateX(-100%);
}

/* 倒计时挂在右上角: 缩小, 贴住标题栏下边框与应用右边界 */
.timer-badge {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 8px;
  overflow: hidden;
  border: 1px solid var(--border-0);
  border-top: 0;
  border-right: 0;
  border-radius: 0 0 0 10px;
  background-color: var(--bg-1);
  box-shadow: 0 4px 10px var(--shadow-1);
  font-size: 12px;
  white-space: nowrap;
  /* page-body 有 20px 内 padding: 负右边距让挂件贴住应用右边界, 再上移贴住标题栏下边框 */
  margin-right: -20px;
  transform: translateY(-20px);
  /* 负底边距让挂件不撑高列头, 避免把便签列表顶下去 */
  align-self: flex-start;
  margin-bottom: -8px;
}

.timer-running {
  width: 8.5rem;
  border-color: var(--theme-1);
  color: var(--color-0);
  cursor: pointer;
}

.carousel-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-1);

  &.overdue {
    color: var(--warning-0);
  }

  &.is-done {
    color: var(--color-3);
    text-decoration: line-through;
    opacity: 0.7;
  }
}

/* 操作区盖在条目右侧, 用渐变背景避免遮挡文字时看不清 */
.carousel-actions {
  position: absolute;
  right: 4px;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 2px;
  padding-left: 20px;
  background: linear-gradient(90deg, transparent, var(--bg-1) 20px);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%) translateX(6px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.carousel-item:hover .carousel-actions {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(-50%);
}

.carousel-action {
  height: 22px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 22px;
  white-space: nowrap;
  color: var(--color-2);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: var(--theme-0);
    background-color: var(--bg-2);
  }
}

/* 待办池条目 hover 出现"移到今日办"操作 */
.pool-action {
  flex: none;
  margin-left: 6px;
  padding: 0 6px;
  height: 24px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 24px;
  white-space: nowrap;
  color: var(--theme-0);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-2);
  }
}

.pool-row:hover .pool-action {
  opacity: 1;
  pointer-events: auto;
}
</style>