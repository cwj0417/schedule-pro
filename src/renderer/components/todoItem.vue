<template>
    <div class="todo-item-wrap hover-fill group" :class="singleLine ? 'stripped' : ''">
        <div class="todo-item" :class="{
          'item-done': item.done,
        }">
            <template v-if="isEditing">
                <input ref="inputRef" class="flex-grow outline-none bg-transparent px-5 transition-colors" type="text"
                    :value="editingContent" @input="(e) => (editingContent = e.target.value)"
                    @keypress.enter="$emit('changeItem', editingContent); isEditing = false;"
                    @keydown.esc="isEditing = false" />
                <span class="kbd my-2 animate-pulse" style="width: 40px" @click="isEditing = false">esc</span>
                <span class="kbd my-2 animate-pulse" style="width: 40px"
                    @click="$emit('changeItem', editingContent); isEditing = false;">⏎</span>
            </template>
            <template v-else>
                <div :class="item.done ? 'indicator indicator-done' : 'indicator'" @click="$emit('toggleItem')"></div>
                <div class="icon-wrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-8px] group-hover:translate-x-0"
                    @click="isEditing = true; editingContent = item.content; inputfocus();
                    ">
                    <EditSvg class="m-auto inline-block" style="color: var(--color-2)" />
                </div>
                <div class="icon-wrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-8px] group-hover:translate-x-0"
                    @click="$emit('deleteItem', item.id)">
                    <TrashSvg class="m-auto inline-block" style="color: var(--color-2)" />
                </div>
                <div style="width: calc(100% - 120px)"
                    class="pl-2 whitespace-nowrap break-all transition-transform duration-200 translate-x-[-8px] group-hover:translate-x-0">
                    {{ item.content }}</div>
            </template>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { ref } from "vue";
import EditSvg from '@/assets/svg/edit.svg';
import TrashSvg from '@/assets/svg/trash.svg';

defineProps(["item", "singleLine"])
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

<style lang="less" scoped>
@reference "tailwindcss";

.indicator {
    @apply w-3 h-3 rounded-full border-2 cursor-pointer flex-shrink-0 ml-4 mr-2 mt-3 transition-all duration-150;
    background-color: var(--bg-0);
    border-color: var(--border-1);

    &:hover {
        border-color: var(--theme-0);
        transform: scale(1.1);
    }

    &.indicator-done {
        background-color: var(--theme-0);
        border-color: var(--theme-0);
        box-shadow: inset 0 0 0 2px var(--bg-0);
    }
}
</style>
