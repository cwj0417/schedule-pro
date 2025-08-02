<template>
    <div class="min-h-screen relative overflow-hidden"
        style="background: linear-gradient(to bottom right, var(--bg-0), var(--bg-1));">
        <!-- 可拖动的标题栏 -->
        <div class="flex items-center h-12 backdrop-blur-xl px-5 relative z-10 select-none"
            style="-webkit-app-region: drag; background: var(--glass-bg); border-bottom: 1px solid var(--border-1);">
            <div class="flex items-center pl-0 flex-shrink-0 whitespace-nowrap font-semibold pointer-events-none"
                style="-webkit-app-region: no-drag; color: var(--color-0);">
                <span class="text-md font-bold">设置</span>
            </div>
            <div class="ml-auto" style="-webkit-app-region: no-drag;">
                <button @click="closeWindow"
                    class="w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center group hover-close-btn"
                    style="background: var(--bg-2); color: var(--color-1);">
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- 主内容区域 -->
        <div class="p-5 h-[calc(100vh-64px)] overflow-y-auto">
            <div class="max-w-2xl mx-auto space-y-5">

                <!-- 应用更新 -->
                <div class="flex backdrop-blur-xl rounded-2xl p-5 transition-all duration-300 settings-card"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1);">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <polygon points="12,6 16,12 8,12" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linejoin="round" />
                                <rect x="8" y="12" width="8" height="6" fill="none" stroke="currentColor"
                                    stroke-width="2" rx="1" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">检查更新</h2>
                            <p class="text-xs" style="color: var(--color-2);">
                                当前版本：{{ versionInfo.curVersion || '获取中...' }}
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-grow pl-4 flex-row gap-4 justify-end items-center ml-auto mt-2">
                        <div class="flex flex-row gap-2 flex-grow justify-end">
                            <!-- 检查更新按钮 -->
                            <button
                                v-if="!versionInfo.checkingForUpdate && !versionInfo.status && !versionInfo.downloaded"
                                @click="checkForUpdates"
                                class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 update-btn"
                                style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.07 2.38" />
                                    <path d="M17 8l4-4-4-4" />
                                </svg>
                                <span class="text-xs font-medium">检查更新</span>
                            </button>

                            <!-- 检查中状态 -->
                            <button v-if="versionInfo.checkingForUpdate" disabled
                                class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                                style="border-color: var(--theme-0); background: var(--theme-5); color: var(--theme-0);">
                                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                                </svg>
                                <span class="text-xs font-medium">检查中</span>
                            </button>

                            <!-- 状态信息显示 -->
                            <button
                                v-if="versionInfo.status && !versionInfo.downloaded && !versionInfo.checkingForUpdate"
                                disabled
                                class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 disabled:opacity-100 disabled:cursor-default flex items-center gap-2"
                                style="border-color: var(--theme-0); background: var(--theme-5); color: var(--theme-0);">
                                <svg v-if="versionInfo.status.includes('下载中')" class="w-4 h-4 animate-spin"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                                </svg>
                                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-xs font-medium">{{ versionInfo.status }}</span>
                            </button>

                            <!-- 下载完成状态 -->
                            <div v-if="versionInfo.downloaded" class="flex-grow">
                                <div class="px-4 py-2 rounded-lg border-2"
                                    style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);">
                                    <div class="flex items-center gap-2 mb-2">
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22,4 12,14.01 9,11.01" />
                                        </svg>
                                        <span class="text-xs font-medium">更新已下载</span>
                                    </div>
                                    <div class="text-xs mb-2" v-if="versionInfo.releaseNotes"
                                        v-html="versionInfo.releaseNotes" style="color: var(--color-2);"></div>
                                    <button @click="restart"
                                        class="px-3 py-1 text-white text-xs rounded transition-colors success-btn"
                                        style="background: var(--success-0);">
                                        点击安装
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 数据管理 -->
                <div class="backdrop-blur-xl rounded-2xl p-5 transition-all duration-300 settings-card"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1);">
                    <div class="flex items-center gap-4 mb-4">
                        <div
                            class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">数据管理</h2>
                            <p class="text-xs" style="color: var(--color-2);">备份、恢复和管理您的数据</p>
                        </div>
                    </div>
                    
                    <!-- 自动备份设置 -->
                    <div class="flex items-center justify-between p-3 rounded-lg mb-4" 
                         style="background: var(--bg-1); border: 1px solid var(--border-1);">
                        <div class="flex items-center gap-3">
                            <div>
                                <p class="text-sm font-medium" style="color: var(--color-0);">自动备份</p>
                                <p class="text-xs" style="color: var(--color-2);">每日自动备份数据到本地</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <button 
                                @click="toggleAutoBackup"
                                class="relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
                                :style="autoBackup ? 
                                    'background: var(--theme-0);' : 
                                    'background: var(--border-1);'">
                                <div 
                                    class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200"
                                    :style="autoBackup ? 'left: 1.25rem;' : 'left: 0.125rem;'">
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="flex flex-wrap gap-2">
                        <button @click="createBackup"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 backup-btn"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17,21 17,13 7,13 7,21"/>
                                <polyline points="7,3 7,8 15,8"/>
                            </svg>
                            <span class="text-xs font-medium">立即备份</span>
                        </button>
                        <button @click="restoreData"
                            :disabled="!backupInfo.hasBackup"
                            :class="[
                                'px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 restore-btn',
                                !backupInfo.hasBackup ? 'opacity-50 cursor-not-allowed' : ''
                            ]"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1,4 1,10 7,10"/>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                            </svg>
                            <span class="text-xs font-medium">恢复数据</span>
                        </button>
                        <button @click="exportData"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 export-btn"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" />
                                <polyline points="7,10 12,15 17,10" stroke-width="2" />
                                <line x1="12" y1="15" x2="12" y2="3" stroke-width="2" />
                            </svg>
                            <span class="text-xs font-medium">导出</span>
                        </button>
                        <button @click="importData"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 import-btn"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" />
                                <polyline points="17,8 12,3 7,8" stroke-width="2" />
                                <line x1="12" y1="3" x2="12" y2="15" stroke-width="2" />
                            </svg>
                            <span class="text-xs font-medium">导入</span>
                        </button>
                    </div>
                    
                    <!-- 备份状态信息 -->
                    <div v-if="backupInfo.lastBackupTime" class="mt-3 p-3 rounded-lg" 
                         style="background: var(--bg-1); border: 1px solid var(--border-1);">
                        <div class="flex items-center gap-2">
                            <span class="text-xs" style="color: var(--color-2);">
                                上次备份：{{ formatBackupTime(backupInfo.lastBackupTime) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 外观设置 -->
                <div class="flex backdrop-blur-xl rounded-2xl p-5 transition-all duration-300 settings-card"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1);">
                    <div class="flex flex-grow items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">主题外观</h2>
                            <p class="text-xs" style="color: var(--color-2);">自定义外观主题</p>
                        </div>
                    </div>
                    <div class="flex flex-row gap-4 justify-end items-center ml-auto mt-2">
                        <div class="flex flex-row gap-2 flex-grow justify-end">
                            <button v-for="theme in themes" :key="theme.value" @click="selectTheme(theme.value)" :class="[
                                'px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 theme-btn',
                                themeMode === theme.value ? 'theme-active' : 'theme-inactive'
                            ]" :style="themeMode === theme.value
                    ? 'border-color: var(--theme-0); background: var(--theme-5); color: var(--theme-0);'
                    : 'border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);'">
                                <div class="flex items-center gap-2">
                                    <div :class="[
                                        'w-4 h-4 rounded-full border-2 flex-shrink-0',
                                        theme.value === 'system' ? 'bg-gradient-to-br from-slate-800 via-slate-500 to-slate-200 border-slate-400' : '',
                                        theme.value === 'light' ? 'bg-white border-slate-300 shadow-inner' : '',
                                        theme.value === 'dark' ? 'bg-slate-800 border-slate-600' : ''
                                    ]"></div>
                                    <span class="text-xs font-medium whitespace-nowrap">{{ theme.label }}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

