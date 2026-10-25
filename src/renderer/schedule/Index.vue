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
      <div class="page-name">今日待办</div>
      <div class="title-drag"></div>
    </div>
    <div class="page-body">
      <div class="content-input-wrap">
        <input
          class="content-input-txt"
          placeholder="请输入内容..."
          v-focus
          :value="contentinput"
          @input="(e) => (contentinput = e.target.value)"
          type="text"
          @keypress.enter="createSchedule"
        />
        <button
          class="content-input-btn"
          :class="{ 'active': contentinput !== '' }"
          @click="createSchedule"
        >添加</button>
      </div>
      <div class="card">
        <div class="w-full">待办内容</div>
      </div>
      <div class="list-scroll">
        <empty v-if="!schedules?.[getTs()]?.length" />
        <transition-group name="animate-list" tag="div">
          <todo-item
            v-for="(schedule, index) of sortTodoStatus(schedules[getTs()])"
            :key="schedule.create_time"
            :singleLine="index % 2 === 1"
            :item="schedule"
            @deleteItem="
              (id) =>
                schedules[getTs()].splice(
                  schedules[getTs()].findIndex((i) => i.id === id),
                  1
                )
            "
            @toggleItem="schedule.done = !schedule.done"
            @changeItem="(val) => (schedule.content = val)"
          />
        </transition-group>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserData } from "../composition";
import empty from "../components/empty.vue";
import todoItem from "../components/todoItem.vue";
import { getTs } from "../utils/time";
import { sortTodoStatus } from "../utils/format";

const contentinput = ref<string>("");
let schedules = useUserData("schedule", []);

const createSchedule = () => {
  if (!contentinput.value.trim()) return;
  schedules.value[getTs()] = schedules.value[getTs()] ?? [];
  schedules.value[getTs()].unshift({
    id: Date.now(),
    create_time: Date.now(),
    content: contentinput.value,
    done: false,
  });
  contentinput.value = "";
};

const router = useRouter();
const goHome = () => router.replace("/home");
</script>
