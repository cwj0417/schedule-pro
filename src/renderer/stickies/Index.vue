<template>
  <div class="h-full relative">
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
        <span v-if="stickyMeta.fromMcp" class="mcp-tag" title="由 MCP 创建">MCP</span>
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
              <div class="menu-group-label">交给 Agent</div>
              <button @click="openAgentPrompt" class="menu-btn hover-fill">自定义 Prompt…</button>
              <button @click="handOffToAgent('blog')" class="menu-btn hover-fill">扩写成博客</button>
              <button @click="handOffToAgent('file')" class="menu-btn hover-fill">创建成博客文件</button>
            </div>
          </div>
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div v-if="!isFileMode" class="cursor-pointer ml-3 transition-opacity" :class="{ 'opacity-30': !canToggleFileMode }" :title="!canToggleFileMode ? '仅空便签可切换文件模式' : '文件模式'" @click="toggleFileMode">
          <FileSvg class="inline-block" style="color: var(--color-2)" />
        </div>
        <div class="w-px h-2.5 float-left ml-3" style="backgroundColor: var(--bg-2);margin-top: 5px" />
        <div class="cursor-pointer ml-3" :title="wordWrap ? '关闭自动换行' : '开启自动换行'" @click="toggleWordWrap">
          <svg class="inline-block transition-colors" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="{ color: wordWrap ? 'var(--theme-0)' : 'var(--color-2)' }">
            <path d="M3 6h18" />
            <path d="M3 12h15a3 3 0 1 1 0 6h-4" />
            <path d="M16 16l-2 2 2 2" />
            <path d="M3 18h7" />
          </svg>
        </div>
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

    <!-- Agent 执行进度 -->
    <div v-if="agentProgress" class="agent-progress nodragable" :class="`is-${agentProgress.phase}`">
      <div class="agent-progress-row">
        <svg v-if="agentProgress.phase === 'running'" class="agent-progress-spinner" width="12" height="12"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <svg v-else-if="agentProgress.phase === 'done'" width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span class="agent-progress-title">{{ agentProgress.title }}</span>
        <span class="agent-progress-elapsed">{{ agentElapsedText }}</span>
        <button v-if="agentProgress.phase === 'running'" class="agent-progress-cancel" @click="cancelAgent">取消</button>
      </div>
      <div v-if="agentDetailText" class="agent-progress-detail">{{ agentDetailText }}</div>
      <div v-if="agentProgress.lines && agentProgress.lines.length" class="agent-progress-log">
        <div v-for="(line, index) in agentProgress.lines" :key="index" class="agent-progress-message" :title="line">
          {{ line }}
        </div>
      </div>
      <div v-else class="agent-progress-message" :title="agentProgress.message">{{ agentProgress.message || '…' }}</div>
    </div>
  </div>

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

  <!-- 交给 Agent：自定义 Prompt -->
  <div v-if="agentPrompt.visible" class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-title">交给 Agent</div>
      <textarea v-model="agentPrompt.text" class="param-input agent-prompt-input" rows="4"
        placeholder="例如：把这段扩写成博客" @keydown.esc="agentPrompt.visible = false"></textarea>
      <div class="modal-actions">
        <button @click="agentPrompt.visible = false" class="modal-btn modal-btn-cancel">取消</button>
        <button @click="submitAgentPrompt" class="modal-btn modal-btn-primary">发送</button>
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
import { useEditor, setWordWrap } from '../composition/editor';

const getquery = () => {
  const matched = location.href.match(/\?id=([^&]+)&bg=(.+)/);
  return matched ? [matched[1], matched[2]] : [];
};

const { send, onMessage, invoke } = window.apis;
const [id, bg] = getquery();
let bgColor = ref<string>("white");
let isPin = ref<boolean>(false);
let isTransparent = ref<boolean>(false);
let wordWrap = ref<boolean>(true);
let isGenerating = ref<boolean>(false);
let showGenerateMenu = ref<boolean>(false);
let timerHandler: NodeJS.Timeout | null = null;

let data = shallowRef<any>(null);
let editorView: any = null;