const { send, invoke, onMessage } = window.apis

const themeMode = ref('system')
const currentVersion = ref('')
const autoBackup = ref(false)

// 备份信息
const backupInfo = reactive({
    hasBackup: false,
    lastBackupTime: null as number | null,
    autoBackup: false
})

// 版本信息对象，参考home页面
const versionInfo = reactive({
    curVersion: "",
    checkingForUpdate: false,
    latestVersion: "",
    releaseDate: "",
    status: "",
    downloaded: false,
    releaseNotes: '',
})

const themes = [
    { value: 'system', label: '跟随系统' },
    { value: 'light', label: '白色主题' },
    { value: 'dark', label: '黑色主题' }
]

const closeWindow = () => {
    send('hideWindow')
}

const checkForUpdates = () => {
    if (!versionInfo.checkingForUpdate) {
        versionInfo.checkingForUpdate = true
        send('checkforupdate')
    }
}

const restart = () => {
    send('quitAndInstall')
}

const exportData = async () => {
    try {
        // 调用主进程的导出数据方法
        const result = await invoke('exportData')
        if (result) {
            alert('数据导出成功')
        }
    } catch (error) {
        alert('数据导出失败')
    }
}

const importData = async () => {
    try {
        // 调用主进程的导入数据方法
        const result = await invoke('importData')
        if (result) {
            alert('数据导入成功')
        }
    } catch (error) {
        alert('数据导入失败')
    }
}

