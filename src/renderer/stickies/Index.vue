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
      <div class="h-5 pr-5 flex leading-4 nodragable">
        <div class="cursor-pointer ml-3" @click="generateBlog" :class="{ 'opacity-50': isGenerating }">
          <svg v-if="isGenerating" class="inline-block animate-spin" width="13px" height="13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <svg v-else class="inline-block" width="13px" height="13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
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
let timerHandler: NodeJS.Timeout | null = null;

let data: any;

const showProviderModal = ref(false);
const showModelModal = ref(false);
const providerOptions = ref<{value: string, label: string}[]>([]);
const modelOptions = ref<{value: string, label: string}[]>([]);
let pendingProviderValue: string = '';
let pendingContent: string = '';

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
        useEditor(() => data.value.content, v => data.value.content = v, () => document.getElementById('code-mirror')!)
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

  const content = data?.value?.content;
  if (!content || content.trim() === '') {
    alert('请先在便签中输入内容');
    return;
  }

  const providers = await getConfiguredProviders();
  if (providers.length === 0) {
    alert('请先在设置中配置至少一个AI提供商的API Token');
    return;
  }

  pendingContent = content;

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
    const blogContent = await generateBlogContent(pendingContent, providerValue, modelId);

    const newStickyId = Date.now();
    send('createStickyWithContent', {
      id: newStickyId,
      content: blogContent
    });
  } catch (error: any) {
    alert(error.message || '生成博客失败');
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