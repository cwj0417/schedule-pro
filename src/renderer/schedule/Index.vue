<template>
  输入todo
  <input
    v-focus
    type="text"
    @keypress.enter="
      (e) => {
        schedule[getTs()] = schedule[getTs()] ?? [];
        schedule[getTs()].push({
          create_time: Date.now(),
          content: e.target.value,
          done: false,
        });
        e.target.value = '';
      }
    "
  />
  <br />
  <br />
  <li v-for="(todo, index) in schedule[getTs()]" :key="todo.create_time">
    <input
      type="text"
      :value="todo.content"
      @input="
        (e) => {
          todo.content = e.target.value;
        }
      "
    />
    <span style="cursor: pointer" @click="todo.done = !todo.done"
      >({{ todo.done ? "已" : "未" }}完成)</span
    >
    <span style="cursor: pointer" @click="schedule[getTs()].splice(index, 1)"
      >(删除)</span
    >
  </li>
  <div v-if="!schedule[getTs()]?.length">(暂无todo)</div>
  <br />
  <br />
  昨天todo (不一定要展示, 还有历史所有都留着, 保留多长的待考虑)
  <br />
  (如果展示, 加个功能: 一键把未完成的移到今天)
  <br />
  <br />
  <li v-for="todo in schedule[getTs(-1)]" :key="todo.create_time">
    {{ todo.content }} ({{ todo.done ? "已" : "未" }}完成)
  </li>
  <br />
  <br />
  <p>其他: todo要和inspiration模块联动起来</p>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useUserData } from "../composition";
import { getTs } from "../utils/time";

export default defineComponent({
  name: "schedule",
  setup() {
    let schedule = useUserData("schedule");
    return {
      schedule,
      getTs,
    };
  },
});
</script>