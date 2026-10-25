<template>
  <div class="wrap detail-page">
    <div class="page-title">
      <div class="back-home" @click="goHome">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>schedule pro</span>
      </div>
      <div class="page-name">倒计时</div>
      <div class="title-drag"></div>
    </div>
    <div class="page-body">
      <div class="content-input-wrap">
        <input class="content-input-txt" placeholder="请输入内容..." v-focus :value="contentinput"
          @input="(e) => (contentinput = e.target.value)" type="text" @keypress.enter="handleEnter" />
        <div class="duration-group">
          <div class="duration-input">
            <input type="number" min="1" :value="countdown" @input="(e) => (countdown = +e.target.value)"
              @keypress.enter="handleEnter" />
            <span>min</span>
          </div>
          <div class="duration-chip" v-for="minute of presetMinutes" :key="minute" :class="{ active: countdown === minute }"
            @click="countdown = minute">{{ minute }}</div>
        </div>
        <button class="content-input-btn" :class="{ 'active': contentinput !== '' }" @click="handleEnter">开始</button>
      </div>
      <div class="card">
        <div class="w-1/2">提醒事项</div>
        <div class="w-1/4">时长</div>
        <div class="w-1/4">剩余</div>
      </div>
      <div class="list-scroll">
        <empty v-if="!timers.length" />
        <div class="todo-item-wrap hover-fill group" :class="{ stripped: index % 2 === 1 }" v-for="(timer, index) of timers"
          :key="timer.id">
          <div class="w-1/2 todo-text">{{ timer.content }}</div>
          <div class="w-1/4 tabular-nums">{{ formatCountdown(timer.last) }}</div>
          <div class="w-1/4 tabular-nums flex items-center">
            {{ formatCountdown(timer.remain) }}
            <span class="row-remove" @click="removeCountDown(timer.id)">✘</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTimer } from "../composition";
import { formatCountdown } from "../utils/time";
import empty from "../components/empty.vue";

const contentinput = ref<string>("");
const countdown = ref<number>(5);
const presetMinutes = [5, 10, 20, 35];

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

const router = useRouter();
const goHome = () => router.replace("/home");
</script>
<style lang="less" scoped>
@reference "tailwindcss";

// 时长选择: 数字输入 + 常用时长快捷项
.duration-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--border-1);
  color: var(--color-3);
  font-size: 11px;

  input {
    width: 30px;
    outline: none;
    background: transparent;
    color: var(--color-1);
    font-size: 12px;
    text-align: center;
  }
}

.duration-chip {
  height: 30px;
  min-width: 30px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 11px;
  color: var(--color-2);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: var(--theme-0);
    background-color: var(--bg-2);
  }

  &.active {
    color: var(--theme-0);
    background-color: var(--theme-5);
  }
}
</style>
