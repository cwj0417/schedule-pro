<template>
    <div class="min-h-screen relative overflow-hidden"
        style="background: linear-gradient(to bottom right, var(--bg-0), var(--bg-1));">
        <!-- 可拖动的标题栏 -->
        <div class="flex items-center h-12 backdrop-blur-xl px-5 relative z-10 select-none"
            style="-webkit-app-region: drag; background: var(--glass-bg); border-bottom: 1px solid var(--border-1);">
            <div class="flex items-center pl-0 flex-shrink-0 whitespace-nowrap font-semibold pointer-events-none"
                style="-webkit-app-region: no-drag; color: var(--color-0);">
                <span class="text-md font-bold">设置</span>
                <keyboard class="ml-2" :disabled="true" :value="['metaKey', ',']" />
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
                <div class="flex backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                                class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 update-btn hover-fill"
                                style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
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
                                    style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
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
                                        安装并重启
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 数据管理 -->
                <div class="backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex items-center gap-4 mb-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 data-btn hover-fill"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
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
                                'px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 data-btn hover-fill',
                                !backupInfo.hasBackup ? 'opacity-50 cursor-not-allowed' : ''
                            ]"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1,4 1,10 7,10"/>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                            </svg>
                            <span class="text-xs font-medium">恢复数据</span>
                        </button>
                        <button @click="exportData"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 data-btn hover-fill"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" />
                                <polyline points="7,10 12,15 17,10" stroke-width="2" />
                                <line x1="12" y1="15" x2="12" y2="3" stroke-width="2" />
                            </svg>
                            <span class="text-xs font-medium">导出</span>
                        </button>
                        <button @click="importData"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center gap-2 data-btn hover-fill"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
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
                <div class="flex backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex flex-grow items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                                'px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 theme-btn hover-fill',
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

                <!-- 首页模块显隐 -->
                <div class="backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex items-center gap-4 mb-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">首页模块</h2>
                            <p class="text-xs" style="color: var(--color-2);">选择首页需要展示的模块</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-2">
                        <button v-for="item in sectionOptions" :key="item.key"
                            @click="toggleHomeSection(item.key)"
                            class="section-tile hover-fill flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl focus:outline-none"
                            :class="homeSections[item.key] ? 'section-tile-active' : 'section-tile-inactive'"
                            :style="homeSections[item.key] ? '--hover-fill: color-mix(in srgb, var(--theme-0) 18%, transparent);' : '--hover-fill: var(--bg-2);'"
                            :title="item.desc">
                            <div class="section-tile-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                v-html="item.icon"></div>
                            <span class="text-xs font-medium">{{ item.label }}</span>
                        </button>
                    </div>
                    <button @click="toggleSearchHint"
                        class="section-tile hover-fill mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left focus:outline-none"
                        :class="searchHint ? 'section-tile-active' : 'section-tile-inactive'"
                        :style="searchHint ? '--hover-fill: color-mix(in srgb, var(--theme-0) 18%, transparent);' : '--hover-fill: var(--bg-2);'">
                        <div class="section-tile-icon w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            v-html="hintIcon"></div>
                        <span class="text-xs font-medium">搜索栏提示语</span>
                        <span class="text-xs truncate ml-auto" style="color: var(--color-2);">直接输入以搜索, esc 以清空</span>
                    </button>
                </div>

                <!-- 文件模式操作设置 -->
                <div id="file-mode-settings" class="backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex items-center gap-4 mb-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">文件模式操作设置</h2>
                            <p class="text-xs" style="color: var(--color-2);">为每个文件路径配置快捷操作命令</p>
                        </div>
                    </div>

                    <!-- 按文件路径分组 -->
                    <div v-for="(ops, fPath) in fileModePaths" :key="fPath" class="mb-4">
                        <div class="flex items-center gap-2 mb-2 p-2 rounded-lg" style="background: var(--bg-1); border: 1px solid var(--border-1);">
                            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-2)">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                            </svg>
                            <span class="text-xs truncate flex-1" style="color: var(--color-1);" :title="fPath">{{ fPath.split('/').pop() || fPath.split('\\').pop() || fPath }}</span>
                            <button @click="removeFilePath(String(fPath))"
                                class="p-1 rounded transition-all duration-200 opacity-50 hover:opacity-100 flex-shrink-0"
                                style="color: var(--error-0);" title="删除此文件路径">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <!-- 操作列表 -->
                        <div class="flex flex-col gap-1.5 ml-2">
                            <div v-for="(op, index) in ops" :key="index"
                                class="flex gap-2 items-start p-2 rounded-lg" style="background: var(--bg-0); border: 1px solid var(--border-1);">
                                <div class="flex-1 flex flex-col gap-1.5">
                                    <input v-model="op.name" type="text"
                                        class="w-full px-2 py-1 rounded border transition-all duration-200 focus:outline-none text-xs"
                                        style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);"
                                        placeholder="操作名">
                                    <input v-model="op.command" type="text"
                                        class="w-full px-2 py-1 rounded border transition-all duration-200 focus:outline-none text-xs"
                                        style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);"
                                        placeholder="执行内容，可用 $FILE_PATH, $1, $2 等变量">
                                    <!-- 参数列表 -->
                                    <div v-for="(param, pIdx) in (op.params || [])" :key="pIdx"
                                        class="flex gap-1 items-center">
                                        <span class="text-xs flex-shrink-0 opacity-50" style="color: var(--color-2);">${{ pIdx + 1 }}</span>
                                        <input :value="param" @input="op.params[pIdx] = $event.target.value; fileModePaths = { ...fileModePaths }" type="text"
                                            class="flex-1 px-2 py-1 rounded border transition-all duration-200 focus:outline-none text-xs"
                                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1);"
                                            placeholder="参数名">
                                        <button @click="removeParam(String(fPath), index, pIdx)"
                                            class="p-0.5 rounded transition-all duration-200 opacity-40 hover:opacity-100 flex-shrink-0"
                                            style="color: var(--error-0);">
                                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button @click="addParam(String(fPath), index)"
                                        class="text-xs px-1.5 py-0.5 rounded transition-all duration-200 flex items-center gap-1 self-start opacity-60 hover:opacity-100"
                                        style="color: var(--theme-0); background: var(--theme-5); border: 1px dashed var(--theme-0);">
                                        + 参数
                                    </button>
                                </div>
                                <button @click="removeOperation(String(fPath), index)"
                                    class="p-1 rounded transition-all duration-200 opacity-50 hover:opacity-100"
                                    style="color: var(--error-0);">
                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <button @click="addOperation(String(fPath))"
                                class="text-xs px-2 py-1 rounded transition-all duration-200 flex items-center gap-1 self-start"
                                style="color: var(--theme-0); background: var(--theme-5); border: 1px solid var(--theme-0);">
                                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                新增操作
                            </button>
                        </div>
                    </div>

                    <div v-if="Object.keys(fileModePaths).length === 0" class="text-xs py-3 text-center mb-4" style="color: var(--color-2);">
                        暂无文件路径，在文件模式便签中点击编辑图标添加
                    </div>
                </div>

                <!-- AI 设置 -->
                <div class="backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex items-center gap-4 mb-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">AI 模型设置</h2>
                            <p class="text-xs" style="color: var(--color-2);">配置大模型提供商和 API Token</p>
                        </div>
                    </div>
                    
                    <!-- 提供商选择 -->
                    <div class="flex flex-col gap-4">
                        <!-- 提供商选择 -->
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-medium" style="color: var(--color-1);">模型提供商</label>
                            <select v-model="selectedProvider" @change="onProviderChange"
                                class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                                style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
                                <option v-for="provider in providers" :key="provider.value" :value="provider.value">
                                    {{ provider.label }}
                                </option>
                            </select>
                        </div>
                        
                        <!-- Token 输入 -->
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <label class="text-xs font-medium" style="color: var(--color-1);">API Token</label>
                                <button @click="toggleTokenVisibility"
                                    class="text-xs px-2 py-1 rounded transition-all duration-200"
                                    style="color: var(--color-2); background: var(--bg-1); border: 1px solid var(--border-1);">
                                    {{ showToken ? '隐藏' : '显示' }}
                                </button>
                            </div>
                            <input :type="showToken ? 'text' : 'password'" v-model="tokenInput"
                                class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                                :style="{
                                    'border-color': tokenInput ? 'var(--theme-0)' : 'var(--border-1)',
                                    'background': 'var(--bg-0)',
                                    'color': 'var(--color-1)'
                                }"
                                placeholder="请输入 API Token">
                        </div>
                        
                        <!-- 保存按钮 -->
                        <button @click="saveToken"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 flex items-center justify-center gap-2 save-token-btn"
                            style="border-color: var(--border-1); background: var(--bg-0); color: var(--color-1); --hover-fill: var(--theme-5);">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            <span class="text-xs font-medium">保存设置</span>
                        </button>
                    </div>
                </div>

                <!-- MCP 服务 -->
                <div class="backdrop-blur-xl rounded-2xl p-5 settings-card hover-fill"
                    style="background: var(--glass-bg); border: 1px solid var(--border-1); box-shadow: var(--shadow-1); --hover-fill: var(--theme-5);">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                            style="background: var(--theme-5); color: var(--theme-0);">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="6" rx="2" />
                                <rect x="3" y="14" width="18" height="6" rx="2" />
                                <path d="M7 7h.01M7 17h.01" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-sm font-semibold" style="color: var(--color-0);">MCP 服务</h2>
                            <p class="text-xs" style="color: var(--color-2);">让 AI 客户端读写今日办、待办池、倒计时和便签</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <button @click="toggleMcp" :disabled="mcpBusy"
                            class="px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none border-2 text-xs font-medium hover-fill"
                            :style="mcpStatus.running
                                ? 'border-color: var(--border-1); background: var(--bg-0); color: var(--error-0); --hover-fill: var(--bg-2);'
                                : 'border-color: var(--theme-0); background: var(--theme-5); color: var(--theme-0); --hover-fill: color-mix(in srgb, var(--theme-0) 18%, transparent);'">
                            {{ mcpBusy ? '处理中...' : (mcpStatus.running ? '关闭' : '启动') }}
                        </button>
                        <div class="flex flex-col gap-0.5 min-w-0">
                            <span class="text-xs font-medium"
                                :style="{ color: mcpStatus.running ? 'var(--theme-0)' : 'var(--color-2)' }">
                                {{ mcpStatus.running ? '运行中' : '未启动' }}
                            </span>
                            <span class="text-xs truncate" style="color: var(--color-2);">{{ mcpStatus.url }}</span>
                        </div>
                    </div>
                    <div v-if="mcpStatus.running" class="mt-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs" style="color: var(--color-2);">客户端配置</span>
                            <button @click="copyMcpConfig"
                                class="text-xs px-2 py-1 rounded-md transition-opacity focus:outline-none hover:opacity-70"
                                style="color: var(--theme-0);">
                                {{ mcpCopied ? '已复制' : '复制' }}
                            </button>
                        </div>
                        <pre class="text-xs font-mono leading-5 rounded-lg p-3 mt-1 overflow-x-auto"
                            style="background: var(--bg-0); border: 1px solid var(--border-1); color: var(--color-1);"><code>{{ mcpConfigText }}</code></pre>
                    </div>
                    <p v-if="mcpStatus.error" class="text-xs mt-2" style="color: var(--error-0);">{{ mcpStatus.error }}</p>
                    <p class="text-xs mt-2 leading-5" style="color: var(--color-2);">
                        把上面的配置加进客户端即可连接；关闭服务后需要在客户端重新连接。
                    </p>
                </div>

            </div>
        </div>

        <AlertMessage ref="alertRef" />
        <ConfirmModal ref="confirmRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, nextTick, watch } from 'vue'
