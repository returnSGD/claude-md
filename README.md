<p align="center">
  <img src="resources/icons/icon.ico" alt="logo" width="128" />
</p>

<h1 align="center">Claude MD Editor</h1>

<p align="center">
  <strong>AI 驱动的 PyCharm 风格 Markdown 编辑器</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="platform" />
  <img src="https://img.shields.io/badge/built%20with-Electron%20%2B%20React-61dafb" alt="tech" />
</p>

---

## 产品定位

基于 Claude Code 源码二次开发，构建一个 **PyCharm 风格的 AI Markdown 编辑器**。

**核心理念**：用户下载安装后，只需配置 Anthropic API Key，就能在一个桌面应用中完成 Markdown 写作、实时预览、AI 辅助编辑的全部工作流，无需打开终端、无需额外工具。

**用户旅程**：

```
下载安装包 → 安装 → 首次启动
                        │
                        ├─→ 检测 Bun 运行时 → 未安装则引导一键安装
                        │
                        ├─→ 输入 Anthropic API Key → 加密存储到本地
                        │
                        └─→ 进入编辑器 ← 此后每次打开直接可用
                              │
                              ├─ 左侧文件树浏览/管理 Markdown 文件
                              ├─ 中央编辑 + 实时预览
                              └─ 底部 Claude Code 对话终端（AI 已就绪）
```

### 核心布局

```
┌──────────────────────────────────────────────────────────┐
│  菜单栏: 文件 | 编辑 | 视图 | 工具 | 主题 | 帮助            │
├────────┬────────────────────────────────┬────────────────┤
│        │                                │                │
│ 文件树  │   Markdown 编辑区              │   实时预览      │
│        │   (CodeMirror 6)               │  (markdown-it) │
│  📁 docs│                               │               │
│   ├─ a.md   │   # 标题                   │  ┌────────┐   │
│   ├─ b.md   │   **加粗**                 │  │ 渲染结果│   │
│  📁 src    │   - 列表                   │   └────────┘   │
│        │                                │                │
├────────┴────────────────────────────────┴────────────────┤
│  AI 对话终端 (xterm.js + Claude Code)                     │
│  > 帮我优化这段 Markdown...                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Claude: 好的，我来帮你...                            │ │
│  └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  状态栏: README.md | 行 42:列 10 | 字数 2300 | Markdown   │
└──────────────────────────────────────────────────────────┘
```

- **左侧面板**：文件目录树 + 大纲（TOC）
- **中央**：Markdown 编辑区 + 右侧实时预览区（双栏可切换）
- **底部面板**：Claude Code AI 对话终端（可折叠/拖拽调整高度）

---

## 功能特性

### Markdown 编辑

- **CodeMirror 6 编辑器** — 语法高亮、行号显示、代码折叠、括号匹配、自动补全
- **实时预览** — 编辑器与预览面板同步滚动
- **多标签页** — 同时编辑多个文件，支持标签切换与关闭
- **自动保存** — 修改内容自动保存，防止数据丢失
- **工具栏** — 一键插入标题、加粗、斜体、链接、图片、列表、代码块、表格、公式、图表

### 数学公式 & 图表

- **LaTeX 数学公式** — 基于 KaTeX 渲染，支持行内公式 `$...$` 和块级公式 `$$...$$`
- **矩阵、分式、积分** — 完整支持复杂数学排版
- **Mermaid 图表** — 流程图、时序图、甘特图、类图、状态图等
- **代码高亮** — 基于 highlight.js，支持 190+ 编程语言

### 文件管理

- **文件树浏览** — 侧边栏展示工作目录结构，支持展开/折叠、右键菜单（新建/删除/重命名）
- **打开/保存** — 支持 Markdown 文件 (.md) 的打开与保存
- **文件夹工作区** — 打开文件夹作为工作区根目录
- **文件监听** — 外部文件变更实时同步到文件树

### AI 智能助手

