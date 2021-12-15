<template>
  <empty v-if="!searchSticky(stickies).length" />
  <draggable
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
        class="
          h-10
          leading-10
          px-4
          cursor-pointer
          overflow-ellipsis
          whitespace-nowrap
          break-all
          overflow-hidden
          relative
        "
        :style="{
          background: sticky?.expended ? sticky?.backgroundColor + '22' : '',
        }"
      >
        <search-result
          :value="sticky?.title || '未命名便签'"
          :search="search"
        />
        <div
          class="w-2 h-2 rounded-md absolute top-4 right-2"
          :style="{
            background: sticky?.backgroundColor,
          }"
        ></div>
      </div>
    </template>
  </draggable>
</template>

<script lang="ts">
import empty from "../components/empty.vue";
import { defineComponent, onMounted, ref, toRaw, toRef } from "vue";
import draggable from "vuedraggable";
import { useSearchContent } from "../components/searchContent";
import searchResult from "../components/searchResult.vue";

export default defineComponent({
  name: "stickies",
  components: { empty, draggable, searchResult },
  props: ["search"],
  setup(props) {
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

    const sortSticky = (value: any[]) => {
      if (props.search) return;
      ipcRenderer.send(
        "sortStickies",
        value.map((i) => toRaw(i))
      );
    };

    // search

    const searchSticky = useSearchContent(toRef(props, "search"), "title");

    return {
      stickies,
      openSticky,
      sortSticky,
      searchSticky,
    };
  },
});
</script>
