<template>
  <div class="w-full h-full select-none">
    <div class="w-full h-16 leading-8 py-4 dragable">
      <div class="px-5 font-bold absolute left-0 top-4 cursor-pointer" @click="location.replace('#/home')">
        ◀︎ schedule pro
        <keyboard :disabled="true" :value="['metaKey', 'shiftKey', 'h']" />
      </div>
      <div class="text-center w-full font-bold tracking-wide">倒计时</div>
    </div>
    <div style="height: calc(100% - 64px)" class="p-5 bg-gray-50">
      <div class="w-full h-16 p-4 flex divide-x shadow-md rounded-md bg-white">
        <div class="w-1/2 h-full">
          <input
            class="outline-none w-full h-full text-gray-600 placeholder-gray-200"
            placeholder="请输入内容..."
            v-focus
            :value="contentinput"
            @input="(e) => (contentinput = e.target.value)"
            type="text"
            @keypress.enter="handleEnter"
          />
        </div>
        <div class="w-1/2 h-full flex">
          <div
            class="flex-grow divide-x flex p-2 text-gray-400 text-sm leading-4"
          >
            <div class="px-3 flex">
              <input
                class="
                  w-11
                  h-8
                  -m-2
                  outline-none
                  inline-block
                  mr-1
                  border
                  p-2
                  rounded-md
                "
                type="number"
                :value="countdown"
                @input="(e) => (countdown = +e.target.value)"
                @keypress.enter="handleEnter"
              />mins
            </div>
            <div
              class="px-3 cursor-pointer"
              :class="{ 'text-blue-500': countdown === 5 }"
              @click="countdown = 5"
            >
              5mins
            </div>
            <div
              class="px-3 cursor-pointer"
              :class="{ 'text-blue-500': countdown === 10 }"
              @click="countdown = 10"
            >
              10mins
            </div>
            <div
              class="px-3 cursor-pointer"
              :class="{ 'text-blue-500': countdown === 20 }"
              @click="countdown = 20"
            >
              20mins
            </div>
            <div
              class="px-3 cursor-pointer"
              :class="{ 'text-blue-500': countdown === 35 }"
              @click="countdown = 35"
            >
              35mins
            </div>
          </div>
          <div class="w-14 h-full">
            <button
              class="
                w-full
                h-6
                leading-3
                text-blue-100 text-sm
                border
                p-1
                border-blue-200
                rounded-md
                mt-1
              "
              :class="{'text-blue-400': contentinput !== ''}"
              @click="handleEnter"
            >
              开始
            </button>
          </div>
        </div>
      </div>
      <div
        class="
          w-full
          h-5
          mt-6
          mb-3
          border-l
          divide-x
          flex
          text-gray-400 text-sm
        "
      >
        <div class="w-1/2 pl-5">提醒事项</div>
        <div class="w-1/4 pl-5">时长</div>
        <div class="w-1/4 pl-5">剩余</div>
      </div>
      <div class="w-full overflow-y-scroll" style="height: calc(100% - 120px)">
        <empty v-if="!timers.length" />
        <div
          class="w-full h-10 flex leading-10 text-gray-600 text-sm hover:bg-blue-50 rounded-md group"
          v-for="(timer, index) of timers"
          :key="timer.id"
          :class="{
            'bg-gray-100': index % 2 === 1,
          }"
        >
          <div class="w-1/2 pl-5 overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden">{{ timer.content }}</div>
          <div class="w-1/4 pl-5">{{ formatCountdown(timer.last) }}</div>
          <div class="w-1/4 pl-5">
          {{ formatCountdown(timer.remain) }}
          <span class="float-right text-blue-500 pr-3 opacity-0 cursor-pointer group-hover:opacity-100" @click="removeCountDown(timer.id)">✘</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import keyboard from "../components/keyboards.vue";
import { useTimer } from "../composition";
import { formatCountdown } from "../utils/time";
import empty from "../components/empty.vue";

export default defineComponent({
  name: "timer",
  components: {
    keyboard,
    empty,
  },
  setup() {
    const contentinput = ref<string>("");
    const countdown = ref<number>(5);

    const { ipcRenderer } = window.apis

    const handleEnter = () => {
      const content = contentinput.value;
      const cd = countdown.value;
      if (content && cd) {
        ipcRenderer.send("addCountDown", {
          cd,
          content,
        });
        contentinput.value = ''
        fetchTimers()
        ipcRenderer.send("hideWindow")
      }
    };
    
    const removeCountDown = (id: number) => {
      ipcRenderer.send("removeCountDown", id);
      fetchTimers()
    }

    const { timers, fetchTimers } = useTimer();
    return {
      contentinput,
      countdown,
      handleEnter,
      timers,
      formatCountdown,
      removeCountDown,
      location,
    };
  },
});
</script>
