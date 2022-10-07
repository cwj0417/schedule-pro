<template>
  <div class="wrap">
    <div class="page-title">
      <div
        class="back-home"
        @click="location.replace('#/home')"
      >◀︎ schedule pro</div>
      <div>今日待办</div>
    </div>
    <div class="page-body">
      <div
        class="content-input-wrap"
      >
        <div class="flex-grow h-full">
          <input
            class="content-input-txt"
            placeholder="请输入内容..."
            v-focus
            :value="contentinput"
            @input="(e) => (contentinput = e.target.value)"
            type="text"
            @keypress.enter="createSchedule"
          />
        </div>
        <div class="w-14 h-full">
          <button
            class="content-input-btn text-sm"
            :class="{ 'active': contentinput !== '' }"
            @click="createSchedule"
          >添加</button>
        </div>
      </div>
      <div class="card">
        <div class="w-full">待办内容</div>
      </div>
      <div class="w-full overflow-y-scroll" style="height: calc(100% - 120px)">
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

const location = window.location
</script>
