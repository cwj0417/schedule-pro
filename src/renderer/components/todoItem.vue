<template>
    <div class="todo-item-wrap hover-fill group" :class="singleLine ? 'stripped' : ''">
        <div class="todo-item" :class="{
          'item-done': item.done,
        }">
            <template v-if="isEditing">
                <input ref="inputRef" class="todo-edit-input" type="text"
                    :value="editingContent" @input="(e) => (editingContent = e.target.value)"
                    @keypress.enter="$emit('changeItem', editingContent); isEditing = false;"
                    @keydown.esc="isEditing = false" />
                <span class="kbd edit-key animate-pulse" @click="isEditing = false">esc</span>
                <span class="kbd edit-key animate-pulse"
                    @click="$emit('changeItem', editingContent); isEditing = false;">⏎</span>
            </template>
            <template v-else>
                <div :class="item.done ? 'indicator indicator-done' : 'indicator'" @click="$emit('toggleItem')"></div>
                <div class="todo-text">{{ item.content }}</div>
                <div class="todo-actions">
                    <div class="todo-action"
                        @click="isEditing = true; editingContent = item.content; inputfocus();">
                        <EditSvg class="inline-block" />
                    </div>
                    <div class="todo-action" @click="$emit('deleteItem', item.id)">
                        <TrashSvg class="inline-block" />
                    </div>
                </div>
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
    @apply w-3 h-3 rounded-full border-2 cursor-pointer flex-shrink-0 ml-1 mr-2 transition-all duration-150;
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

.todo-edit-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding-left: 8px;
    outline: none;
    background: transparent;
    color: var(--color-1);
}

.edit-key {
    width: 40px;
    flex: none;
}

// 编辑/删除只在 hover 时出现, 避免占用列表正文空间
.todo-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: none;
    opacity: 0;
    transition: opacity 0.15s ease;
}

.todo-item-wrap:hover .todo-actions {
    opacity: 1;
}

.todo-action {
    @apply w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-150;
    color: var(--color-2);

    &:hover {
        color: var(--theme-0);
        background-color: var(--bg-2);
    }
}
</style>
