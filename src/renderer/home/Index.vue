<template>
  <div class="w-full h-full select-none">
    <div class="w-full h-16 py-4 dragable flex">
      <div class="flex text-sm text-gray-400 leading-9 w-full text-center justify-center">
        <img class="h-6 mr-3" src="../assets/logo.png" alt="" />
        v{{ versionInfo.curVersion }}
      </div>
      <div class="flex leading-7 ml-5 absolute right-5 top-5">
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 18 18"
          version="1.1"
          :class="{ 'animate-spin': versionInfo.checkingForUpdate }"
          class="mt-1 mr-2"
        >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g transform="translate(-922.000000, -31.000000)">
              <g transform="translate(922.000000, 31.000000)" fill="#999999">
                <path
                  d="M14.4162427,3.29113384 C12.9315774,1.81395426 10.9573304,1 8.85727985,1 C4.52497055,1 1,4.504941 1,8.81254504 C1,11.9181708 2.84158142,14.6834467 5.61054107,15.9308587 L4.2690632,16.4007889 C3.98680571,16.4919253 3.83337109,16.7897987 3.9263285,17.0662545 C4.01928591,17.3427104 4.32350184,17.4930809 4.60575932,17.4019446 C4.6145427,17.3991666 4.62314309,17.3961198 4.63174348,17.3928937 L7.21744163,16.487355 C7.4970458,16.3895873 7.64261198,16.088219 7.54279256,15.8144515 C7.54270107,15.8142723 7.54260957,15.8140034 7.54251808,15.8137346 L7.53922431,15.8043252 C7.52961749,15.7251074 7.50198645,15.6492053 7.45816106,15.5819956 L6.61898257,13.2823485 C6.51962061,13.0086706 6.21265988,12.8658276 5.93333018,12.9631472 C5.93259824,12.9634161 5.93195778,12.9635953 5.93122583,12.9638641 C5.65171315,13.0617214 5.50596399,13.3630001 5.6058749,13.6368572 C5.6059664,13.6370365 5.60605789,13.6373053 5.60614938,13.6375741 L6.09975688,14.990819 C3.6851516,13.9215575 2.0759637,11.5167945 2.0759637,8.81272427 C2.0759637,5.08590164 5.11812299,2.05375847 8.85746284,2.05375847 C10.6675705,2.05375847 12.3686179,2.75569657 13.6494355,4.03053014 C14.9323576,5.30769365 15.63823,7.0057691 15.63823,8.81272427 C15.63823,11.4214463 14.1074521,13.824686 11.7372211,14.9346317 C11.4691451,15.0602691 11.3558762,15.3749897 11.4840586,15.6375556 C11.612424,15.9000318 11.9335662,16.0109727 12.2016422,15.8855146 C14.9428793,14.6012716 16.7142852,11.8247941 16.7142852,8.81272427 C16.7150172,6.72778979 15.8987121,4.76678999 14.4162427,3.29113384"
                  transform="translate(8.857143, 9.214286) scale(-1, 1) translate(-8.857143, -9.214286) "
                ></path>
              </g>
            </g>
          </g>
        </svg>
        <span
          class="cursor-pointer text-gray-400 text-xs mt-1"
          v-if="versionInfo.latestVersion"
          @click="gotoLatestVertion"
          >点击下载最新版本: v{{ versionInfo.latestVersion }} (更新于{{
            versionInfo.releaseDate
          }})
        </span>
      </div>
    </div>
    <div
      style="height: calc(100% - 64px)"
      class="w-full flex p-5 space-x-5 bg-gray-100"
    >
      <div class="w-9/12">
        <div class="h-32">
          <div class="text-2xl">
            timer
            <keyboard
              :active="data.editing === 'timer' && !editingAccelerator.length"
              @setShortcut="edit('timer')"
              :value="
                data.editing === 'timer' ? editingAccelerator : config.timer
              "
            />
          </div>
          <div
            class="h-auto flex-grow flex overflow-x-auto space-x-5 mt-3 pb-2"
          >
            <div
              v-if="!timers.length"
              class="
                w-44
                flex-none
                h-20
                rounded-lg
                shadow-md
                overflow-hidden
                bg-white
              "
            >
              <empty />
            </div>
            <div
              class="
                w-44
                flex-none
                h-20
                rounded-lg
                shadow-md
                overflow-hidden
                bg-white
              "
              v-for="timer of timers"
              :key="timer.id"
            >
              <div class="w-44 h-2">
                <div
                  class="bg-blue-500 h-full"
                  :style="{ width: timer.percent * 100 + '%' }"
                ></div>
              </div>
              <div class="my-1 h-4 text-center text-xs text-gray-500">
                <span v-if="timer.remain >= 60"
                  >{{ Math.floor(timer.remain / 60) }} min
                </span>
                <span>{{ timer.remain % 60 }} sec</span>
              </div>
              <div
                class="
                  text-md text-black text-center
                  p-2
                  h-11
                  overflow-hidden
                  whitespace-nowrap
                  overflow-ellipsis
                "
              >
                {{ timer.content }}
              </div>
            </div>
          </div>
        </div>
        <div style="height: calc(100% - 148px)" class="flex space-x-5 mt-5">
          <div class="w-1/2 h-full">
            <div class="text-2xl">
              schedule
              <keyboard
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
              class="
                bg-white
                mt-3
                rounded-xl
                shadow-lg
                overflow-y-scroll
                font-light
              "
            >
              <empty v-if="!schedule?.[getTs()]?.length" />
              <div
                :class="{
                  'bg-gray-50': index % 2 === 1,
                  'line-through': item.done,
                }"
                class="w-full h-10 p-2 flex"
                v-for="(item, index) in schedule[getTs()]"
                :key="index"
              >
                <div
                  :class="{
                    'bg-blue-500': !item.done,
                    'bg-blue-300': item.done,
                  }"
                  class="w-2 h-2 rounded-md m-2"
                ></div>
                {{ item.content }}
              </div>
            </div>
          </div>
          <div class="w-1/2 h-full">
            <div class="text-2xl">
              inspiration
              <keyboard
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
              class="
                bg-white
                mt-3
                rounded-xl
                shadow-lg
                overflow-y-scroll
                font-light
              "
            >
              <empty v-if="!inspiration.length" />
              <div
                :class="{
                  'bg-gray-50': index % 2 === 1,
                  'line-through': item.done,
                }"
                class="w-full h-10 p-2 flex"
                v-for="(item, index) in inspiration.sort((a, b) =>
                  a.done && !b.done ? 1 : 0
                )"
                :key="index"
              >
                <div
                  :class="{
                    'bg-blue-500': !item.done,
                    'bg-blue-300': item.done,
                  }"
                  class="w-2 h-2 rounded-md m-2"
                ></div>
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-3/12">
        <div class="text-2xl">
          stickies
          <keyboard :disabled="true" :value="['metaKey', 'n']" />
        </div>
        <div
          style="height: calc(100% - 44px)"
          class="
            bg-white
            mt-3
            rounded-xl
            shadow-lg
            overflow-y-scroll
            divide-y
            font-light
          "
        >
          <empty v-if="!stickies.length" />
          <div
            @click="openSticky(sticky.id)"
            v-for="sticky in stickies"
            :key="sticky.id"
            class="h-10 leading-10 px-4 cursor-pointer"
            :style="{
              background: sticky.expended ? sticky.backgroundColor + '22' : '',
            }"
          >
            {{ sticky.title }}
            <div
              class="w-2 h-2 rounded-md my-4 float-right"
              :style="{
                background: sticky.backgroundColor,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  toRaw,
  reactive,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import empty from "../components/empty.vue";
