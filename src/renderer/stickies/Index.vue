<template>
  <div class="h-full">
    <div class="dragable h-10 w-full flex items-center" :style="{ backgroundColor: bgColor }" @dblclick="fullscreen">
      <div style="backgroundColor: var(--bg-1);"
        class="w-5 h-5 ml-5 hover:w-60 rounded-xl transition-all duration-500 overflow-hidden nodragable cursor-pointer">
        <div class="w-3 h-3 rounded-lg m-1 float-left"
          :style="{ backgroundColor: bgColor }" />
        <div class="w-px h-2.5 float-left ml-2 mr-0.5"
          style="backgroundColor: var(--color-2);margin-top: 5px" />
        <div class="w-3 h-3 rounded-lg ml-2.5 mt-1 cursor-pointer float-left"
          v-for="color in 9" :key="color" style="--tw-ring-color: var(--color-3)"
          :style="`backgroundColor: var(--sticky-${color})`" @click="changeColor(color)" />
      </div>
      <div class="flex-grow flex items-center justify-center gap-1.5 dragable">
        <template v-if="isFileMode">
          <span v-if="!filePath" class="text-xs cursor-pointer opacity-60 hover:opacity-100 nodragable" style="color: var(--color-0)" @click="selectFile">选择文件</span>
          <template v-else>
            <svg class="cursor-pointer opacity-50 hover:opacity-100 nodragable translate-y-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" @click="openFileModeSettings" title="编辑操作设置"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <div class="relative nodragable">
              <span
                class="text-xs cursor-pointer opacity-70 hover:opacity-100 inline-block"
                style="color: var(--color-0)"
                :title="filePath"
                @click="toggleFileList"
              >{{ fileName }}</span>
              <div v-if="showFileList" class="fixed inset-0 z-40" @click="showFileList = false" @contextmenu.prevent="showFileList = false"></div>
              <div v-if="showFileList" class="dropdown-panel file-list-panel">
                <div class="file-list-header">
                  <input
                    ref="fileFilterInputRef"
                    v-model="fileFilter"
                    type="text"
                    placeholder="输入关键字过滤..."
                    @keydown.esc="showFileList = false"
                    @click.stop
                    class="file-filter-input"
                  />
                  <svg class="cursor-pointer opacity-60 hover:opacity-100 flex-shrink-0"
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    @click.stop="selectFile" title="从系统中选择文件">
                    <path d="M4 4h6l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>
                <div class="file-list-body">
                  <div v-if="fileListLoading" class="file-list-empty">加载中...</div>
                  <div v-else-if="filteredFileList.length === 0" class="file-list-empty">无匹配文件</div>
                  <div
                    v-for="file in filteredFileList"
                    :key="file.path"
                    @click.stop="switchToPath(file.path)"
                    class="file-list-item hover-fill"
                    :class="{ active: file.path === filePath }"
                    :title="file.path"
                  >{{ file.name }}</div>
                </div>
              </div>
            </div>
            <template v-for="(op, i) in fileModeOperations" :key="i">
              <span class="text-xs cursor-pointer opacity-50 hover:opacity-100 inline-block px-1.5 py-0 leading-4 rounded nodragable" style="color: var(--color-0); background: var(--bg-2)" @click="executeOperation(op)" :title="op.command">{{ op.name }}</span>
            </template>
          </template>
        </template>
      </div>

      <!-- 右侧操作区 -->
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
          <div v-if="showGenerateMenu" class="dropdown-panel generate-menu">
            <div class="generate-menu-section">
              <button @click="generateOutline" class="menu-btn hover-fill">整理提纲</button>
              <div class="menu-option-list">
                <label class="menu-option hover-fill">
                  <input type="checkbox" v-model="optimizeTitle" />
                  <span>优化吸引人的标题</span>
                </label>
                <label class="menu-option hover-fill">
                  <input type="checkbox" v-model="addDessert" />
                  <span>增加文章甜点</span>
                </label>
              </div>
              <button @click="generateBlog" class="menu-btn-primary">生成 Post</button>
            </div>
          </div>
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div v-if="!isFileMode" class="cursor-pointer ml-3 transition-opacity" :class="{ 'opacity-30': !canToggleFileMode }" :title="!canToggleFileMode ? '仅空便签可切换文件模式' : '文件模式'" @click="toggleFileMode">
          <FileSvg class="inline-block" style="color: var(--color-2)" />
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="cursor-pointer ml-3" @click="togglePin">
          <ArrowupSvg class="inline-block transition-colors" :fill="isPin ? 'var(--theme-0)' : 'var(--color-2)'" />
        </div>
        <div class="cursor-pointer ml-3" @click="toggleTransparent">
          <TransparentSvg class="inline-block transition-colors" :fill="isTransparent ? 'var(--theme-0)' : 'var(--color-2)'" />
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="cursor-pointer ml-3 opacity-60 hover:opacity-100 transition-opacity">
          <TrashSvg @click="deleteSticky" class="inline-block" fill="var(--color-2)" />
        </div>
      </div>
    </div>

    <!-- 编辑器/空状态 -->
    <div v-if="isFileMode && !filePath" class="flex items-center justify-center text-sm" style="height: calc(100% - 3.75rem); color: var(--color-2)" :style="`background: ${bgColor}`">
      <span class="cursor-pointer opacity-60 hover:opacity-100" @click="selectFile">点击选择文件开始编辑</span>
    </div>
    <div v-else id="code-mirror" class="p-2 text-sm" style="height: calc(100% - 3.75rem); color: var(--color-0)"
      :style="`background: ${bgColor}`">
    </div>

    <!-- 底部状态栏: 创建时间与更新时间 -->
    <div class="h-5 px-2 flex items-center justify-between text-[11px] select-none"
      :style="{ backgroundColor: bgColor, color: 'var(--color-2)', opacity: 0.65 }">
      <span>创建于 {{ formatStickyDate(stickyMeta.createdAt) }}</span>
      <span>更新于 {{ formatStickyDateTime(stickyMeta.updatedAt) }}</span>
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
  <!-- Toast -->
  <Toast ref="toastRef" />
  <AlertMessage ref="alertRef" />

  <!-- 参数收集对话框 -->
  <div v-if="paramDialog.visible" class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-title">{{ paramDialog.opName }} - {{ paramDialog.params[paramDialog.currentIndex] }}</div>
      <input v-model="paramDialog.values[paramDialog.currentIndex]" @keydown.enter="onParamSubmit"
        class="param-input" :placeholder="paramDialog.params[paramDialog.currentIndex]" autofocus>
      <div class="modal-actions">
        <button @click="onParamCancel" class="modal-btn modal-btn-cancel">取消</button>
        <button @click="onParamSubmit" class="modal-btn modal-btn-primary">
          {{ paramDialog.currentIndex < paramDialog.params.length - 1 ? '下一步' : '执行' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed, nextTick, shallowRef } from "vue";
import { useUserData, getBg } from "../composition";
import Toast from "../components/Toast.vue";
import AlertMessage from "../components/AlertMessage.vue";
import TrashSvg from "@/assets/svg/trash.svg";
import ArrowupSvg from "@/assets/svg/arrowup.svg";
import TransparentSvg from "@/assets/svg/transparent.svg";
import FileSvg from "@/assets/svg/file.svg";
import { useEditor } from '../composition/editor';
import { generateBlogContent, getConfiguredProviders } from '../utils/aiService';
import SelectModal from '../components/SelectModal.vue';

const getquery = () => {
  const matched = location.href.match(/\?id=([^&]+)&bg=(.+)/);
  return matched ? [matched[1], matched[2]] : [];
};

const { send, onMessage, invoke } = window.apis;
const [id, bg] = getquery();
let bgColor = ref<string>("white");
let isPin = ref<boolean>(false);
let isTransparent = ref<boolean>(false);
let isGenerating = ref<boolean>(false);
let optimizeTitle = ref<boolean>(false);
let addDessert = ref<boolean>(false);
let showGenerateMenu = ref<boolean>(false);
let timerHandler: NodeJS.Timeout | null = null;

let data = shallowRef<any>(null);
let editorView: any = null;

const showProviderModal = ref(false);
const showModelModal = ref(false);
const providerOptions = ref<{value: string, label: string}[]>([]);
const modelOptions = ref<{value: string, label: string}[]>([]);
let pendingProviderValue: string = '';
let pendingContent: string = '';
let isOutlineMode: boolean = false;

const isFileMode = ref(false);
const filePath = ref('');
const fileContent = ref(''); // 文件模式下编辑器的实际内容，与 data.value.content 分离
const fileModeOperations = ref<{ name: string, command: string, params?: string[] }[]>([]);

// 便签的创建/更新时间
const stickyMeta = ref<{ createdAt?: number; updatedAt?: number }>({});
const formatStickyDate = (timestamp?: number) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};
const formatStickyDateTime = (timestamp?: number) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${formatStickyDate(timestamp)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// 文件下拉框状态
const showFileList = ref(false);
const fileList = ref<{ name: string, path: string }[]>([]);
const fileFilter = ref('');
const fileListLoading = ref(false);
const fileFilterInputRef = ref<HTMLInputElement | null>(null);

// 参数收集对话框状态
const paramDialog = ref<{ visible: boolean; opName: string; params: string[]; values: string[]; currentIndex: number; command: string }>({
  visible: false, opName: '', params: [], values: [], currentIndex: 0, command: ''
});

const fileName = computed(() => {
  if (!filePath.value) return '';
  const parts = filePath.value.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || '';
});

const filteredFileList = computed(() => {
  const keyword = fileFilter.value.trim().toLowerCase();
  if (!keyword) return fileList.value;
  return fileList.value.filter(f => f.name.toLowerCase().includes(keyword));
});

const openFileModeSettings = async () => {
  if (filePath.value) {
    const dirPath = filePath.value.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
    await invoke('ensureFilePathInSettings', dirPath);
  }
  send('openSettingsWindow');
};

const executeOperation = async (op: { name: string, command: string, params?: string[] }) => {
  const params = (op.params || []).filter(p => p.trim());
  if (params.length === 0) {
    doExecute(op.command, op.name);
    return;
  }
  paramDialog.value = { visible: true, opName: op.name, params, values: new Array(params.length).fill(''), currentIndex: 0, command: op.command };
};

const onParamSubmit = () => {
  const d = paramDialog.value;
  if (d.currentIndex < d.params.length - 1) {
    d.currentIndex++;
  } else {
    // 所有参数收集完毕，替换 $1, $2, $3...
    let cmd = d.command;
    d.values.forEach((v, i) => {
      cmd = cmd.replace(new RegExp('\\$' + (i + 1), 'g'), v);
    });
    paramDialog.value.visible = false;
    doExecute(cmd, d.opName);
  }
};

const onParamCancel = () => {
  paramDialog.value.visible = false;
};

const doExecute = async (command: string, opName: string) => {
  try {
    const result = await invoke('executeFileModeCommand', command, filePath.value) as any;
    const output = (result.stdout || '').trim() || (result.stderr || '').trim() || '执行完成';
    toastRef.value?.show(`${opName}: ${output}`);
  } catch (err: any) {
    console.error(`执行操作"${opName}"失败:`, err);
    let errMsg = String(err.message || err);
    try { const parsed = JSON.parse(errMsg); errMsg = [parsed.error, parsed.stderr].filter(Boolean).join('\n'); } catch {}
    toastRef.value?.show(`${opName} 失败:\n${errMsg}`, 'error');
  }
};

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const alertRef = ref<InstanceType<typeof AlertMessage> | null>(null);

const canToggleFileMode = computed(() => {
  if (isFileMode.value) return true;
  if (!data.value) return false;
  const content = data.value.value?.content || '';
  return !content || content.trim() === '' || isFileContent(content);
});

const FILE_PREFIX = '[file]';

const isFileContent = (content: string): boolean => {
  return content.startsWith(FILE_PREFIX);
};

const extractFilePath = (content: string): string => {
  if (!isFileContent(content)) return '';
  return content.slice(FILE_PREFIX.length);
};

const formatFileContent = (path: string): string => {
  return `${FILE_PREFIX}${path}`;
};

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

const saveToFile = () => {
  if (!isFileMode.value || !filePath.value) return;
  invoke('writeFileContent', filePath.value, fileContent.value).catch((err: any) => {
    console.error('保存文件失败:', err);
  });
};

const initEditor = () => {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
  const dom = document.getElementById('code-mirror');
  if (!dom) return;

  if (isFileMode.value && !filePath.value) {
    // 文件模式下未选文件，不初始化编辑器
    return;
  }

  if (isFileMode.value && filePath.value) {
    invoke('readFileContent', filePath.value).then((content: string) => {
      fileContent.value = content;
      editorView = useEditor(() => fileContent.value, (v: string) => {
        fileContent.value = v;
        saveToFile();
      }, () => document.getElementById('code-mirror')!);
    }).catch((err: any) => {
      console.error('读取文件失败:', err);
      fileContent.value = `读取文件失败: ${err.message}`;
      editorView = useEditor(() => fileContent.value, (v: string) => {
        fileContent.value = v;
      }, () => document.getElementById('code-mirror')!);
    });
  } else {
    const initialContent = data.value?.value?.content || '';
    editorView = useEditor(() => initialContent, (v: string) => {
      data.value.value.content = v;
      if (timerHandler) clearTimeout(timerHandler);
      timerHandler = setTimeout(send, v ? 350 : 0, "setStickyTitle", {
        key: id,
        val: v,
      });
    }, () => dom);
  }
};

const loadFileModeOperations = async () => {
  try {
    const paths = await invoke('getFileModeSettings');
    const dirPath = filePath.value.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
    if (dirPath && paths[dirPath]) {
      fileModeOperations.value = paths[dirPath].filter((op: any) => op.name && op.command);
    } else {
      fileModeOperations.value = [];
    }
  } catch (e) {
    console.error('加载文件模式操作失败:', e);
  }
};

const toggleFileMode = async () => {
  if (!canToggleFileMode.value) return;
  isFileMode.value = !isFileMode.value;
  send("resizeStickyForFileMode", isFileMode.value);

  if (isFileMode.value) {
    loadFileModeOperations();
    if (filePath.value) {
      initEditor();
    }
    // 没有filePath时不初始化编辑器，等待用户选择文件
  } else {
    exitFileMode();
  }
};

const selectFile = async () => {
  try {
    const selectedPath = await invoke('showOpenFileDialog', {
      title: '选择要关联的文件'
    });
    if (selectedPath) {
      await switchToPath(selectedPath);
    }
    // 取消选择时不退出文件模式，保持等待状态
  } catch (error: any) {
    console.error('选择文件失败:', error);
  }
};

const switchToPath = async (selectedPath: string) => {
  showFileList.value = false;
  if (!selectedPath || selectedPath === filePath.value) return;
  // 检查是否已有 sticky 关联了该文件
  const existingStickyId = await invoke('findStickyByFilePath', selectedPath);
  if (existingStickyId && String(existingStickyId) !== String(id)) {
    // 已有其他 sticky 关联该文件，打开/聚焦它，并退出当前文件模式
    send("openSticky", existingStickyId);
    exitFileMode();
    return;
  }
  filePath.value = selectedPath;
  // JSON 中保存占位符，不触碰原文件
  data.value.value.content = formatFileContent(selectedPath);
  // 更新首页标题为占位符格式，以便首页识别文件模式
  send("setStickyTitle", { key: id, val: formatFileContent(selectedPath) });
  // 等待 Vue 重新渲染 DOM（filePath 变化导致 v-if 切换，code-mirror div 才会出现）
  await nextTick();
  initEditor();
  // 切换文件后刷新文件操作与下拉框列表（目录可能变化）
  loadFileModeOperations();
  loadFileList();
};

const loadFileList = async () => {
  if (!filePath.value) {
    fileList.value = [];
    return;
  }
  const dirPath = filePath.value.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
  if (!dirPath) {
    fileList.value = [];
    return;
  }
  fileListLoading.value = true;
  try {
    fileList.value = await invoke('listFilesInDir', dirPath);
  } catch (e: any) {
    console.error('加载文件列表失败:', e);
    fileList.value = [];
  } finally {
    fileListLoading.value = false;
  }
};

const toggleFileList = async () => {
  if (showFileList.value) {
    showFileList.value = false;
    return;
  }
  fileFilter.value = '';
  await loadFileList();
  showFileList.value = true;
  await nextTick();
  fileFilterInputRef.value?.focus();
};

const exitFileMode = () => {
  isFileMode.value = false;
  filePath.value = '';
  fileContent.value = '';
  if (data.value?.value && isFileContent(data.value.value.content)) {
    data.value.value.content = '';
    send("setStickyTitle", { key: id, val: '' });
  }
  initEditor();
};

onMounted(() => {
  if (id) {
    bgColor.value = getBg(bg);
    data.value = useUserData(
      "sticky" + id,
      { content: "" },
      (val: any) => {
        // 文件模式下 data.value.content 只是占位符，不需要额外操作
        // 文件保存由编辑器 onchange → saveToFile 直接处理
        if (!isFileMode.value && !isFileContent(val.content)) {
          if (timerHandler) clearTimeout(timerHandler);
          timerHandler = setTimeout(send, val.content ? 350 : 0, "setStickyTitle", {
            key: id,
            val: val.content,
          });
        }
      },
      () => {
        const savedContent = data.value.value.content || '';
        if (isFileContent(savedContent)) {
          isFileMode.value = true;
          filePath.value = extractFilePath(savedContent);
          loadFileModeOperations();
        }
        initEditor();
      }
    );
  }

  onMessage(({ type, value }: any) => {
    if (type === "changebg") {
      bgColor.value = getBg(value);
    }
    if (type === "stickyMetaChange") {
      stickyMeta.value = value;
    }
    if (type === "stickyContentChanged" && String(value?.id) === String(id)) {
      // MCP 等外部来源改写内容后, 刷新编辑器
      data.value.value.content = value.content;
      initEditor();
    }
  });

  // 拉取创建/更新时间
  if (id) {
    invoke('getStickyMeta', id).then((meta: any) => {
      if (meta) stickyMeta.value = meta;
    }).catch(() => { });
  }

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

  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
});

const deleteSticky = () => {
  send("deleteSticky", id);
};
const changeColor = (color: number) => {
  send("changeStickyColor", {
    stickyId: id,
    color: color.toString(),
  });
};
const fullscreen = (event: MouseEvent) => {
  // 双击发生在可交互元素(.nodragable)上时不触发最大化
  const target = event.target as HTMLElement | null;
  if (target?.closest('.nodragable')) return;
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
    content = selectedText.trim() || (isFileMode.value ? fileContent.value : data.value?.value?.content);
  } else {
    content = isFileMode.value ? fileContent.value : data.value?.value?.content;
  }

  if (!content || content.trim() === '') {
    alertRef.value?.show('请先在便签中输入内容或选中文本', 'warning');
    return;
  }

  const providers = await getConfiguredProviders();
  if (providers.length === 0) {
    alertRef.value?.show('请先在设置中配置至少一个AI提供商的API Token', 'warning');
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
    content = selectedText.trim() || (isFileMode.value ? fileContent.value : data.value?.value?.content);
  } else {
    content = isFileMode.value ? fileContent.value : data.value?.value?.content;
  }

  if (!content || content.trim() === '') {
    alertRef.value?.show('请先在便签中输入内容或选中文本', 'warning');
    return;
  }

  const providers = await getConfiguredProviders();
  if (providers.length === 0) {
    alertRef.value?.show('请先在设置中配置至少一个AI提供商的API Token', 'warning');
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
    alertRef.value?.show(error.message || (isOutlineMode ? '整理提纲失败' : '生成博客失败'), 'error');
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style lang="less" scoped>
/* ========== 下拉面板 ========== */
.dropdown-panel {
  position: absolute;
  top: 1.5rem;
  right: 0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px var(--shadow-0), 0 4px 6px -4px var(--shadow-1);
  background: var(--bg-1);
  border: 1px solid var(--border-1);
  z-index: 50;
}

/* 文件列表下拉 */
.file-list-panel {
  left: -0.5rem;
  width: 16rem;
  right: auto;
}

.file-list-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem;
  border-bottom: 1px solid var(--border-0);
}

.file-filter-input {
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  background: var(--bg-0);
  color: var(--color-1);
  border: 1px solid var(--border-1);
  outline: none;
}

.file-list-body {
  max-height: 15rem;
  overflow-y: auto;
  padding: 0.25rem;
}

.file-list-empty {
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem;
  opacity: 0.6;
  color: var(--color-2);
}

.file-list-item {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-1);
  --hover-fill: var(--bg-3);

  &.active {
    color: var(--theme-0);
    background: var(--bg-2);
  }
}

