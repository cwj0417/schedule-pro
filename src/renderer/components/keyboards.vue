<template>
  <span
    class="shortcut-keys"
    :class="[
      disabled ? 'cursor-not-allowed' : 'cursor-context-menu',
      size === 'sm' && 'shortcut-keys-sm',
    ]"
    style="color: var(--color-2)"
    @dblclick="!disabled && $emit('setShortcut')"
  >
    <span class="kbd" v-if="value && value[0]">{{ format(value[0]) }}</span>
    <span
      class="kbd"
      :key="index"
      v-for="(kbd, index) in value ? value.slice(1) : []"
    >{{ format(kbd) }}</span>
  </span>

  <!-- 编辑状态用遮罩弹窗, 不占列表/标题栏布局 -->
  <Teleport to="#app">
    <div v-if="active" class="shortcut-mask" @click.self="$emit('esc')">
      <div class="shortcut-editor">
        <div class="shortcut-editor-title">设置快捷键</div>
        <div class="shortcut-editor-keys">
          <span v-if="pressed && pressed.length" class="shortcut-keys">
            <span class="kbd" v-for="(kbd, index) in pressed" :key="index">{{ format(kbd) }}</span>
          </span>
          <span v-else class="shortcut-editor-hint">请按下新的快捷键</span>
        </div>
        <div class="shortcut-editor-foot" @click="$emit('esc')">
          按 <span class="kbd">esc</span> 取消
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script lang="ts" setup>

defineProps(["value", "active", "disabled", "pressed", "size"]);
defineEmits(["setShortcut", "esc"]);

const acceleratorMap = {
  shift: "⇧",
  meta: "⌘",
  alt: "⌥",
  ctrl: "⌃",
};

const format = (kbdName: string) => {
  return kbdName.includes("Key")
    ? acceleratorMap[
    kbdName.slice(0, kbdName.length - 3) as keyof typeof acceleratorMap
    ]
    : kbdName.toUpperCase();
};
</script>

<style lang="less" scoped>
/* 快捷键收紧成一组, 不做成大按键盒 */
.shortcut-keys,
.shortcut-editor {
  display: inline-flex;
  align-items: center;
  gap: 0;

  :deep(.kbd) {
    width: auto;
    min-width: 19px;
    height: 19px;
    margin: 0;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 11px;
    line-height: 17px;
    box-shadow: none;
  }
}

/* 组合键连成一个整体: 相邻按键共用一条边, 只在首尾保留圆角 */
.shortcut-keys :deep(.kbd) {
  border-radius: 0;
}

.shortcut-keys :deep(.kbd:not(:first-child)) {
  margin-left: -1px;
}

.shortcut-keys :deep(.kbd:first-child) {
  border-radius: 5px 0 0 5px;
}

.shortcut-keys :deep(.kbd:last-child) {
  border-radius: 0 5px 5px 0;
}

.shortcut-keys :deep(.kbd:only-child) {
  border-radius: 5px;
}

/* ⌘N 小号提示: 不放大, 贴到最右 */
.shortcut-keys-sm {
  margin-left: auto;

  :deep(.kbd) {
    min-width: 16px;
    height: 16px;
    padding: 0 2px;
    font-size: 10px;
    line-height: 14px;
  }

  :deep(.kbd:first-child) {
    border-radius: 4px 0 0 4px;
  }

  :deep(.kbd:last-child) {
    border-radius: 0 4px 4px 0;
  }

  :deep(.kbd:only-child) {
    border-radius: 4px;
  }
}

.shortcut-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(1.5px);
}

.shortcut-editor {
  display: block;
  min-width: 208px;
  padding: 16px 20px 14px;
  border: 1px solid var(--border-1);
  border-radius: 12px;
  background: var(--bg-0);
  box-shadow: 0 16px 40px var(--shadow-0);
  text-align: center;
  color: var(--color-1);
}

.shortcut-editor-title {
  font-size: 12px;
  color: var(--color-2);
}

.shortcut-editor-keys {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  margin: 10px 0 12px;
}

.shortcut-editor-keys .shortcut-keys {
  gap: 0;

  :deep(.kbd) {
    min-width: 22px;
    height: 22px;
    padding: 0 4px;
    font-size: 12px;
    line-height: 20px;
  }
}

.shortcut-editor-hint {
  font-size: 12px;
  color: var(--color-3);
}

.shortcut-editor-foot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-3);
  cursor: pointer;
  transition: color 0.15s ease;
}

.shortcut-editor-foot:hover {
  color: var(--color-1);
}
</style>