- **Claude Code 终端** — 内置 xterm.js + node-pty，运行完整 Claude Code AI 对话
- **右键菜单** — 选中文本后右键 → "AI 帮忙写这段"
- **AI 优化排版** — 工具栏一键将全文发送给 AI 进行排版优化
- **斜杠命令** — 支持 `/fix`（语法修正）、`/summarize`（生成摘要）等

### 导出功能

- **HTML** — 自包含网页（内联样式）
- **PDF** — 打印就绪的 PDF 文档
- **DOCX** — Microsoft Word 兼容格式
- **图片** — 将预览区渲染为 PNG/JPEG
- **自定义 CSS** — 导出时可注入自定义样式

### 界面 & 体验

- **明暗主题** — 跟随系统或手动切换，CSS 变量驱动
- **专注模式** — 隐藏所有面板，编辑器居中，当前段落高亮
- **分屏模式** — 编辑+预览 / 仅编辑 / 仅预览
- **可拖拽面板** — 侧边栏、编辑器、预览、终端均可自由调整大小
- **全局搜索** — `Ctrl+Shift+F` 跨文件搜索与替换
- **图片粘贴** — 支持剪贴板图片直接粘贴，自动保存到 assets 目录
- **首次启动向导** — 引导检测 Bun 运行时、配置 API 密钥等

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron 主进程 (Main Process)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 窗口管理器    │  │ 文件系统服务  │  │ PTY 进程管理器    │   │
│  │ (BrowserWin) │  │ (fs/path)    │  │ (node-pty)       │   │
│  └──────────────┘  └──────────────┘  └────────┬─────────┘   │
│                                               │             │
│                              ┌────────────────▼──────────┐  │
│                              │  Claude Code 后端进程      │  │
│                              │  (Bun 运行时)              │  │
│                              │  - query.ts / QueryEngine │  │
│                              │  - REPL 逻辑               │  │
│                              │  - 工具系统 (Bash/Read/    │  │
│                              │    Edit/Grep/Agent...)    │  │
│                              └───────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              IPC Bridge (contextBridge + ipcMain)     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ IPC 通道
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Electron 渲染进程 (Renderer Process)            │
│                                                               │
│  ┌──────────┬──────────────────────────┬─────────────────┐   │
│  │  左侧面板 │       中央编辑区          │   右侧预览区     │   │
│  │          │                          │                 │   │
│  │ 文件树   │   CodeMirror 6           │  markdown-it    │   │
│  │ (Tree)   │   - 语法高亮              │  渲染结果        │   │
│  │          │   - 自动补全              │  - 标题/列表     │   │
│  │ 大纲     │   - 快捷键绑定            │  - 代码块高亮    │   │
│  │ (TOC)    │   - 滚动同步 ───────────►│  - 表格          │   │
│  │          │                          │  - 数学公式      │   │
│  │          │                          │  - Mermaid 图表  │   │
│  └──────────┴──────────────────────────┴─────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   底部面板 (可折叠/拖拽调整高度)           │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │  AI 终端 (xterm.js)                              │    │ │
│  │  │  - Claude Code REPL 输出                         │    │ │
│  │  │  - 用户输入区                                     │    │ │
│  │  │  - 工具调用结果展示                               │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │  状态栏: 文件名 | 行:列 | 字数 | 文件类型 | 主题  │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 进程通信

```
┌──────────────────┐         IPC          ┌──────────────────────┐
│  Electron 主进程  │ ◄──────────────────► │  Electron 渲染进程   │
│                  │                      │                     │
│  • 文件系统操作   │  file:*              │  • React UI         │
│  • PTY 管理      │  terminal:*          │  • CodeMirror 6     │
│  • 窗口管理      │  export:*            │  • markdown-it 渲染  │
│  • 原生菜单      │  image:*             │  • xterm.js 终端     │
│  • 导出功能      │  app:*               │  • Zustand 状态管理  │
└────────┬────────┘                      └──────────────────────┘
         │
         │ node-pty
         ▼
┌──────────────────┐
│  Claude Code      │
│  (Bun 子进程)     │
│  • 标准输入/输出   │
│  • AI 对话处理    │
│  • 工具调用       │
└──────────────────┘
```

---

## 技术栈