const createBackup = async () => {
    try {
        // 调用主进程的创建备份方法
        const result = await invoke('createBackup')
        if (result) {
            alert('备份创建成功')
            // 刷新备份状态
            await loadBackupStatus()
        }
    } catch (error) {
        alert('备份创建失败')
    }
}

const restoreData = async () => {
    try {
        if (!backupInfo.hasBackup) {
            alert('没有可用的备份文件')
            return
        }
        
        const confirmed = confirm('恢复数据将覆盖当前所有数据，应用将重启。确定要继续吗？')
        if (!confirmed) return
        
        // 调用主进程的恢复数据方法
        const result = await invoke('restoreData')
        if (result.success) {
            alert('数据恢复成功，应用即将重启')
        } else {
            alert('数据恢复失败: ' + result.message)
        }
    } catch (error) {
        alert('数据恢复失败')
    }
}

const loadBackupStatus = async () => {
    try {
        const status = await invoke('checkBackupStatus')
        backupInfo.hasBackup = status.hasBackup
        backupInfo.lastBackupTime = status.lastBackupTime
        backupInfo.autoBackup = status.autoBackup
        autoBackup.value = status.autoBackup
    } catch (error) {
        console.error('获取备份状态失败:', error)
    }
}

const formatBackupTime = (timestamp: number | null) => {
    if (!timestamp) return '无'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) {
        return '刚刚'
    } else if (diffHours < 24) {
        return `${diffHours}小时前`
    } else if (diffDays < 7) {
        return `${diffDays}天前`
    } else {
        return date.toLocaleDateString()
    }
}

const toggleAutoBackup = async () => {
    const newValue = !autoBackup.value
    autoBackup.value = newValue
    backupInfo.autoBackup = newValue
    
    try {
        // 调用主进程保存自动备份设置
        await invoke('setAutoBackup', newValue)
    } catch (error) {
        console.error('设置自动备份失败:', error)
        // 恢复原状态
        autoBackup.value = !newValue
        backupInfo.autoBackup = !newValue
    }
}

const selectTheme = (theme: string) => {
    themeMode.value = theme
    updateTheme()
}

const updateTheme = () => {
    // 调用主进程的设置主题方法，主进程会广播 themeChanged 事件
    // 全局主题管理会自动处理主题应用
    send('setTheme', themeMode.value)
}