const isFileMode = ref(false);
const filePath = ref('');
const fileContent = ref(''); // 文件模式下编辑器的实际内容，与 data.value.content 分离
let savedFileContent: string | null = null; // 最近一次从磁盘读取/写入的内容, 用于判断是否真的有改动
const fileModeOperations = ref<{ name: string, command: string, params?: string[] }[]>([]);

// 便签的创建/更新时间
const stickyMeta = ref<{ createdAt?: number; updatedAt?: number; fromMcp?: boolean }>({});
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

// 交给 Agent 的自定义 Prompt 对话框
const agentPrompt = ref({ visible: false, text: '' });

// Agent 执行进度
const agentProgress = ref<{
  title: string;
  message: string;
  phase: 'running' | 'done' | 'error';
  pid?: number;
  bytes?: number;
  lines?: string[];
} | null>(null);
const agentElapsed = ref(0);
const agentIdle = ref(-1); // -1 表示还没有任何输出
let agentLastOutputAt = 0;
let agentTaskId = '';
let agentTickTimer: NodeJS.Timeout | null = null;
let agentHideTimer: NodeJS.Timeout | null = null;

const agentElapsedText = computed(() => {
  const total = Math.floor(agentElapsed.value / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// 运行中显示 PID、累计输出量、距离上次输出的时间, 用来确认 Agent 还活着
const agentDetailText = computed(() => {
  const progress = agentProgress.value;
  if (!progress || progress.phase !== 'running') return '';
  const parts: string[] = [];
  if (progress.pid) parts.push(`PID ${progress.pid}`);
  parts.push(`输出 ${formatBytes(progress.bytes || 0)}`);
  if (agentIdle.value < 0) parts.push('等待输出…');
  else if (agentIdle.value <= 1) parts.push('刚刚有输出');
  else parts.push(`${agentIdle.value}s 前有输出`);
  return parts.join(' · ');
});

const startAgentProgress = (title: string) => {
  if (agentHideTimer) { clearTimeout(agentHideTimer); agentHideTimer = null; }
  if (agentTickTimer) { clearInterval(agentTickTimer); agentTickTimer = null; }
  agentProgress.value = { title, message: '正在准备…', phase: 'running', bytes: 0 };
  agentElapsed.value = 0;
  agentIdle.value = -1;
  agentLastOutputAt = 0;
  const startedAt = Date.now();
  agentTickTimer = setInterval(() => {
    agentElapsed.value = Date.now() - startedAt;
    if (agentLastOutputAt) agentIdle.value = Math.max(0, Math.floor((Date.now() - agentLastOutputAt) / 1000));
  }, 1000);
};

const finishAgentProgress = (phase: 'done' | 'error', title: string, message: string) => {
  if (agentTickTimer) { clearInterval(agentTickTimer); agentTickTimer = null; }
  if (agentHideTimer) clearTimeout(agentHideTimer);
  agentProgress.value = { title, message, phase };
  agentHideTimer = setTimeout(() => {
    agentHideTimer = null;
    if (!isGenerating.value) agentProgress.value = null;
  }, phase === 'error' ? 8000 : 5000);
};

const cancelAgent = async () => {
  if (!isGenerating.value || !agentTaskId) return;
  if (agentProgress.value) agentProgress.value = { ...agentProgress.value, message: '正在取消…' };
  try { await invoke('cancelAgentTask', agentTaskId); } catch (e) { }
};

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
  // 内容与最近一次读写的磁盘内容一致时, 不做无意义的写入
  if (fileContent.value === savedFileContent) return;
  const content = fileContent.value;
  invoke('writeFileContent', filePath.value, content).then(() => {
    savedFileContent = content;
  }).catch((err: any) => {
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
      savedFileContent = content;
      editorView = useEditor(() => fileContent.value, (v: string) => {
        fileContent.value = v;
        saveToFile();
      }, () => document.getElementById('code-mirror')!, wordWrap.value);
    }).catch((err: any) => {
      console.error('读取文件失败:', err);
      fileContent.value = `读取文件失败: ${err.message}`;
      savedFileContent = null;
      editorView = useEditor(() => fileContent.value, (v: string) => {
        fileContent.value = v;
      }, () => document.getElementById('code-mirror')!, wordWrap.value);
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
    }, () => dom, wordWrap.value);
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
  savedFileContent = null;
  if (data.value?.value && isFileContent(data.value.value.content)) {
    data.value.value.content = '';
    send("setStickyTitle", { key: id, val: '' });
  }
  initEditor();
};

onMounted(async () => {
  // 先读取换行偏好, 保证编辑器初始化时即按偏好渲染
  wordWrap.value = await invoke('getWordWrap');
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
      stickyMeta.value = { ...stickyMeta.value, ...value };
    }
    if (type === "wordWrapChanged" && wordWrap.value !== value) {
      // 其他便签窗口切换了换行偏好, 同步更新
      wordWrap.value = value;
      setWordWrap(editorView, wordWrap.value);
    }
    if (type === "stickyContentChanged" && String(value?.id) === String(id)) {
      // MCP 等外部来源改写内容后, 刷新编辑器
      data.value.value.content = value.content;
      initEditor();
    }
    if (type === "agentProgress") {
      // 只处理当前便签发起的任务
      if (agentProgress.value && String(value?.taskId) === agentTaskId && value?.phase !== 'done') {
        if (value?.lastOutputAt) agentLastOutputAt = Number(value.lastOutputAt);
        agentProgress.value = {
          ...agentProgress.value,
          message: String(value?.message || ''),
          pid: value?.pid ? Number(value.pid) : agentProgress.value.pid,
          bytes: value?.bytes != null ? Number(value.bytes) : agentProgress.value.bytes,
          lines: Array.isArray(value?.lines) ? value.lines.map((line: any) => String(line)) : agentProgress.value.lines
        };
      }
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
  if (agentTickTimer) clearInterval(agentTickTimer);
  if (agentHideTimer) clearTimeout(agentHideTimer);

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
const toggleWordWrap = () => {
  wordWrap.value = !wordWrap.value;
  setWordWrap(editorView, wordWrap.value);
  invoke("setWordWrap", wordWrap.value);
};

const collectStickyContent = () => {
  if (editorView) {
    const selection = editorView.state.selection.main;
    const selectedText = editorView.state.doc.sliceString(selection.from, selection.to);
    const fullContent = isFileMode.value ? fileContent.value : (data.value?.value?.content || '');
    return selectedText.trim() || fullContent;
  }
  return isFileMode.value ? fileContent.value : (data.value?.value?.content || '');
};

const buildAgentPrompt = (instruction: string, content: string, mcpUrl: string, mode: 'custom' | 'blog' | 'file') => {
  const lines = [
    '你是一个可以自主使用 skill 和 MCP 工具的 agent。',
    '',
    '【任务】',
    instruction,
    '',
    '【便签内容】',
    content,
    '',
    '【执行约定】',
  ];
  if (mode === 'file') {
    lines.push('- 直接输出最终 Markdown 正文，不要写入文件，也不要输出额外说明；schedule-pro 会把你的输出保存为 .md 文件。');
  } else {
    if (mcpUrl) {
      lines.push(`- 如果需要把结果保存回 schedule-pro，请调用 schedule-pro MCP（${mcpUrl}）的 create_sticky 工具。`);
    }
    lines.push('- 你的最终输出也会被自动保存为一条新便签；如果已经通过 MCP 创建了便签，则不会重复保存。');
    lines.push('- 不要输出与任务无关的寒暄或解释。');
  }
  return lines.join('\n');
};

const deriveTitle = (text: string) => {
  const line = text.split('\n').map(item => item.trim()).find(Boolean) || '博客';
  return line.replace(/^#+\s*/, '').slice(0, 40);
};

const runAgent = async (mode: 'custom' | 'blog' | 'file', instruction: string) => {
  if (isGenerating.value) return;
  showGenerateMenu.value = false;

  const content = collectStickyContent();
  if (!content || content.trim() === '') {
    alertRef.value?.show('请先在便签中输入内容或选中文本', 'warning');
    return;
  }

  agentTaskId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  startAgentProgress(mode === 'file' ? '正在生成博客文件' : '正在交给 Agent');
  isGenerating.value = true;
  try {
    let mcpUrl = '';
    try {
      const status: any = await invoke('getMcpStatus');
      if (status?.running) mcpUrl = String(status.url || '');
    } catch (e) { }

    const prompt = buildAgentPrompt(instruction, content, mcpUrl, mode);
    const result: any = await invoke('runAgentTask', { taskId: agentTaskId, prompt, mode });

    if (result?.handedOff) {
      finishAgentProgress('done', '已交给 Trae', '已复制 prompt 并打开 Trae，粘贴后发送即可');
      return;
    }

    const output = String(result?.stdout || '').trim();

    if (mode === 'file') {
      if (!output) {
        finishAgentProgress('error', 'Agent 没有返回内容', '未创建文件');
        return;
      }
      const saved: any = await invoke('saveMarkdownFile', { content: output, defaultName: deriveTitle(output) });
      if (saved?.canceled) {
        finishAgentProgress('done', '已取消保存', 'Agent 已生成内容，但保存对话框被取消');
      } else {
        finishAgentProgress('done', '博客文件已保存', String(saved?.filePath || ''));
      }
      return;
    }

    if (result?.createdByAgent) {
      finishAgentProgress('done', 'Agent 已完成', '已通过 MCP 写回便签');
    } else if (result?.stickyId) {
      finishAgentProgress('done', 'Agent 已完成', '结果已保存为新便签');
    } else {
      finishAgentProgress('error', 'Agent 已完成', '但没有返回内容');
    }
  } catch (error: any) {
    const message = String(error?.message || error || 'Agent 执行失败');
    const canceled = /已取消|canceled|cancelled/i.test(message);
    if (canceled) finishAgentProgress('done', '已取消', 'Agent 任务已停止');
    else finishAgentProgress('error', 'Agent 执行失败', message);
  } finally {
    isGenerating.value = false;
  }
};

const openAgentPrompt = () => {
  if (isGenerating.value) return;
  showGenerateMenu.value = false;
  agentPrompt.value = { visible: true, text: '' };
};

const submitAgentPrompt = async () => {
  const text = agentPrompt.value.text.trim();
  if (!text) return;
  agentPrompt.value.visible = false;
  await runAgent('custom', text);
};

const handOffToAgent = async (mode: 'blog' | 'file') => {
  const instruction = mode === 'file'
    ? '请把下面这份便签内容扩写成一篇完整、可发布的博客文章：保留核心观点，补齐结构、例子和过渡，使用 Markdown 格式，并直接输出正文。'
    : '请把下面这份便签内容扩写成一篇完整、可发布的博客文章：保留核心观点，补齐结构、例子和过渡，使用 Markdown 格式。';
  await runAgent(mode, instruction);
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
  display: flex;
  flex-direction: column;
}

.menu-group-label {
  padding: 0 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-2);
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

/* ========== Agent 执行进度 ========== */
.agent-progress {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  bottom: 1.5rem;
  z-index: 40;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--bg-1);
  border: 1px solid var(--border-1);
  box-shadow: 0 8px 20px -6px var(--shadow-0);
  color: var(--color-1);

  &.is-error {
    border-color: var(--error-0);
    color: var(--error-0);
  }

  &.is-done {
    border-color: var(--theme-0);
  }
}

.agent-progress-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
}

.agent-progress-spinner {
  animation: agent-spin 1s linear infinite;
}

@keyframes agent-spin {
  to { transform: rotate(360deg); }
}

.agent-progress-title {
  font-weight: 600;
}

.agent-progress-elapsed {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
}

.agent-progress-cancel {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-1);
  background: var(--bg-2);
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--bg-3);
  }
}

.agent-progress-detail {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agent-progress-log {
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 1px;

  .agent-progress-message {
    margin-top: 0;
    opacity: 0.55;
  }

  .agent-progress-message:last-child {
    opacity: 0.85;
  }
}

.agent-progress-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.agent-prompt-input {
  min-height: 5rem;
  resize: vertical;
  line-height: 1.5;
  font-family: inherit;
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
