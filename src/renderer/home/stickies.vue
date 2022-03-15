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
        <svg
          @click.prevent.stop="toTop(sticky?.id)"
          class="inline-block group-hover:opacity-100 absolute top-3 right-2 opacity-0"
          width="16px"
          height="16px"
          viewBox="0 0 12 12"
          version="1.1"
        >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g transform="translate(-580.000000, -14.000000)" :fill="'#999999'">
              <g transform="translate(580.000000, 10.000000)">
                <g transform="translate(0.000000, 4.000000)">
                  <path
                    d="M5.68321906,1.72664472 L1.25534586,5.60894171 C1.19756685,5.65958536 1.12598122,5.6844721 1.05468564,5.6844721 C0.969989503,5.6844721 0.88581547,5.64937541 0.8256,5.58069033 C0.714682873,5.45422624 0.727271271,5.26180359 0.85379337,5.15088646 L5.78699503,0.825582597 C5.9046656,0.722377949 6.07944095,0.726200821 6.19248208,0.829106803 C6.19119128,0.827914795 6.18987963,0.826743785 6.18855785,0.825584038 L11.1217608,5.15088646 C11.2482829,5.26180359 11.2608713,5.45422624 11.1499541,5.58069033 C11.0897967,5.64937541 11.0055066,5.6844721 10.9208685,5.6844721 C10.8495729,5.6844721 10.7779873,5.65958536 10.7202083,5.60894171 L6.29233508,1.72664472 L6.29233508,9.76176133 C6.29233508,9.92993536 6.1559511,10.0663193 5.98777707,10.0663193 C5.81960304,10.0663193 5.68321906,9.92993536 5.68321906,9.76176133 L5.68321906,1.72664472 Z M6.27356627,0.949158957 C6.28632026,0.983727721 6.29253661,1.02003328 6.29233508,1.05623016 L6.29233508,1.05459282 C6.29233508,1.01612894 6.2852057,0.979332936 6.27219702,0.945452804 Z M10.6208412,11.2255773 L1.35473619,11.2255773 C1.18650414,11.2255773 1.05017818,11.0891934 1.05017818,10.9210193 C1.05017818,10.7528453 1.18650414,10.6164613 1.35473619,10.6164613 L10.6208412,10.6164613 C10.7890152,10.6164613 10.9253992,10.7528453 10.9253992,10.9210193 C10.9253992,11.0891934 10.7890152,11.2255773 10.6208412,11.2255773 Z"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
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

    return {
      stickies,
      openSticky,
      sortSticky,
      searchSticky,
      toTop,
    };
  },
});
</script>
