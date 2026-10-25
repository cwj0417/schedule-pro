# AGENTS.md

## 提交规范

- 提交信息格式：`<type>: <一句话摘要>`，摘要用中文（历史上有少量英文，新增提交统一用中文）
- `type` 取值：
  - `feat`：新功能或体验改动
  - `fix`：修复问题
  - `chore`：依赖升级、构建脚本、杂项维护
  - `docs`：文档
  - `refactor`：不改变行为的重构
- 改动较多时在正文用 `-` 列表说明具体改了什么，一条一行，不写"优化代码"这类空话
- 提交示例：

```
feat: 首页三列布局与倒计时体验优化

- 今日办/待办池都为空时两列收窄, 空间让给便签列
- 倒计时改为真实宽度进度条并每秒平滑过渡
```

## 分批原则

一次提交只做一件事，按主题分批，不要把互不相关的东西混在一起：

1. 依赖升级 / 构建工具迁移单独一个 `chore` 提交
2. 每个页面或组件的功能、交互改动单独提交（如首页、便签窗口）
3. 主进程（窗口、快捷键、IPC）的改动单独提交
4. 打包配置与 CI 改动单独提交
5. 文档更新单独提交

同一批改动里如果既有依赖升级又有业务代码，必须先提交依赖升级，再提交业务代码。

## 发版流程

1. 只修改 `package.json` 的 `version`
2. 提交：`chore(release): x.y.z`，正文写本次功能摘要
3. `git push origin main`
4. 打 tag 并推送：`git tag vX.Y.Z && git push origin vX.Y.Z`

CI 只在推送 `v*` tag（或手动 `workflow_dispatch`）时构建发布，普通 push 不会触发。
tag 名必须与 `package.json` 的 `version` 一致（`version` 1.18.0 → tag `v1.18.0`）。

## 打包说明

- 安装依赖：`pnpm install --frozen-lockfile`（不要用 yarn，仓库只维护 `pnpm-lock.yaml`）
- 本地验证打包：`pnpm build:local`，产物在 `build/built/mac-arm64/schedule-pro.app`
- 签名检查：`codesign --verify --deep --strict build/built/mac-arm64/schedule-pro.app`
- macOS 没有 Apple 开发者证书，采用 `identity: '-'` 的 ad-hoc 签名（需 electron-builder 26+ 才生效）。
  Release 的 DMG 里附有 `安装说明.txt`，用户首次打开需要执行 `xattr -cr /Applications/schedule-pro.app`
  或到"系统设置 → 隐私与安全性"里放行