import keyboard from '../components/keyboards.vue'
import AlertMessage from '../components/AlertMessage.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { send, invoke, onMessage, copyText } = window.apis

const alertRef = ref<InstanceType<typeof AlertMessage> | null>(null)
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)

// 轻提示: 无需用户决策的信息
const tip = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    alertRef.value?.show(message, type)
}

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

// 首页模块显隐
const homeSections = reactive<Record<string, boolean>>({
    schedule: true,
    timer: true,
    inspiration: true,
    sticky: true
})

const icon = (paths: string) =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const sectionOptions = [
    { key: 'schedule', label: '今日办', desc: '首页左侧的今日待办', icon: icon('<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>') },
    { key: 'timer', label: '倒计时', desc: '首页左侧的倒计时', icon: icon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>') },
    { key: 'inspiration', label: '待办池', desc: '首页中间的待办池', icon: icon('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>') },
    { key: 'sticky', label: '便签', desc: '首页右侧的便签', icon: icon('<path d="M4 4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 2v6h6"/>') }
]

const toggleHomeSection = async (key: string) => {
    homeSections[key] = !homeSections[key]
    try {
        await invoke('setHomeSections', { ...homeSections })
    } catch (error) {
        console.error('保存首页模块设置失败:', error)
        homeSections[key] = !homeSections[key]
    }
}

// 首页搜索栏提示语
const searchHint = ref(true)
const hintIcon = icon('<path d="M4 6h16M4 12h10"/><path d="M18 15l3 3-3 3"/>')

const toggleSearchHint = async () => {
    searchHint.value = !searchHint.value
    try {
        await invoke('setSearchHint', searchHint.value)
    } catch (error) {
        console.error('保存搜索提示语设置失败:', error)
        searchHint.value = !searchHint.value
    }
}

// AI 模型提供商列表
const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'bigmodel', label: '智谱 BigModel' },
    { value: 'baidu', label: '百度文心一言' },
    { value: 'ali', label: '阿里云通义千问' },
    { value: 'google', label: 'Google AI' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'deepseek', label: 'DeepSeek' }
]