onMounted(async () => {
    // 设置更新消息监听
    onMessage(({ type, value }: any) => {
        if (type === "checking-for-update") {
            console.log('正在检查更新...')
            versionInfo.checkingForUpdate = true
        }
        if (type === "update-available") {
            console.log('发现新版本:', value)
            versionInfo.latestVersion = value.version
            versionInfo.releaseDate = new Date(value.releaseDate).toLocaleDateString()
        }
        if (type === "update-not-available" || type === "update-error") {
            console.log('没有新版本或检查更新出错:', type, value)
            versionInfo.status = value
            versionInfo.latestVersion = ""
            versionInfo.checkingForUpdate = false
        }
        if (type === "download-progress") {
            console.log('下载进度:', value)
            versionInfo.status = '下载中' + Math.round(value.percent) + '%'
        }
        if (type === "update-downloaded") {
            console.log('更新已下载:', value)
            versionInfo.downloaded = true
            versionInfo.latestVersion = value
            versionInfo.releaseNotes = `<p>当前版本 : ${versionInfo.curVersion}</p><hr class='my-2'/>` + value.releaseNotes.replace('chore(release)', '最新版本').replace(/\<p(\>[^\<]+\<\/p\>)/, '<p style="color: var(--color-0);padding-bottom: 5px;" $1') + `<hr class='my-2'/>`
        }
        // 监听全局主题变化
        if (type === 'themeChanged') {
            themeMode.value = value
        }
    })

    // 获取当前版本
    try {
        const version = await invoke('getVersion')
        versionInfo.curVersion = version
        currentVersion.value = version
    } catch (error) {
        console.error('获取版本信息失败:', error)
        currentVersion.value = '未知版本'
    }

    // 获取当前主题设置
    try {
        const currentTheme = await invoke('getTheme')
        if (currentTheme) {
            themeMode.value = currentTheme
        }
    } catch (error) {
        console.error('获取主题设置失败:', error)
    }

    // 获取自动备份设置和备份状态
    try {
        await loadBackupStatus()
    } catch (error) {
        console.error('获取备份设置失败:', error)
    }
})
</script>

<style lang="less" scoped>
/* 确保拖拽区域不可选中文本 */
[style*="-webkit-app-region: drag"] {
    user-select: none;
    -webkit-user-select: none;
}

/* 关闭按钮hover效果 */
.hover-close-btn:hover {
    background: var(--error-0) !important;
    color: white !important;
}

/* 卡片hover效果 */
.settings-card:hover {
    box-shadow: var(--shadow-0);
    transform: translateY(-2px);
}

/* 按钮hover效果 */
.update-btn:hover {
    border-color: var(--theme-0) !important;
    background: var(--theme-5) !important;
    color: var(--theme-0) !important;
}

.export-btn:hover {
    border-color: var(--success-0) !important;
    background: var(--success-1) !important;
    color: var(--success-2) !important;
}

.import-btn:hover {
    border-color: var(--theme-0) !important;
    background: var(--theme-5) !important;
    color: var(--theme-0) !important;
}

.success-btn:hover {
    background: var(--success-2) !important;
}

.backup-btn:hover {
    border-color: var(--warning-0) !important;
    background: var(--warning-1) !important;
    color: var(--warning-2) !important;
}

.restore-btn:hover:not(:disabled) {
    border-color: var(--info-0) !important;
    background: var(--info-1) !important;
    color: var(--info-2) !important;
}

/* 主题按钮hover效果 */
.theme-btn.theme-inactive:hover {
    border-color: var(--border-2) !important;
    background: var(--bg-1) !important;
}

.theme-btn.theme-active {
    box-shadow: var(--shadow-0);
}

/* 卡片阴影动画 */
.settings-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 自定义滚动条 */
.overflow-y-auto {
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: var(--bg-1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--border-1);
        border-radius: 4px;

        &:hover {
            background: var(--border-2);
        }
    }
}

/* 按钮悬停效果增强 */
button {
    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px var(--theme-5);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .grid-cols-1.md\:grid-cols-2 {
        grid-template-columns: 1fr;
    }

    .flex.gap-3 {
        flex-direction: column;
        gap: 0.75rem;
    }

    .flex-1 {
        flex: none;
    }
}
</style>