import { useUserData } from "../composition";
import keyboard from "./keyboards.vue";
import { notification } from "../../type";
import { keyCodes } from "../utils/keyboard";
import { getTs } from "../utils/time";
import { ipcRenderer } from "electron";

export default defineComponent({
  name: "home",
  components: {
    keyboard,
    empty,
  },
  setup() {
    const data = reactive({
      editing: "",
    });
    let editingAccelerator = ref<any>([]);

    const config = useUserData("shortcuts", {});
    const { electron, onMessage, platform, openUrl } = window.apis;

    const edit = (type: string) => {
      data.editing = type;
      electron.ipcRenderer.send("removeShortCut", {
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
      electron.ipcRenderer.send("setShortCut", {
        window: data.editing,
        key: shortcutContent,
      });
      editingAccelerator.value = [];
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      data.editing = "";
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
        if (type === "update-not-available") {
          versionInfo.latestVersion = "";
          versionInfo.checkingForUpdate = false;
        }
      });
      electron.ipcRenderer.invoke("getVersion").then((version: string) => {
        versionInfo.curVersion = version;
      });
    });

    const gotoLatestVertion = () => {
      openUrl("https://github.com/cwj0417/schedule-pro/releases");
    };

    // timer
    let timers: any = ref([]);
    let timerHandler: NodeJS.Timeout | null = null;
    electron.ipcRenderer
      .invoke("getNotificationQ")
      .then((messageQ: notification[]) => {
        const render = () => {
          timers.value = messageQ
            .map((item) => ({
              id: item.id,
              content: item.content,
              percent: (item.end - Date.now()) / (item.end - item.createTime),
              remain: Math.round((item.end - Date.now()) / 1000),
            }))
            .filter((i) => i.remain > 0);
        };
        timerHandler = setInterval(render, 1000);
        render();
      });
    onUnmounted(() => {
      clearInterval(timerHandler!);
    });

    // inspiration

    let inspiration = useUserData("inspiration", []);

    // schedule

    let schedule = useUserData("schedule");

    // stickies

    let stickies = ref([]);

    onMounted(() => {
      onMessage(({ type, value }: any) => {
        if (type === "stickesConfigChange") {
          stickies.value = value;
        }
      });
      electron.ipcRenderer.send("getStickiesConfig");
    });

    const openSticky = (id: string) =>
      electron.ipcRenderer.send("openSticky", id);

    return {
      data,
      editingAccelerator,
      config,
      edit,
      keydown,
      timers,
      versionInfo,
      gotoLatestVertion,
      inspiration,
      schedule,
      getTs,
      stickies,
      openSticky,
    };
  },
});
</script>
