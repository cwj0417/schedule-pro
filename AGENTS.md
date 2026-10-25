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

发版是"一个发版提交 + 一个 tag"：只 push 一次 `main`，随后只打**一个** tag，
CI 只跑一次、只生成一个 Release。不要为了"分批"去重复触发 workflow。

1. 提交：只改 `package.json` 的 `version`，提交信息 `chore(release): x.y.z`；
   **正文必须用 `-` 逐条列出本次完整更新内容**（不要只写"优化"之类的空话）。
   CI 会把这段正文写入 Release 说明，app 的更新弹窗直接读取它展示给用户
2. `git push origin main`（普通 push，不触发构建）
3. 打 tag 并推送：`git tag vX.Y.Z && git push origin vX.Y.Z`

示例：

```
chore(release): 1.19.0

- 便签记录新增创建/更新时间, 首页和便签窗口均可查看
- 首页右上角新增设置入口, 支持隐藏今日办/倒计时/待办池/便签
- 修复详情页品牌点击无法返回首页
```

CI 只在推送 `v*` tag（或手动 `workflow_dispatch`）时构建发布，普通 push 不会触发。
tag 名必须与 `package.json` 的 `version` 一致（`version` 1.18.0 → tag `v1.18.0`）。

CI 会先创建 draft Release，构建上传完成后才转正式，避免 electron-builder 26 并发上传时
重复创建 Release。一个版本只应存在一个 Release；发版失败留下的 draft 不会公开。
需要重新发版时，先删除该 Release 和远端 tag，再重新打 tag 推送，不要对已正式发布的 Release 重复构建。

## 打包说明

- 安装依赖：`pnpm install --frozen-lockfile`（不要用 yarn，仓库只维护 `pnpm-lock.yaml`）
- 本地验证打包：`pnpm build:local`，产物在 `build/built/mac-arm64/schedule-pro.app`
- 签名检查：`codesign --verify --deep --strict build/built/mac-arm64/schedule-pro.app`
- macOS 没有 Apple 开发者证书，采用 `identity: '-'` 的 ad-hoc 签名（需 electron-builder 26+ 才生效）。
  Release 的 DMG 里附有 `安装说明.txt`，用户首次打开需要执行 `xattr -cr /Applications/schedule-pro.app`
  或到"系统设置 → 隐私与安全性"里放行
- ad-hoc 签名无法通过 Squirrel 的更新校验，因此 app 内自动安装不可用；更新弹窗保留"重启安装"尝试，
  同时提供"下载安装包"跳转 Release 页面手动覆盖安装
