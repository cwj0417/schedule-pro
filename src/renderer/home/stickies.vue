<template>
  <empty v-if="!stickies.length" />
  <draggable
    v-else
    :modelValue="stickies"
    @update:modelValue="sortSticky($event)"
    item-key="id"
    class="divide-y"
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
        {{ sticky?.title || "未命名便签" }}
        <div
          class="w-2 h-2 rounded-md absolute top-4 right-2"
          :style="{
            background: sticky?.backgroundColor,
          }"
        ></div>
      </div>
    </template>
  </draggable>
  <!-- <div
    @click="openSticky(sticky.id)"
    v-for="sticky in stickies"
    :key="sticky.id"
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
      background: sticky.expended ? sticky.backgroundColor + '22' : '',
    }"
  >
    {{ sticky.title || "未命名便签" }}
    <div
      class="w-2 h-2 rounded-md absolute top-4 right-2"
      :style="{
        background: sticky.backgroundColor,
      }"
    ></div>
  </div> -->
</template>

<script lang="ts">
import empty from "../components/empty.vue";
import { defineComponent, onMounted, ref, toRaw } from "vue";
import draggable from "vuedraggable";

export default defineComponent({
  name: "stickies",
  components: { empty, draggable },
  setup() {
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
      ipcRenderer.send("sortStickies", value.map(i => toRaw(i)));
      // stickies.value = value
    }
    return {
      stickies,
      openSticky,
      sortSticky,
    };
  },
});
</script>