// AI 设置相关变量
const selectedProvider = ref('openai')
const tokenInput = ref('')
const showToken = ref(false)

// MCP 服务
const mcpStatus = reactive({
    running: false,
    enabled: false,
    port: 7243,
    url: 'http://127.0.0.1:7243/mcp',
    error: ''
})
const mcpBusy = ref(false)

// 客户端配置文件里可以直接粘贴的片段
const mcpConfigText = computed(() => JSON.stringify({
    mcpServers: {
        'schedule-pro': {
            url: mcpStatus.url,
        },
    },
}, null, 2))

const mcpCopied = ref(false)
const copyMcpConfig = () => {
    try {
        copyText(mcpConfigText.value)
        mcpCopied.value = true
        setTimeout(() => { mcpCopied.value = false }, 1500)
    } catch (error) {
        console.error('复制 MCP 配置失败:', error)
    }
}

const loadMcpStatus = async () => {
    try {
        const status = await invoke('getMcpStatus')
        Object.assign(mcpStatus, status)
    } catch (error) {
        console.error('获取 MCP 服务状态失败:', error)
    }
}

const toggleMcp = async () => {
    if (mcpBusy.value) return
    mcpBusy.value = true
    try {
        const status = await invoke('setMcpEnabled', !mcpStatus.running)
        Object.assign(mcpStatus, status)
    } catch (error: any) {
        console.error('切换 MCP 服务失败:', error)
        mcpStatus.error = String(error?.message || error)
    } finally {
        mcpBusy.value = false
    }
}

