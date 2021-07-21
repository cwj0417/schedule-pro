<template>
  输入inspiration
  <input
    v-focus
    type="text"
    @keypress.enter="
      (e) => {
        createInspiration(e.target.value);
        e.target.value = '';
      }
    "
  />
  <br />
  <br />
  list: (ordered by create time)
  <br>
  <br>
  <li
    v-for="(todo, index) in inspiration
      .filter((i) => !i.done)
      .sort((a, b) => b.create_time - a.create_time)"
    :key="todo.create_time"
  >
    <input
      type="text"
      :value="todo.content"
      @input="(e) => (todo.content = e.target.value)"
    />
    <span
      style="cursor: pointer"
      @click="
        todo.done = !todo.done;
        todo.finish_time = Date.now();
      "
      >({{ todo.done ? "已" : "未" }}完成)</span
    >
    <span style="cursor: pointer" @click="inspiration.splice(index, 1)"
      >(删除)</span
    >
  </li>
  <div v-if="!inspiration?.length">(暂无)</div>
  <br />
  <br />
  done (ordered by finish time)
  <br />
  <br />
  <li
    v-for="todo in inspiration
      .filter((i) => i.done)
      .sort((a, b) => b.finish_time - a.finish_time)"
    :key="todo.create_time"
  >
    {{ todo.content }}
    <span style="cursor: pointer" @click="todo.done = !todo.done"
      >({{ todo.done ? "已" : "未" }}完成)</span
    >
  </li>
  <br />
  <br />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserData } from "../composition";

export default defineComponent({
  name: "inspiration",
  setup() {
    let inspiration = useUserData("inspiration", []);
    const createInspiration = (content: string) => {
      inspiration.value.push({
        create_time: Date.now(),
        finish_time: Date.now(),
        content,
        done: false,
      });
    };
    return {
      inspiration,
      createInspiration,
    };
  },
});
</script>