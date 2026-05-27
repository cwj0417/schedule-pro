<template>
  <div class="h-full">
    <div class="dragable h-10 w-full flex items-center" :style="{ backgroundColor: bgColor }" @dblclick="fullscreen">
      <div style="backgroundColor: var(--bg-1);"
        class="w-5 h-5 ml-5 hover:w-60 rounded-xl transition-all duration-500 overflow-hidden nodragable shadow-sm shadow-gray-400">
        <div class="w-3 h-3 rounded-lg m-1 float-left shadow-sm shadow-gray-400"
          :style="{ backgroundColor: bgColor }" />
        <div class="w-px h-2.5 float-left ml-2 mr-0.5 shadow-sm shadow-gray-400"
          style="backgroundColor: var(--color-2);margin-top: 5px" />
        <div class="w-3 h-3 rounded-lg ml-2.5 mt-1 cursor-pointer float-left shadow-sm shadow-gray-400"
          v-for="color in 9" :key="color" style="--tw-ring-color: var(--color-3)"
          :style="`backgroundColor: var(--sticky-${color})`" @click="changeColor(color)" />
      </div>
      <div class="flex-grow"></div>
      <div class="h-5 pr-5 flex leading-4 nodragable items-center">
        <div class="relative">
          <div class="cursor-pointer ml-3" @click="showGenerateMenu = !showGenerateMenu" :class="{ 'opacity-50': isGenerating }">
            <svg v-if="isGenerating" class="inline-block animate-spin" width="13px" height="13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <svg v-else class="inline-block" width="13px" height="13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div v-if="showGenerateMenu" class="absolute top-6 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 w-56">
            <div class="mb-3 pb-2 border-b border-gray-200">
              <button
                @click="generateOutline"
                class="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                :disabled="isGenerating"
              >
                整理提纲
              </button>
              <div class="mt-2 space-y-2">
                <label class="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input type="checkbox" v-model="optimizeTitle" class="mr-2" />
                  <span>优化吸引人的标题</span>
                </label>
                <label class="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input type="checkbox" v-model="addDessert" class="mr-2" />
                  <span>增加文章甜点</span>
                </label>
              </div>
              <button
                @click="generateBlog"
                class="w-full mt-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                :disabled="isGenerating"
              >
                生成 Post
              </button>
            </div>
          </div>
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="cursor-pointer ml-3" @click="togglePin">
          <ArrowupSvg class="inline-block" :fill="isPin ? '#333333' : '#999999'" />
        </div>
        <div class="cursor-pointer ml-3" @click="toggleTransparent">
          <TransparentSvg class="inline-block" :fill="isTransparent ? '#333333' : '#999999'" />
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="cursor-pointer ml-3">
          <TrashSvg @click="deleteSticky" class="inline-block" fill="#333333" />
        </div>
      </div>
    </div>
    <div id="code-mirror" class="p-2 text-sm" style="height: calc(100% - 2.5rem); color: var(--color-0)"
      :style="`background: ${bgColor}`">
    </div>
  </div>
  <SelectModal
    :visible="showProviderModal"
    title="选择AI提供商"
    :options="providerOptions"
    @confirm="onProviderConfirm"
    @cancel="onProviderCancel"
  />
  <SelectModal
    :visible="showModelModal"
    title="选择具体模型"
    :options="modelOptions"
    @confirm="onModelConfirm"
    @cancel="onModelCancel"
  />
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useUserData, getBg } from "../composition";
import TrashSvg from "@/assets/svg/trash.svg";
import ArrowupSvg from "@/assets/svg/arrowup.svg";
import TransparentSvg from "@/assets/svg/transparent.svg";
import { useEditor } from '../composition/editor';
import { generateBlogContent, getConfiguredProviders, ConfiguredProvider } from '../utils/aiService';
import SelectModal from '../components/SelectModal.vue';

const getquery = () => {
  const matched = location.href.match(/\?id=([^&]+)&bg=(.+)/);
  return matched ? [matched[1], matched[2]] : [];
};

const { send, onMessage } = window.apis;
const [id, bg] = getquery();
let bgColor = ref<string>("white");
let isPin = ref<boolean>(false);
let isTransparent = ref<boolean>(false);
let isGenerating = ref<boolean>(false);
let optimizeTitle = ref<boolean>(false);
let addDessert = ref<boolean>(false);
let showGenerateMenu = ref<boolean>(false);
let timerHandler: NodeJS.Timeout | null = null;

let data: any;

const showProviderModal = ref(false);
const showModelModal = ref(false);
const providerOptions = ref<{value: string, label: string}[]>([]);
const modelOptions = ref<{value: string, label: string}[]>([]);
let pendingProviderValue: string = '';
let pendingContent: string = '';
let isOutlineMode: boolean = false;
let editorView: any = null;

const clickThoughMouseEnter = () => {
  if (isTransparent.value) {
    send("set-ignore-mouse-events", false);
  }
};

const clickThoughMouseLeave = () => {
  if (isTransparent.value) {
    send("set-ignore-mouse-events", true, {
      forward: true,
    });
  }
};