| 类别 | 技术 | 选型理由 |
|------|------|---------|
| **桌面框架** | Electron 28+ | 跨平台桌面应用，集成 Node.js 能力，支持文件关联和原生菜单 |
| **前端框架** | React 18 + TypeScript | 与 Claude Code 技术栈一致，复用组件体系 |
| **编辑器内核** | CodeMirror 6 | 模块化架构，Markdown 语法高亮成熟，扩展性强 |
| **Markdown 渲染** | markdown-it + 插件生态 | 支持 GFM、表格、脚注、Emoji、数学公式、Mermaid |
| **数学公式** | KaTeX 0.16 | 快速渲染 LaTeX 公式为 SVG |
| **代码高亮** | highlight.js 11 | 190+ 语言支持 |
| **图表渲染** | Mermaid 10 | 流程图、时序图、甘特图等多种图表 |
| **终端** | xterm.js 5 + node-pty | 在渲染进程中嵌入完整终端，PTY 管理子进程 |
| **AI 引擎** | Claude Code（原项目核心） | 保留完整 query.ts / QueryEngine.ts / REPL 逻辑 |
| **AI 运行时** | Bun（外部依赖） | Claude Code 使用 Bun 专有 API，必须通过 Bun 执行 |
| **状态管理** | Zustand 4 | 轻量、与 React 深度集成 |
| **CSS 方案** | Tailwind CSS 3 + CSS 变量 | 快速构建 UI， CSS 变量驱动主题切换 |
| **构建工具** | Vite 5 + vite-plugin-electron | HMR 热更新，开发体验好 |
| **打包发布** | electron-builder 24 | 三平台打包 |

### 为什么不直接复用 Claude Code 的 Ink 终端 UI？

Claude Code 的 UI 基于 **Ink（React → Terminal 渲染器）**，本质是 TUI（文本用户界面），无法渲染图形化的 Markdown 预览、代码高亮、文件树等组件。因此采用 Electron GUI 方案，将 Claude Code 的交互能力嵌入 xterm.js 终端组件，同时在渲染进程中使用真正的浏览器 DOM 渲染编辑器 UI。

---

## 安装与运行

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Bun**（可选，用于 AI 终端功能；首次启动会自动检测并引导安装）
- **Windows** / **macOS** / **Linux**

### 克隆项目

```bash
git clone https://github.com/your-org/claude-md-editor.git
cd claude-md-editor
```

### 安装依赖

```bash
npm install
```

### 开发模式

启动 Vite 开发服务器 + Electron 窗口（支持热更新）：

```bash
npm run electron:dev
```

### 仅启动前端

```bash
npm run dev
```

### 构建 & 打包

构建前端和 Electron 主进程：

```bash
npm run build
```

构建并打包为桌面安装程序：

```bash
npm run electron:build
```

打包产物位于 `release/` 目录：
- **Windows**：`.exe` NSIS 安装程序
- **macOS**：`.dmg` 镜像
- **Linux**：`.AppImage` / `.deb`

---

## 项目结构