// 文件模式设置
const fileModePaths = ref<{ [filePath: string]: { name: string, command: string, params: string[] }[] }>({})
let fileModeLoaded = false

// 即时保存文件模式设置
let saveTimer: any = null
watch(fileModePaths, () => {
    if (!fileModeLoaded) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        send('setFileModeSettings', JSON.parse(JSON.stringify(fileModePaths.value)))
    }, 500)
}, { deep: true })

const addOperation = (fPath: string) => {
    const ops = [...(fileModePaths.value[fPath] || []), { name: '', command: '', params: [] as string[] }]
    fileModePaths.value = { ...fileModePaths.value, [fPath]: ops }
}

const addParam = (fPath: string, opIndex: number) => {
    const ops = [...(fileModePaths.value[fPath] || [])]
    if (ops[opIndex]) {
        ops[opIndex] = { ...ops[opIndex], params: [...(ops[opIndex].params || []), ''] }
        fileModePaths.value = { ...fileModePaths.value, [fPath]: ops }
    }
}

const removeParam = (fPath: string, opIndex: number, paramIndex: number) => {
    const ops = [...(fileModePaths.value[fPath] || [])]
    if (ops[opIndex]) {
        const params = (ops[opIndex].params || []).filter((_, i) => i !== paramIndex)
        ops[opIndex] = { ...ops[opIndex], params }
        fileModePaths.value = { ...fileModePaths.value, [fPath]: ops }
    }
}

