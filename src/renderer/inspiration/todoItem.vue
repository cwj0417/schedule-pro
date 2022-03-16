<template>
  <div
    class="w-full h-10 flex leading-10 text-gray-600 text-sm rounded-md hover:bg-blue-50 relative group"
    :class="{
      'bg-gray-100': singleLine,
    }"
  >
    <div
      class="w-full flex mr-3 overflow-x-hidden"
      :class="{
        'line-through': inspiration.done,
        'text-gray-400': inspiration.done,
      }"
    >
      <template v-if="isEditing">
        <input
          ref="inputRef"
          class="flex-grow outline-none bg-transparent px-5"
          type="text"
          :value="editingContent"
          @input="(e) => (editingContent = e.target.value)"
          @keypress.enter="$emit('changeItem', editingContent); isEditing = false;"
          @keydown.esc="isEditing = false"
        />
        <span class="kbd my-2 animate-pulse" style="width: 40px" @click="isEditing = false">esc</span>
        <span
          class="kbd my-2 animate-pulse"
          style="width: 40px"
          @click="$emit('changeItem', editingContent); isEditing = false;"
        >⏎</span>
      </template>
      <template v-else>
        <div
          :class="{
            'bg-blue-500': inspiration.done,
            'bg-white': !inspiration.done,
          }"
          @click="$emit('toggleItem')"
          class="w-2 h-2 rounded-md m-4 border cursor-pointer border-blue-500"
        ></div>
        <div
          class="w-8 cursor-pointer text-center opacity-0 transform -translate-x-16 transition-all group-hover:opacity-100 group-hover:translate-x-0"
          @click="isEditing = true; editingContent = inspiration.content; inputfocus();"
        >
          <EditSvg class="m-auto inline-block" />
        </div>
        <div
          class="w-8 cursor-pointer text-center opacity-0 transform -translate-x-16 transition-all group-hover:opacity-100 group-hover:translate-x-0"
          @click="$emit('deleteItem', inspiration.id)"
        >
          <TrashSvg class="m-auto inline-block" fill="#999999" />
        </div>
        <div
          style="width: calc(100% - 120px)"
          class="pl-2 whitespace-nowrap break-all transform -translate-x-16 transition-all group-hover:translate-x-0"
        >{{ inspiration.content }}</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import EditSvg from '@/assets/svg/edit.svg';
import TrashSvg from '@/assets/svg/trash.svg';

defineProps(["inspiration", "singleLine"])
defineEmits(["changeItem", "deleteItem", "toggleItem"])

let isEditing = ref<boolean>(false);
let editingContent = ref<string>("");
let inputRef = ref<any>(null);
const inputfocus = () => {
  setTimeout(() => {
    inputRef.value.focus();
  });
};
</script>
