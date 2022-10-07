<template>
    <div class="todo-item-wrap group" :class="singleLine ? 'stripped' : ''">
        <div class="todo-item" :class="{
          'item-done': item.done,
        }">
            <template v-if="isEditing">
                <input ref="inputRef" class="flex-grow outline-none bg-transparent px-5" type="text"
                    :value="editingContent" @input="(e) => (editingContent = e.target.value)"
                    @keypress.enter="$emit('changeItem', editingContent); isEditing = false;"
                    @keydown.esc="isEditing = false" />
                <span class="kbd my-2 animate-pulse" style="width: 40px" @click="isEditing = false">esc</span>
                <span class="kbd my-2 animate-pulse" style="width: 40px"
                    @click="$emit('changeItem', editingContent); isEditing = false;">⏎</span>
            </template>
            <template v-else>
                <div :class="item.done ? 'indicator m-4 done' : 'indicator m-4'" @click="$emit('toggleItem')"></div>
                <div class="icon-wrap opacity-0 transform -translate-x-16  group-hover:opacity-100 group-hover:translate-x-0"
                    @click="isEditing = true; editingContent = item.content; inputfocus();
                    ">
                    <EditSvg class="m-auto inline-block" />
                </div>
                <div class="icon-wrap opacity-0 transform -translate-x-16  group-hover:opacity-100 group-hover:translate-x-0"
                    @click="$emit('deleteItem', item.id)">
                    <TrashSvg class="m-auto inline-block" fill="#999999" />
                </div>
                <div style="width: calc(100% - 120px)"
                    class="pl-2 whitespace-nowrap break-all transform -translate-x-16 transition-all group-hover:translate-x-0">
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