const removeOperation = (fPath: string, index: number) => {
    const ops = fileModePaths.value[fPath]?.filter((_, i) => i !== index) || []
    fileModePaths.value = { ...fileModePaths.value, [fPath]: ops }
}

const removeFilePath = (fPath: string) => {
    const { [fPath]: _, ...rest } = fileModePaths.value
    fileModePaths.value = rest
}

// 切换提供商
const onProviderChange = async () => {
    // 加载对应提供商的token
    try {
        const savedToken = await invoke('getAIToken', selectedProvider.value)
        tokenInput.value = savedToken || ''
    } catch (error) {
        console.error('获取token失败:', error)
        tokenInput.value = ''
    }
}

// 切换token可见性
const toggleTokenVisibility = () => {
    showToken.value = !showToken.value
}

// 保存token
const saveToken = async () => {
    try {
        await invoke('setAIToken', {
            provider: selectedProvider.value,
            token: tokenInput.value
        })
        tip('保存成功', 'success')
    } catch (error) {
        console.error('保存token失败:', error)
        tip('保存失败', 'error')
    }
}

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
    send('installCachedUpdate')
}

const exportData = async () => {
    try {
        // 调用主进程的导出数据方法
        const result = await invoke('exportData')
        if (result) {
            tip('数据导出成功', 'success')
        }
    } catch (error) {
        tip('数据导出失败', 'error')
    }
}

const importData = async () => {
    const confirmed = await confirmRef.value?.show({
        title: '导入数据',
        message: '导入数据将覆盖当前所有数据，应用将重启。确定要继续吗？',
        confirmText: '继续导入',
        danger: true
    })
    if (!confirmed) return

    try {
        // 调用主进程的导入数据方法
        const result = await invoke('importData')
        if (result) {
            tip('数据导入成功', 'success')
        }
    } catch (error) {
        tip('数据导入失败', 'error')
    }
}

const createBackup = async () => {
    try {
        // 调用主进程的创建备份方法
        const result = await invoke('createBackup')
        if (result) {
            tip('备份创建成功', 'success')
            // 刷新备份状态
            await loadBackupStatus()
        }
    } catch (error) {
        tip('备份创建失败', 'error')
    }
}