```
claude-md-editor/
├── electron/                 # Electron 主进程
│   ├── main.ts               # 应用入口，窗口创建
│   ├── preload.ts            # 预加载脚本 (contextBridge)
│   ├── ipc/                  # IPC 通信模块
│   │   ├── fileSystem.ts     # 文件系统操作
│   │   ├── terminal.ts       # PTY 终端管理
│   │   ├── export.ts         # 导出功能 (HTML/PDF/DOCX)
│   │   └── imageUpload.ts    # 图片上传/粘贴
│   ├── pty/
│   │   └── claudeTerminal.ts # node-pty 封装，启动 Claude Code 进程
│   ├── menu/
│   │   └── appMenu.ts        # 应用菜单栏
│   └── utils/
│       └── paths.ts          # 资源路径、用户数据路径工具
├── src/                      # React 渲染进程
│   ├── main.tsx              # React 入口
│   ├── App.tsx               # 根组件，布局容器
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # 主布局容器（可拖拽分栏）
│   │   │   ├── SplitPane.tsx     # 可拖拽分割面板
│   │   │   ├── Sidebar.tsx       # 侧边栏
│   │   │   └── BottomPanel.tsx   # 底部面板（可折叠）
│   │   ├── editor/
│   │   │   ├── EditorPane.tsx    # CodeMirror 编辑器
│   │   │   ├── EditorTabs.tsx    # 标签页栏
│   │   │   ├── extensions/       # CodeMirror 6 扩展
│   │   │   │   ├── markdownSyntax.ts  # Markdown 语法高亮
│   │   │   │   ├── autocomplete.ts    # 自动补全
│   │   │   │   ├── keybindings.ts     # 快捷键定义
│   │   │   │   └── scrollSync.ts      # 滚动同步扩展
│   │   │   └── toolbar/
│   │   │       └── EditorToolbar.tsx   # 工具栏
│   │   ├── preview/
│   │   │   ├── PreviewPane.tsx        # 预览面板
│   │   │   ├── MarkdownRenderer.tsx   # markdown-it 渲染器封装
│   │   │   └── preview-plugins/       # 预览插件
│   │   │       ├── codeHighlight.ts   # 代码语法高亮
│   │   │       ├── mathRenderer.ts    # KaTeX 数学渲染
│   │   │       ├── mermaidRenderer.ts # Mermaid 图表渲染
│   │   │       └── tocGenerator.ts    # 目录生成
│   │   ├── terminal/
│   │   │   └── TerminalPanel.tsx      # 终端面板 (xterm)
│   │   ├── file-tree/
│   │   │   ├── FileTree.tsx           # 文件树
│   │   │   ├── FileTreeNode.tsx       # 单个树节点
│   │   │   └── FileTreeContextMenu.tsx # 右键菜单
│   │   ├── dialogs/
│   │   │   ├── GlobalSearchDialog.tsx  # 全局搜索
│   │   │   ├── ExportDialog.tsx        # 导出对话框
│   │   │   ├── SettingsDialog.tsx      # 设置
│   │   │   ├── TableInsertDialog.tsx   # 表格插入
│   │   │   └── FirstLaunchWizard.tsx   # 首次启动向导
│   │   └── statusbar/
│   │       └── StatusBar.tsx           # 状态栏
│   ├── stores/                # Zustand 状态管理
│   │   ├── useEditorStore.ts      # 编辑器状态（标签页、内容）
│   │   ├── useFileStore.ts        # 文件树状态
│   │   ├── usePreviewStore.ts     # 预览状态（视图模式、滚动）
│   │   ├── useTerminalStore.ts    # 终端状态
│   │   └── useThemeStore.ts       # 主题 & UI 状态
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useIpc.ts              # IPC 通信（类型安全封装）
│   │   ├── useMarkdownParser.ts   # Markdown 解析 + 实时渲染
│   │   ├── useScrollSync.ts       # 编辑-预览滚动同步
│   │   ├── useAutoSave.ts         # 自动保存
│   │   ├── useImagePaste.ts       # 图片粘贴处理
│   │   └── useExport.ts           # 导出逻辑
│   ├── services/              # 业务逻辑服务
│   │   ├── markdownEngine.ts      # markdown-it 配置 + 插件加载
│   │   ├── fileService.ts         # 文件 CRUD（IPC 调用主进程）
│   │   ├── exportService.ts       # 导出为 HTML/PDF/DOCX
│   │   └── imageService.ts        # 图片上传/本地存储
│   ├── styles/
│   │   ├── globals.css            # 全局样式 & 主题变量
│   │   ├── themes/
│   │   │   ├── light.css          # 亮色主题变量
│   │   │   └── dark.css           # 暗色主题变量
│   │   └── preview.css            # Markdown 预览区样式
│   └── types/
│       ├── editor.ts              # 编辑器类型
│       ├── file.ts                # 文件系统类型
│       ├── ipc.ts                 # IPC 接口类型定义
│       └── theme.ts               # 主题类型
├── claude-code/               # Claude Code 源码（保持原目录结构）
│   └── src/                   # query.ts / QueryEngine.ts / tools / commands 等
├── resources/
│   ├── icons/                 # 应用图标
│   └── templates/             # 导出模板
├── electron-builder.yml       # electron-builder 打包配置
├── vite.config.ts             # Vite 构建配置
├── tailwind.config.ts         # Tailwind CSS 配置
└── package.json
```

