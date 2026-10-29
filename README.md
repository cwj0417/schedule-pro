<div align="center">
  <img src="website/assets/icon.png" width="112" height="112" alt="schedule PRO" />

# schedule PRO

**把今天要做的，放在一个窗口里。**

[![Release](https://img.shields.io/github/v/release/cwj0417/schedule-pro?style=flat-square&color=4f7df0)](https://github.com/cwj0417/schedule-pro/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/cwj0417/schedule-pro/total?style=flat-square&color=4f7df0)](https://github.com/cwj0417/schedule-pro/releases)
[![Platform](https://img.shields.io/badge/platform-macOS-black?style=flat-square&logo=apple&logoColor=white)](https://github.com/cwj0417/schedule-pro/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-4f7df0?style=flat-square)](https://github.com/cwj0417/schedule-pro)

[产品页](https://cwj0417.github.io/schedule-pro/) · [下载最新版](https://github.com/cwj0417/schedule-pro/releases/latest) · [问题反馈](https://github.com/cwj0417/schedule-pro/issues)

</div>

schedule PRO 是一款 macOS 桌面日程应用。今日办、待办池、便签和倒计时并排在一屏，全局快捷键随时唤起，所有数据只保存在你自己的电脑里。手不离键盘，鼠标基本用不上。

## 功能

- **今日办 / 待办池**：两列清单并排显示，拖拽即可在两边流转，勾选完成原地保留。
- **便签独立窗口 + 总览页**：按 `⌘N` 新建，以独立小窗浮在桌面上，内容自动保存；`⌘⇧K` 打开便签总览，一屏查看全部便签方块，可直接新建或删除。
- **倒计时进度条**：剩余时间以真实宽度每秒平滑收缩，抬眼就知道还剩多少。
- **全局快捷键**：任意应用中唤回主窗口或直达某个模块，组合键可在首页点开重设。
- **即时搜索**：回到首页直接打字就能搜，不用先找搜索框，同时过滤今日办、待办池和便签，`Esc` 一键清空。
- **自动数据备份**：数据以 JSON 保存在本机，每日自动备份一份；也支持一键备份、恢复、导出和导入。
- **MCP 接入（可选）**：在 AI agent 里直接记待办、写便签，不用整理和复制粘贴；服务只监听 `127.0.0.1`。
- **深浅色主题**：跟随系统或手动切换。

## 快捷键

| 操作 | 快捷键 |
| --- | --- |
| 唤回主窗口 | `⌘ ⇧ H` |
| 打开今日办 | `⌘ ⇧ J` |
| 打开待办池 | `⌘ ⇧ L` |
| 打开倒计时 | `⌘ ⇧ I` |
| 打开便签详情 | `⌘ ⇧ K` |
| 新建便签 | `⌘ N` |
| 清空搜索 | `Esc` |

除新建便签外，其余组合键都可以在首页自定义。回到首页后直接打字即可搜索，全程不用碰鼠标。

## 安装

下载最新安装包，链接始终指向最新发布的版本：

- Apple Silicon：[schedule-pro-arm64.dmg](https://github.com/cwj0417/schedule-pro/releases/latest/download/schedule-pro-arm64.dmg)
- Intel：[schedule-pro-x64.dmg](https://github.com/cwj0417/schedule-pro/releases/latest/download/schedule-pro-x64.dmg)

也可以到 [Releases](https://github.com/cwj0417/schedule-pro/releases) 页面查看全部版本；产品页的下载按钮会自动匹配你的芯片架构。下载后把 schedule PRO 拖进“应用程序”。

应用没有 Apple 开发者证书，使用 ad-hoc 签名，首次打开可能被 macOS 拦截。可以在“系统设置 → 隐私与安全性”中放行，或执行：

```bash
xattr -cr /Applications/schedule-pro.app
```

DMG 内附有 `安装说明.txt`。由于 ad-hoc 签名无法通过 Squirrel 的更新校验，应用内自动安装不可用；更新弹窗会同时提供“下载安装包”，手动覆盖安装即可。

## 数据

数据保存在 `~/Library/Application Support/schedule-pro/appdata`，按模块拆分为 JSON 文件（如 `schedule.json`、`inspiration.json`、`sticky*.json`），每日自动备份一份。设置页还提供立即备份、恢复、导出与导入，换电脑时整包迁移。

## 本地开发

需要 Node.js 与 pnpm：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

本地打包并验证：

```bash
pnpm build:local
```

产物在 `build/built/mac-arm64/schedule-pro.app`。

## 产品页

产品页源码在 [`website/`](website/)，纯静态 HTML/CSS/JS，无构建步骤。本地预览：

```bash
cd website
python3 -m http.server 8000
```

打开 `http://localhost:8000`。页面推送到 `main` 且改动涉及 `website/` 时，由 [pages.yml](.github/workflows/pages.yml) 自动部署到 GitHub Pages；与 Release 发布流程互不影响。

## License

MIT