/* 生成菜单下拉 */
.generate-menu {
  top: 1.5rem;
  right: 0;
  width: 14rem;
  padding: 0.75rem;
}

.generate-menu-section {
  border-bottom: 1px solid var(--border-0);
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}

.menu-btn {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-1);
  background: transparent;
  border: none;
  cursor: pointer;
  --hover-fill: var(--bg-3);
}

.menu-option-list {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-option {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: var(--color-1);
  --hover-fill: var(--bg-3);

  input[type="checkbox"] {
    margin-right: 0.5rem;
  }
}

.menu-btn-primary {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background: var(--theme-0);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
}

/* ========== 模态框 ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.modal-dialog {
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px var(--shadow-0);
  padding: 1rem;
  width: 18rem;
  background: var(--bg-1);
  border: 1px solid var(--border-1);
}

.modal-title {
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--color-1);
}

.param-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-1);
  font-size: 0.75rem;
  outline: none;
  margin-bottom: 0.75rem;
  background: var(--bg-0);
  color: var(--color-1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-btn {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  background: transparent;
  transition: opacity 0.15s ease;

  &.modal-btn-cancel {
    color: var(--color-2);
  }

  &.modal-btn-primary {
    color: var(--theme-0);
    background: var(--theme-5);
  }

  &:hover {
    opacity: 0.85;
  }
}
</style>