---

## Markdown 渲染管线

编辑器内容经过以下流水线处理为预览 HTML：

```
Markdown 源码
  → ① 提取保护代码块 (```...```)
  → ② 提取保护数学公式 ($...$ 和 $$...$$)
  → ③ markdown-it 渲染 (breaks, linkify, emoji, GFM, 脚注, 上下标)
  → ④ 恢复代码块并 HTML 转义
  → ⑤ highlight.js 代码语法高亮
  → ⑥ KaTeX 渲染数学公式 → SVG
  → ⑦ Mermaid 图表渲染 → SVG
  → ⑧ sanitize-html XSS 防护
  → 最终 HTML
```

## 首次启动流程

```
应用首次启动
    │
    ▼
检测 Bun 运行时 (which bun / where bun)
    │
    ├─→ 找到 → 记录路径 → 下一步
    │
    └─→ 未找到 → 弹出引导对话框
                  ├─ [一键安装] 打开终端执行安装命令
                  ├─ [手动安装] 打开 bun.sh 官网
                  └─ [跳过] 编辑器可正常使用，AI 终端暂不可用
    │
    ▼
API Key 配置
    ├─ 输入 Anthropic API Key
    ├─ 可选：自定义 API Base URL
    └─ 保存 → 加密写入本地用户数据目录
              (Windows: %APPDATA% | macOS: ~/Library/Application Support
               | Linux: ~/.config) /claude-md-editor/config.json

后续运行：启动 Claude Code 子进程时从配置文件读取 API Key，
通过环境变量传递给 Bun 子进程
```

---

## MVP 路线图

### Phase 1：基础框架搭建
- [ ] Electron 项目初始化，配置 Vite + React + TypeScript
- [ ] 实现三段式布局（AppShell + SplitPane）
- [ ] 集成 CodeMirror 6，实现基础 Markdown 编辑
- [ ] 集成 markdown-it，实现实时预览
- [ ] 实现暗色/亮色主题切换
- [ ] 集成 xterm.js，连接 Claude Code PTY 终端

### Phase 2：核心编辑功能
- [ ] 文件目录树（新建/打开/保存/另存为）
- [ ] 多标签页管理
- [ ] 工具栏按钮（加粗、斜体、链接、图片、列表、标题）
- [ ] 常用快捷键（Ctrl+B/I/K/S/Z/Y/1~6）
- [ ] 双栏/单栏切换
- [ ] 语法高亮与自动补全

### Phase 3：增强功能
- [ ] 图片拖拽/粘贴上传
- [ ] 表格可视化插入与 Tab 导航
- [ ] 滚动同步
- [ ] 导出 HTML / PDF / DOCX
- [ ] Mermaid 图表渲染
- [ ] KaTeX 数学公式渲染
- [ ] 目录自动生成（TOC）

### Phase 4：体验打磨
- [ ] 专注模式
- [ ] 全局搜索替换
- [ ] 自动保存草稿
- [ ] 原生菜单栏集成

### Phase 5：发布与打包
- [ ] electron-builder 打包配置
- [ ] Windows / macOS / Linux 三平台构建
- [ ] 自动更新配置

---

## 许可证

[MIT](LICENSE)

---

## 致谢

- [CodeMirror](https://codemirror.net/) — 编辑器内核
- [KaTeX](https://katex.org/) — 数学公式渲染
- [Mermaid](https://mermaid.js.org/) — 图表渲染
- [markdown-it](https://github.com/markdown-it/markdown-it) — Markdown 解析
- [Electron](https://www.electronjs.org/) — 桌面应用框架
- [Vite](https://vitejs.dev/) — 构建工具
- [xterm.js](https://xtermjs.org/) — 终端模拟器
- [Claude Code](https://claude.ai/code) — AI 引擎内核
