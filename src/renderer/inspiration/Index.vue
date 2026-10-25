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
      <div class="page-name">待办池</div>
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
          @keypress.enter="createInspiration"
        />
        <button
          class="content-input-btn"
          :class="{ 'active': contentinput !== '' }"
          @click="createInspiration"
        >添加</button>
      </div>
      <div class="card">
        <div class="w-full">待办内容</div>
      </div>
      <div class="list-scroll">
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
import { useRouter } from "vue-router";
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

const router = useRouter();
const goHome = () => router.replace("/home");
</script>
