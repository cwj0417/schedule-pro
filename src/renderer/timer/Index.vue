<template>
  <div class="wrap">
    <div class="page-title">
      <div class="back-home" @click="location.replace('#/home')">◀︎ schedule pro</div>
      <div>倒计时</div>
    </div>
    <div class="page-body">
      <div class="content-input-wrap divide-x">
        <div class="w-1/2 h-full">
          <input class="content-input-txt" placeholder="请输入内容..." v-focus :value="contentinput"
            @input="(e) => (contentinput = e.target.value)" type="text" @keypress.enter="handleEnter" />
        </div>
        <div class="w-1/2 h-full flex">
          <div style="color: var(--color-2)" class="flex-grow divide-x flex p-2 text-sm leading-4">
            <div class="px-3 flex">
              <input class="w-11 h-8 -m-2 outline-none inline-block mr-1 border p-2 rounded-md bg-transparent"
                type="number" :value="countdown" @input="(e) => (countdown = +e.target.value)"
                @keypress.enter="handleEnter" />mins
            </div>
            <div class="px-3 cursor-pointer" :class="{ 'active': countdown === 5 }" @click="countdown = 5">5mins
            </div>
            <div class="px-3 cursor-pointer" :class="{ 'active': countdown === 10 }" @click="countdown = 10">
              10mins</div>
            <div class="px-3 cursor-pointer" :class="{ 'active': countdown === 20 }" @click="countdown = 20">
              20mins</div>
            <div class="px-3 cursor-pointer" :class="{ 'active': countdown === 35 }" @click="countdown = 35">
              35mins</div>
          </div>
          <div class="w-14 h-full">
            <button class="content-input-btn text-xs" :class="{ 'active': contentinput !== '' }"
              @click="handleEnter">开始</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="w-1/2">提醒事项</div>
        <div class="w-1/4">时长</div>
        <div class="w-1/4">剩余</div>
      </div>
      <div class="w-full overflow-y-scroll" style="height: calc(100% - 120px)">
        <empty v-if="!timers.length" />
        <div style="color: var(--color-1)" class="todo-item-wrap group" :class="index % 2 === 1 ? 'stripped' : ''"
          v-for="(timer, index) of timers" :key="timer.id">
          <div class="w-1/2 pl-5 overflow-ellipsis whitespace-nowrap break-all overflow-x-hidden">{{ timer.content }}
          </div>
          <div class="w-1/4 pl-5">{{ formatCountdown(timer.last) }}</div>
          <div class="w-1/4 pl-5">
            {{ formatCountdown(timer.remain) }}
            <span class="float-right active pr-3 opacity-0 cursor-pointer group-hover:opacity-100"
              @click="removeCountDown(timer.id)">✘</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useTimer } from "../composition";
import { formatCountdown } from "../utils/time";
import empty from "../components/empty.vue";

const contentinput = ref<string>("");
const countdown = ref<number>(5);

const { send } = window.apis;

const handleEnter = () => {
  const content = contentinput.value;
  const cd = countdown.value;
  if (content && cd) {
    send("addCountDown", {
      cd,
      content,
    });
    contentinput.value = "";
    fetchTimers();
    send("hideWindow");
  }
};

const removeCountDown = (id: number) => {
  send("removeCountDown", id);
  fetchTimers();
};

const { timers, fetchTimers } = useTimer();

const location = window.location
</script>
