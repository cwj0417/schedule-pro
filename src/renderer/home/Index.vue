<template>
  <div class="w-full h-full flex flex-col select-none">
    <div class="w-full h-16 py-4 dragable flex">
      <div class="flex text-sm text-gray-400 leading-9 w-1/2">
        <img class="h-6 m-auto mr-3" src="../assets/logo.png" alt="" />
        v{{ versionInfo.curVersion }}
      </div>
      <div class="w-1/2 flex leading-9 ml-5">
        <img
          class="h-6"
          :class="{ 'animate-spin': versionInfo.checkingForUpdate }"
          src="../assets/checkforupdate.png"
          alt=""
        />
        <span class="cursor-pointer" v-if="!versionInfo.version" @click="gotoLatestVertion"
          >点击下载最新版本: v{{ versionInfo.version }} (更新于{{
            versionInfo.releaseDate
          }})
        </span>
      </div>
    </div>
    <div class="flex-grow w-full flex p-5 space-x-5 bg-gray-100">
      <div class="w-9/12 flex flex-col">
        <div class="h-auto">
          <div class="text-2xl font-bold">
            timer
            <keyboard
              :active="data.editing === 'timer' && !editingAccelerator.length"
              @setShortcut="edit('timer')"
              :value="
                data.editing === 'timer' ? editingAccelerator : config.timer
              "
            />
          </div>
          <div class="h-auto flex-grow flex overflow-x-scroll space-x-5 mt-2">
            <div
              class="w-44 flex-none h-20 rounded-lg overflow-hidden bg-white"
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
        <div class="flex-grow flex space-x-5 mt-5">
          <div class="h-full flex-grow">
            <div class="text-2xl font-bold">
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
          </div>
          <div class="h-full flex-grow">
            <div class="text-2xl font-bold">
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
          </div>
        </div>
      </div>
      <div class="w-3/12">
        <div class="text-2xl font-bold">
          stickies
          <keyboard :disabled="true" :value="['metaKey', 'n']" />
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
import { useUserData } from "../composition";
import keyboard from "./keyboards.vue";
import { notification } from "../../type";
import { keyCodes } from "../utils/keyboard";

export default defineComponent({
  name: "home",
  components: {
    keyboard,
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
    return {
      data,
      editingAccelerator,
      config,
      edit,
      keydown,
      timers,
      versionInfo,
      gotoLatestVertion,
    };
  },
});
</script>
