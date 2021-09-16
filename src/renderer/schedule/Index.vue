<template>
  <div class="w-full h-full select-none">
    <div class="w-full h-16 leading-8 py-4 dragable">
      <div
        class="px-5 font-bold absolute left-0 top-4 cursor-pointer"
        @click="location.replace('#/home')"
      >
        ◀︎ schedule pro
        <keyboard :disabled="true" :value="['metaKey', 'shiftKey', 'h']" />
      </div>
      <div class="text-center w-full font-bold tracking-wide">今日待办</div>
    </div>
    <div style="height: calc(100% - 64px)" class="p-5 bg-gray-50">
      <div
        class="
          w-full
          h-16
          p-4
          flex
          shadow-md
          rounded-md
          bg-white
          focus-within:ring-1 focus-within:ring-blue-400
        "
      >
        <div class="flex-grow h-full">
          <input
            class="
              outline-none
              w-full
              h-full
              text-gray-600
              placeholder-gray-200
            "
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
            :class="{ 'text-blue-400': contentinput !== '' }"
            @click="createSchedule"
          >
            添加
          </button>
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
        <div class="w-full pl-5">待办内容</div>
      </div>
      <div class="w-full overflow-y-scroll" style="height: calc(100% - 120px)">
        <empty v-if="!schedules?.[getTs()]?.length" />
        <transition-group name="schedule-list" tag="div">
          <todo-item
            v-for="(schedule, index) of sortTodoStatus(schedules[getTs()])"
            :key="schedule.create_time"
            :singleLine="index % 2 === 1"
            :schedule="schedule"
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
<script lang="ts">
import { defineComponent, ref } from "vue";
import keyboard from "../components/keyboards.vue";
import { useUserData } from "../composition";
import empty from "../components/empty.vue";
import todoItem from "./todoItem.vue";
import { getTs } from "../utils/time";
import { sortTodoStatus} from "../utils/format";

export default defineComponent({
  name: "timer",
  components: {
    keyboard,
    empty,
    todoItem,
  },
  setup() {
    const contentinput = ref<string>("");
    let schedules = useUserData("schedule", []);

    const createSchedule = () => {
      if (!contentinput.value.trim()) return;
      schedules.value[getTs()] = schedules.value[getTs()] ?? [];
      schedules.value[getTs()].push({
        id: Date.now(),
        create_time: Date.now(),
        content: contentinput.value,
        done: false,
      });
      contentinput.value = "";
    };

    return {
      schedules,
      createSchedule,
      contentinput,
      sortTodoStatus,
      getTs,
      location,
    };
  },
});
</script>
