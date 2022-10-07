<template>
  <div class="wrap">
    <div class="page-title">
      <div
        class="back-home"
        @click="location.replace('#/home')"
      >◀︎ schedule pro</div>
      <div>待办池</div>
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
            @keypress.enter="createInspiration"
          />
        </div>
        <div class="w-14 h-full">
          <button
            class="content-input-btn text-sm"
            :class="{ 'active': contentinput !== '' }"
            @click="createInspiration"
          >添加</button>
        </div>
      </div>
      <div class="card">
        <div class="w-full">待办内容</div>
      </div>
      <div class="w-full overflow-y-scroll" style="height: calc(100% - 120px)">
        <empty v-if="!inspirations.length" />
        <transition-group name="animate-list" tag="div">
          <todo-item
            v-for="(inspiration, index) of sortTodoStatus(inspirations)"
            :key="inspiration.create_time"
            :singleLine="index % 2 === 1"
            :item="inspiration"
            @deleteItem="(id: any) => inspirations.splice(inspirations.findIndex((i: any) => i.id === id), 1)"
            @toggleItem="inspiration.done = !inspiration.done; inspiration.finish_time = Date.now();"
            @changeItem="(val: any) => (inspiration.content = val)"
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
import { sortTodoStatus } from "../utils/format";

const contentinput = ref<string>("");
let inspirations = useUserData("inspiration", []);

const createInspiration = () => {
  if (!contentinput.value.trim()) return;
  inspirations.value.unshift({
    id: Date.now(),
    create_time: Date.now(),
    finish_time: Date.now(),
    content: contentinput.value,
    done: false,
  });
  contentinput.value = "";
};

const location = window.location


</script>
