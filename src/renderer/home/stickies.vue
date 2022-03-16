<template>
  <empty v-if="!searchSticky(stickies).length" />
  <draggable
    :disabled="search"
    v-else
    :modelValue="searchSticky(stickies)"
    @update:modelValue="sortSticky($event)"
    item-key="id"
    class="divide-y"
    tag="transition-group"
    :component-data="{ name: 'animate-list', tag: 'div' }"
  >
    <template #item="{ element: sticky }">
      <div
        @click="openSticky(sticky?.id)"
        class="h-10 leading-10 px-4 cursor-pointer overflow-ellipsis whitespace-nowrap break-all overflow-hidden relative group"
        :style="{
          background: sticky?.expended ? sticky?.backgroundColor + '22' : '',
        }"
      >
        <search-result :value="sticky?.title || '未命名便签'" :search="search" />
        <div
          class="w-2 h-2 rounded-md absolute top-4 right-3 opacity-100 group-hover:opacity-0"
          :style="{
            background: sticky?.backgroundColor,
          }"
        ></div>
        <ArrowUpSvg
          @click.prevent.stop="toTop(sticky?.id)"
          class="inline-block group-hover:opacity-100 absolute top-3 right-2 opacity-0"
        />
      </div>
    </template>
  </draggable>
</template>

<script lang="ts" setup>
import empty from "../components/empty.vue";
import { onMounted, ref, toRaw, toRef } from "vue";
import draggable from "vuedraggable";
import { useSearchContent } from "../components/searchContent";
import searchResult from "../components/searchResult.vue";
import ArrowUpSvg from "@/assets/svg/arrowup.svg";

const props = defineProps(['search']);

const { ipcRenderer, onMessage } = window.apis;
let stickies = ref<any[]>([]);

onMounted(() => {
  onMessage(({ type, value }: any) => {
    if (type === "stickesConfigChange") {
      stickies.value = value;
    }
  });
  ipcRenderer.send("getStickiesConfig");
});

const openSticky = (id: string) => ipcRenderer.send("openSticky", id);

const toTop = (id: string) => ipcRenderer.send("toTop", id);

const sortSticky = (value: any[]) => {
  if (props.search) return;
  ipcRenderer.send(
    "sortStickies",
    value.map((i) => toRaw(i))
  );
};

// search
const searchSticky = useSearchContent(toRef(props, "search"), "title");

</script>