onMounted(() => {
  if (id) {
    bgColor.value = getBg(bg);
    data = useUserData(
      "sticky" + id,
      {
        content: "",
      },
      (val: any) => {
        if (timerHandler) clearTimeout(timerHandler);
        timerHandler = setTimeout(send, val.content ? 350 : 0, "setStickyTitle", {
          key: id,
          val: val.content,
        });
      },
      () => {
        editorView = useEditor(() => data.value.content, v => data.value.content = v, () => document.getElementById('code-mirror')!)
      }
    );
  }
  onMessage(({ type, value }: any) => {
    if (type === "changebg") {
      bgColor.value = getBg(value);
    }
  });
  document
    .getElementsByClassName("dragable")[0]
    .addEventListener("mouseenter", clickThoughMouseEnter);
  document
    .getElementsByClassName("dragable")[0]
    .addEventListener("mouseleave", clickThoughMouseLeave);
});

onUnmounted(() => {
  document
    .getElementsByClassName("dragable")[0]
    .removeEventListener("mouseenter", clickThoughMouseEnter);
  document
    .getElementsByClassName("dragable")[0]
    .removeEventListener("mouseleave", clickThoughMouseLeave);
});

// const retract = () => {
//   send("retractSticky", id);
// };
const deleteSticky = () => {
  send("deleteSticky", id);
};
const changeColor = (color: number) => {
  send("changeStickyColor", {
    stickyId: id,
    color: color.toString(),
  });
};
const fullscreen = () => {
  send("toggleFullscreen");
  isPin.value = false;
  send("setTransparent", false);
  isTransparent.value = false;
};
const toggleTransparent = () => {
  send("setTransparent", !isTransparent.value);
  isTransparent.value = !isTransparent.value;
};
const togglePin = () => {
  send("setPin", !isPin.value);
  isPin.value = !isPin.value;
};

const generateBlog = async () => {
  if (isGenerating.value) return;
  showGenerateMenu.value = false;

  let content = '';
  if (editorView) {
    const selection = editorView.state.selection.main;
    const selectedText = editorView.state.doc.sliceString(selection.from, selection.to);
    content = selectedText.trim() || data?.value?.content;
  } else {
    content = data?.value?.content;
  }

  if (!content || content.trim() === '') {
    alert('请先在便签中输入内容或选中文本');
    return;
  }

  const providers = await getConfiguredProviders();
  if (providers.length === 0) {
    alert('请先在设置中配置至少一个AI提供商的API Token');
    return;
  }

  pendingContent = content;
  isOutlineMode = false;

  if (providers.length === 1) {
      pendingProviderValue = providers[0].value;
      modelOptions.value = providers[0].models.map((m: any) => ({
        value: m.id,
        label: `${m.name} (${providers[0].label})`
      }));
    showModelModal.value = true;
  } else {
    providerOptions.value = providers.map(p => ({ value: p.value, label: p.label }));
    showProviderModal.value = true;
  }
};

const generateOutline = async () => {
  if (isGenerating.value) return;
  showGenerateMenu.value = false;

  let content = '';
  if (editorView) {
    const selection = editorView.state.selection.main;
    const selectedText = editorView.state.doc.sliceString(selection.from, selection.to);
    content = selectedText.trim() || data?.value?.content;
  } else {
    content = data?.value?.content;
  }

  if (!content || content.trim() === '') {
    alert('请先在便签中输入内容或选中文本');
    return;
  }

  const providers = await getConfiguredProviders();
  if (providers.length === 0) {
    alert('请先在设置中配置至少一个AI提供商的API Token');
    return;
  }

  pendingContent = content;
  isOutlineMode = true;

  if (providers.length === 1) {
      pendingProviderValue = providers[0].value;
      modelOptions.value = providers[0].models.map((m: any) => ({
        value: m.id,
        label: `${m.name} (${providers[0].label})`
      }));
    showModelModal.value = true;
  } else {
    providerOptions.value = providers.map(p => ({ value: p.value, label: p.label }));
    showProviderModal.value = true;
  }
};

const onProviderConfirm = (value: string) => {
  showProviderModal.value = false;
  pendingProviderValue = value;

  const providers = providerOptions.value;
  const selectedProvider = providers.find(p => p.value === value);
  if (!selectedProvider) return;

  getConfiguredProviders().then(providerList => {
    const fullProvider = providerList.find(p => p.value === value);
    if (fullProvider && fullProvider.models.length > 1) {
      modelOptions.value = fullProvider.models.map((m: any) => ({
        value: m.id,
        label: `${m.name} (${fullProvider.label})`
      }));
      showModelModal.value = true;
    } else if (fullProvider) {
      doGenerateBlog(fullProvider.value, fullProvider.models[0]?.id);
    }
  });
};

const onProviderCancel = () => {
  showProviderModal.value = false;
};

const onModelConfirm = (value: string) => {
  showModelModal.value = false;
  doGenerateBlog(pendingProviderValue, value);
};

const onModelCancel = () => {
  showModelModal.value = false;
};

const doGenerateBlog = async (providerValue: string, modelId: string) => {
  if (!pendingContent || !providerValue || !modelId) return;

  isGenerating.value = true;

  try {
    const options = isOutlineMode
      ? { isOutline: true }
      : { optimizeTitle: optimizeTitle.value, addDessert: addDessert.value };

    const blogContent = await generateBlogContent(pendingContent, providerValue, modelId, options);

    const newStickyId = Date.now();
    send('createStickyWithContent', {
      id: newStickyId,
      content: blogContent
    });
  } catch (error: any) {
    alert(error.message || (isOutlineMode ? '整理提纲失败' : '生成博客失败'));
  } finally {
    isGenerating.value = false;
  }
};
</script>
<style lang="less">
.non-border {
  border: 0;
  resize: none;
  background: transparent;

  &:focus {
    outline: none;
  }
}
</style>