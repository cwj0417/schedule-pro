<template>
  <empty v-if="!searchSticky(stickies).length" />
  <draggable :disabled="search" v-else :modelValue="searchSticky(stickies)" @update:modelValue="sortSticky($event)"
    item-key="id" class="divide-y" tag="transition-group" :component-data="{ name: 'animate-list', tag: 'div' }">
    <template #item="{ element: sticky }">
      <div @click="openSticky(sticky?.id)"
        class="h-10 leading-10 px-4 cursor-pointer overflow-ellipsis whitespace-nowrap break-all overflow-hidden relative group transition-all"
        style="borderColor: var(--bg-2);transformOrigin: left;" :style="{
          background: sticky?.expended ? +activeKey === +sticky.id ? getBg(sticky?.backgroundColor) : `linear-gradient(270deg,var(--bg-1),${getBg(sticky?.backgroundColor)})` : '',
          transform: sticky.id === findKey ? 'rotate3d(1, 10, 1, -25deg)' : ''
        }">
        <search-result :value="sticky?.title || '未命名便签'" :search="search" />
        <div class="w-2 h-2 rounded-md absolute top-4 right-3 opacity-100 group-hover:opacity-0" :style="{
          background: getBg(sticky?.backgroundColor),
        }"></div>
        <ArrowUpSvg @click.prevent.stop="toTop(sticky?.id)" style="fill: var(--color-0);"
          class="inline-block group-hover:opacity-100 absolute top-3 right-2 opacity-0" />
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
import { getBg } from "../composition";

const props = defineProps(['search']);

const { send, onMessage } = window.apis;
const stickies = ref<any[]>([]);
const activeKey = ref<any>(0);
const isFinding = ref<boolean>(false);
const findKey = ref<number | boolean>(false);

onMounted(() => {
  onMessage(({ type, value }: any) => {
    if (type === "stickesConfigChange") {
      stickies.value = value;
    }
    if (type === "activesticky") {
      activeKey.value = value
    }
  });
  send("getStickiesConfig");
  window.addEventListener('keydown', (e) => {
    const expended = (i: any) => i.expended
    if (!stickies.value.find(expended)) {
      return
    }
    if (e.key === 'Control') {
      isFinding.value = true
    }
    if (e.key === 'Tab') {
      if (findKey.value === false) {
        findKey.value = stickies.value.filter(expended)[0].id
      } else {
        let index = stickies.value.findIndex(i => i.id === findKey.value)
        function findNext() {
          if (index === stickies.value.length - 1) {
            index = stickies.value.findIndex(expended)
          } else {
            index++;
          }
          if (!stickies.value[index].expended) {
            findNext()
          }
        }
        findNext()
        findKey.value = stickies.value[index].id
      }
    }
  })
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
      isFinding.value = false
      if (findKey.value !== false) {
        openSticky(findKey.value.toString())
      }
      findKey.value = false
    }
  })
});

const openSticky = (id: string) => send("openSticky", id);

const toTop = (id: string) => send("toTop", id);

const sortSticky = (value: any[]) => {
  if (props.search) return;
  send(
    "sortStickies",
    value.map((i) => toRaw(i))
  );
};

// search
const searchSticky = useSearchContent(toRef(props, "search"), "title");

</script>
