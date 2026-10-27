<template>
  <empty v-if="!searchSticky(stickies).length" />
  <draggable :disabled="search" v-else :modelValue="searchSticky(stickies)" @update:modelValue="sortSticky($event)"
    item-key="id" tag="div">
    <template #item="{ element: sticky }">
      <div @click="openSticky(sticky?.id)"
        class="sticky-row hover-fill group h-10 leading-10 pl-3 pr-9 flex items-center cursor-pointer whitespace-nowrap break-all overflow-hidden relative transition-all duration-200 active:opacity-80"
        :style="{
          background: sticky?.expended ? +activeKey === +sticky.id ? getBg(sticky?.backgroundColor) : `linear-gradient(270deg,var(--bg-1),${getBg(sticky?.backgroundColor)})` : '',
          transform: sticky.id === findKey ? 'rotate3d(1, 10, 1, -25deg)' : ''
        }">
        <!-- 左侧便签色条 -->
        <span class="sticky-bar absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 rounded-full opacity-0"
          :style="{ background: getBg(sticky?.backgroundColor) }"></span>
        <!-- 标题区域, hover 时右侧收窄, 把位置让给更新时间 -->
        <div class="sticky-title flex-1 min-w-0 h-full overflow-hidden whitespace-nowrap">
          <template v-if="isFileSticky(sticky)">
            <FileSvg class="sticky-file-icon inline-block mr-1.5 align-middle flex-shrink-0 transition-colors" width="14"
              height="14" style="color: var(--color-2)" />
            <span class="inline-block truncate align-middle" style="max-width: calc(100% - 24px)">
              <search-result :value="getFileNameFromSticky(sticky)" :search="search" />
            </span>
          </template>
          <template v-else>
            <search-result :value="sticky?.title || '未命名便签'" :search="search" />
          </template>
        </div>
        <span v-if="sticky.fromMcp" class="mcp-tag" title="由 MCP 创建">MCP</span>
        <!-- 更新时间: hover 时在最右侧展开, 位于置顶按钮左侧 -->
        <span class="sticky-time flex-shrink-0 h-full leading-10 text-xs whitespace-nowrap pointer-events-none"
          style="color: var(--color-2)">
          {{ formatRelativeTime(sticky?.updatedAt || sticky?.createdAt || +sticky?.id) }}
        </span>
        <!-- 便签颜色圆点, hover 时缩隐, 让出位置给置顶按钮 -->
        <div class="sticky-dot w-2 h-2 rounded-full absolute top-4 right-3"
          :style="{ background: getBg(sticky?.backgroundColor) }"></div>
        <ArrowUpSvg @click.prevent.stop="toTop(sticky?.id)" style="fill: var(--color-0);"
          class="sticky-top absolute top-3 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-3)]" />
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
import FileSvg from "@/assets/svg/file.svg";
import { getBg } from "../composition";
import { formatRelativeTime } from "../utils/time";

const props = defineProps(['search']);

const FILE_PREFIX = '[file]';

const isFileSticky = (sticky: any): boolean => {
  if (!sticky) return false;
  const title = sticky.title || '';
  return title.startsWith(FILE_PREFIX);
};

const extractFilePathFromTitle = (sticky: any): string => {
  const title = sticky?.title || '';
  if (!isFileSticky(sticky)) return '';
  return title.slice(FILE_PREFIX.length);
};

const getFileNameFromSticky = (sticky: any): string => {
  const path = extractFilePathFromTitle(sticky);
  if (!path) return '文件便签';
  const parts = path.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || '文件便签';
};

const { send, onMessage } = window.apis;
const stickies = ref<any[]>([]);
const activeKey = ref<any>(0);
const isFinding = ref<boolean>(false);
const findKey = ref<number | boolean>(false);

onMounted(() => {
  onMessage(({ type, value }: any) => {
    if (type === "stickesConfigChange") {
      stickies.value = value;
      value.forEach((s: any) => {
        console.log('[DEBUG sticky]', s.id, 'title:', JSON.stringify(s.title), 'isFile:', s.title?.startsWith('[file]'))
      });
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

<style lang="less" scoped>
.sticky-row {
  color: var(--color-1);
}

/* 行间细分隔线, 左右随行内缩 */
.sticky-row + .sticky-row {
  border-top: 1px solid var(--border-0);
}

/* hover 底色由 .hover-fill 从鼠标位置展开 */
.sticky-row:hover {
  color: var(--color-0);
}

/* 左侧色条由中心展开 */
.sticky-row:hover .sticky-bar {
  height: 20px;
  opacity: 1;
}

/* 颜色圆点缩隐, 让位给置顶按钮 */
.sticky-row:hover .sticky-dot {
  opacity: 0;
  transform: scale(0.4);
}

.sticky-row:hover .sticky-file-icon {
  color: var(--color-1);
}

/* 更新时间: 平时收起, hover 时按文字实际宽度展开, 左右间距与文字上下留白一致(约 12px) */
.sticky-time {
  max-width: 0;
  margin-left: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-width 0.2s ease, margin-left 0.2s ease, opacity 0.2s ease;
}

.sticky-row:hover .sticky-time {
  max-width: 6rem;
  margin-left: 0.75rem;
  opacity: 1;
}

.sticky-bar,
.sticky-dot,
.sticky-top,
.sticky-file-icon {
  transition: all 0.2s ease;
}
</style>