const restoreData = async () => {
    try {
        if (!backupInfo.hasBackup) {
            tip('没有可用的备份文件', 'warning')
            return
        }

        const confirmed = await confirmRef.value?.show({
            title: '恢复数据',
            message: '恢复数据将覆盖当前所有数据，应用将重启。确定要继续吗？',
            confirmText: '继续恢复',
            danger: true
        })
        if (!confirmed) return

        // 调用主进程的恢复数据方法
        const result = await invoke('restoreData')
        if (result.success) {
            tip('数据恢复成功，应用即将重启', 'success')
        } else {
            tip('数据恢复失败: ' + result.message, 'error')
        }
    } catch (error) {
        tip('数据恢复失败', 'error')
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
    onMessage(async ({ type, value }: any) => {
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
        // 监听 MCP 服务状态变化
        if (type === 'mcpStatusChanged') {
            Object.assign(mcpStatus, value)
        }
        // 监听文件模式设置刷新
        if (type === 'reloadFileModeSettings') {
            try {
                const settings = await invoke('getFileModeSettings')
                fileModeLoaded = true
                fileModePaths.value = settings || {}
                nextTick(() => {
                    document.getElementById('file-mode-settings')?.scrollIntoView({ behavior: 'smooth' })
                })
            } catch (e) {
                console.error('刷新文件模式设置失败:', e)
            }
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

    // 获取首页模块显隐配置
    try {
        const savedSections = await invoke('getHomeSections')
        if (savedSections) {
            Object.assign(homeSections, savedSections)
        }
    } catch (error) {
        console.error('获取首页模块设置失败:', error)
    }

    // 获取搜索栏提示语配置
    try {
        const savedHint = await invoke('getSearchHint')
        if (typeof savedHint === 'boolean') {
            searchHint.value = savedHint
        }
    } catch (error) {
        console.error('获取搜索提示语设置失败:', error)
    }

    // 获取自动备份设置和备份状态
    try {
        await loadBackupStatus()
    } catch (error) {
        console.error('获取备份设置失败:', error)
    }

    // 获取 MCP 服务状态
    await loadMcpStatus()

    // 加载AI设置
    try {
        const savedProvider = await invoke('getSelectedAIProvider')
        if (savedProvider) {
            selectedProvider.value = savedProvider
        }
        // 加载对应提供商的token
        await onProviderChange()
    } catch (error) {
        console.error('加载AI设置失败:', error)
    }

    // 加载文件模式设置
    try {
        const settings = await invoke('getFileModeSettings')
        fileModePaths.value = settings || {}
        fileModeLoaded = true
    } catch (error) {
        console.error('加载文件模式设置失败:', error)
    }

    // 如果URL中有hash，滚动到对应位置
    if (window.location.hash === '#file-mode-settings') {
        nextTick(() => {
            document.getElementById('file-mode-settings')?.scrollIntoView({ behavior: 'smooth' })
        })
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

/* 首页模块图标切换 */
.section-tile {
    border: 1px solid var(--border-1);
    background: var(--bg-1);
    color: var(--color-2);
    transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.section-tile-icon {
    background: var(--bg-2);
    transition: background-color 0.2s ease, color 0.2s ease;
}

.section-tile-active {
    border-color: var(--theme-0);
    background: var(--theme-5);
    color: var(--theme-0);
}

.section-tile-active .section-tile-icon {
    background: var(--theme-5);
    color: var(--theme-0);
}

/* 卡片hover效果: 只加深阴影, 不做位移, 避免抖动 */
.settings-card:hover {
    box-shadow: var(--shadow-0);
}

/* 按钮hover效果: 底色由 .hover-fill 从鼠标位置展开 */
.update-btn:hover {
    border-color: var(--theme-0) !important;
    color: var(--theme-0) !important;
}

.data-btn:hover:not(:disabled) {
    border-color: var(--theme-0) !important;
    color: var(--theme-0) !important;
}

.success-btn:hover {
    background: var(--success-2) !important;
}

/* 主题按钮hover效果 */
.theme-btn.theme-inactive:hover {
    border-color: var(--border-2) !important;
}

.theme-btn.theme-active {
    box-shadow: var(--shadow-0);
}

/* 卡片阴影动画 */
.settings-card {
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
