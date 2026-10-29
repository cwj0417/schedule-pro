<template>
  <div class="wrap detail-page">
    <div class="page-title">
      <div class="back-home" @click="goHome">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>schedule pro</span>
      </div>
      <div class="page-name">便签</div>
      <div class="title-actions">
        <div class="title-drag"></div>
        <button class="sticky-add hover-fill" style="--hover-fill: var(--theme-5);" @click="createSticky">
          新建便签
        </button>
        <keyboard class="shortcut-mini" :disabled="true" :value="['metaKey', 'n']" />
      </div>
    </div>
    <div class="page-body">
      <div class="sticky-scroll">
        <empty v-if="!stickies.length" />
        <div class="sticky-grid">
          <div v-for="sticky in stickies" :key="sticky.id" class="sticky-card"
            :class="`is-${stickyState(sticky)}`" :style="{ background: stickyBg(sticky) }"
            @click="openSticky(sticky.id)">
            <div class="sticky-card-head">
              <span class="sticky-card-time">{{ formatRelativeTime(sticky.updatedAt || sticky.createdAt || +sticky.id) }}</span>
              <button class="sticky-card-delete" title="删除便签" @click.stop="askDelete(sticky)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
            <div v-if="isFileSticky(sticky)" class="sticky-card-body file-body">
              <span class="file-badge">文件便签</span>
              <span class="file-name">{{ getFileNameFromSticky(sticky) }}</span>
              <span class="file-path">{{ extractFilePathFromTitle(sticky) }}</span>
            </div>
            <div v-else-if="sticky.content && sticky.content.trim()" class="sticky-card-body">{{ sticky.content }}</div>
            <div v-else class="sticky-card-body sticky-empty">空便签</div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmModal ref="confirmRef" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import empty from "../components/empty.vue";
import keyboard from "../components/keyboards.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import { getBg } from "../composition";
import { formatRelativeTime } from "../utils/time";

const { send, invoke, onMessage } = window.apis;

const router = useRouter();
const goHome = () => router.replace("/home");

const stickies = ref<any[]>([]);
const activeStickyId = ref<number | null>(null);
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null);

const FILE_PREFIX = "[file]";

const stickyBg = (sticky: any) => getBg(sticky?.backgroundColor || "9");

// 便签方块的三种状态: 未打开 / 打开(窗口在后台) / 激活(窗口正在使用)
const stickyState = (sticky: any): "closed" | "open" | "active" => {
  if (!sticky?.expended) return "closed";
  return activeStickyId.value === null ? "open" : +activeStickyId.value === +sticky.id ? "active" : "open";
};

const isFileSticky = (sticky: any): boolean =>
  String(sticky?.title || "").startsWith(FILE_PREFIX);

const extractFilePathFromTitle = (sticky: any): string =>
  isFileSticky(sticky) ? sticky.title.slice(FILE_PREFIX.length) : "";

const getFileNameFromSticky = (sticky: any): string => {
  const path = extractFilePathFromTitle(sticky);
  if (!path) return "文件便签";
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || "文件便签";
};

const load = async () => {
  const value = await invoke("getStickiesWithContent");
  if (Array.isArray(value)) stickies.value = value;
};

const openSticky = (id: number) => send("openSticky", id);

const createSticky = () => send("createSticky");

const askDelete = async (sticky: any) => {
  const confirmed = await confirmRef.value?.show({
    title: "删除便签",
    message: "删除后将丢失便签内容，且无法恢复。",
    confirmText: "删除",
    danger: true,
  });
  if (!confirmed) return;
  await invoke("deleteStickyById", sticky.id);
  await load();
};

onMounted(() => {
  load();
  onMessage(({ type, value }: any) => {
    if (type === "stickesConfigChange") load();
    if (type === "activesticky") {
      activeStickyId.value = value === null || value === undefined ? null : +value;
    }
  });
});
</script>
<style lang="less" scoped>
.title-actions {
  justify-self: stretch;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  .title-drag {
    flex: 1;
  }

  .sticky-add {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 7px;
    border: 1px solid var(--border-1);
    background: var(--bg-2);
    color: var(--color-1);
    font-size: 12px;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;

    &:hover {
      color: var(--theme-0);
      border-color: var(--theme-0);
    }
  }
}

.sticky-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  // 给卡片的 hover 阴影留出空间, 避免被滚动容器裁掉
  margin: 0 -6px;
  padding: 2px 6px 8px;
}

.sticky-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 220px);
  align-content: start;
  gap: 12px;
  padding-bottom: 4px;
}

.sticky-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 220px;
  height: 220px;
  padding: 8px 10px 10px;
  border-radius: 10px;
  color: var(--color-0);
  cursor: pointer;
  box-shadow: 0 1px 2px var(--shadow-1);
  transition: box-shadow 0.18s ease, opacity 0.18s ease;

  // 未打开: 轻微透明
  &.is-closed {
    opacity: 0.85;
  }

  &:hover {
    opacity: 1;
    box-shadow: 0 6px 16px var(--shadow-0);
  }

  // 窗口已打开但在后台: 细描边
  &.is-open {
    box-shadow: inset 0 0 0 2px var(--theme-2), 0 3px 10px var(--shadow-1);
  }

  // 便签窗口正在使用: 更粗的主题色描边 + 更强阴影
  &.is-active {
    box-shadow: inset 0 0 0 3px var(--theme-0), 0 10px 22px var(--shadow-0);
  }
}

.sticky-card-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 20px;

  .sticky-card-time {
    font-size: 10px;
    color: var(--color-0);
    opacity: 0.6;
    white-space: nowrap;
  }

  .sticky-card-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid var(--border-1);
    border-radius: 50%;
    background: var(--bg-1);
    color: var(--color-2);
    cursor: pointer;
    opacity: 0.8;
    transition: color 0.15s ease, opacity 0.15s ease;

    &:hover {
      color: var(--error-0);
      opacity: 1;
    }
  }
}

.sticky-card-body {
  flex: 1;
  min-height: 0;
  margin-top: 4px;
  padding-right: 2px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-0);
}

.sticky-empty {
  color: var(--color-2);
}

.file-body {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .file-badge {
    align-self: flex-start;
    padding: 0 5px;
    border-radius: 4px;
    font-size: 10px;
    line-height: 16px;
    background: var(--bg-1);
    color: var(--color-2);
  }

  .file-name {
    font-weight: 600;
    color: var(--color-0);
  }

  .file-path {
    font-size: 11px;
    color: var(--color-2);
  }
}
</style>
