<p align="center">
  <img src="resources/icons/icon.ico" alt="logo" width="128" />
</p>

<h1 align="center">Claude MD Editor</h1>

<p align="center">
  <strong>AI 驱动的 Markdown 编辑器</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="platform" />
  <img src="https://img.shields.io/badge/built%20with-Electron%20%2B%20React-61dafb" alt="tech" />
</p>

---

## 功能特性

### Markdown 编辑

- **CodeMirror 6 编辑器** — 语法高亮、行号显示、代码折叠、括号匹配
- **实时预览** — 编辑器与预览面板同步滚动
- **多标签页** — 同时编辑多个文件，支持标签切换与关闭
- **自动保存** — 修改内容自动保存，防止数据丢失

### 数学公式 & 图表

- **LaTeX 数学公式** — 基于 KaTeX 渲染，支持行内公式 `$...$` 和块级公式 `$$...$$`
- **矩阵、分式、积分** — 完整支持复杂数学排版
- **Mermaid 图表** — 流程图、时序图、甘特图、类图、状态图等
- **代码高亮** — 基于 highlight.js，支持 190+ 编程语言

### 文件管理

- **文件树浏览** — 侧边栏展示工作目录结构
- **打开/保存** — 支持 Markdown 文件 (.md) 的打开与保存
- **文件夹工作区** — 打开文件夹作为工作区根目录

### 导出功能

- **HTML** — 自包含网页（内联样式）
- **PDF** — 打印就绪的 PDF 文档
- **DOCX** — Microsoft Word 兼容格式
- **自定义 CSS** — 导出时可注入自定义样式

### 内置终端

- 基于 **xterm.js + node-pty** 的完整终端模拟器
- 自动定位到当前工作目录
- 可拖动调整终端高度

### 界面 & 体验

- **明暗主题** — 跟随系统或手动切换
- **专注模式** — 隐藏所有面板，仅显示编辑器
- **分屏模式** — 编辑模式 / 预览模式 / 双屏模式
- **可拖拽面板** — 侧边栏、编辑器、预览、终端均可自由调整大小
- **全局搜索** — `Ctrl+Shift+F` 跨文件搜索与替换
- **图片粘贴** — 支持剪贴板图片直接粘贴
- **首次启动向导** — 引导配置 API 密钥等选项

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **桌面框架** | Electron 28 |
| **前端框架** | React 18 + TypeScript |
| **编辑器内核** | CodeMirror 6 |
| **Markdown 渲染** | markdown-it + emoji / sub / sup / mark |
| **数学公式** | KaTeX 0.16 |
| **代码高亮** | highlight.js 11 |
| **图表渲染** | Mermaid 10 |
| **终端** | xterm.js 5 + node-pty |
| **状态管理** | Zustand 4 |
| **CSS 方案** | Tailwind CSS 3 + CSS 变量 |
| **构建工具** | Vite 5 + vite-plugin-electron |
| **打包发布** | electron-builder 24 |

---

## 安装与运行

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9
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
│   │   ├── terminal.ts       # 终端进程管理
│   │   ├── export.ts         # 导出功能 (HTML/PDF/DOCX)
│   │   └── imageUpload.ts    # 图片上传/粘贴
│   ├── menu/
│   │   └── appMenu.ts        # 应用菜单栏
│   └── utils/
│       └── paths.ts          # 路径工具
├── src/                      # React 渲染进程
│   ├── main.tsx              # React 入口
│   ├── App.tsx               # 根组件，快捷键 & 菜单事件
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # 主布局容器（可拖拽分栏）
│   │   │   ├── Sidebar.tsx       # 侧边栏
│   │   │   └── BottomPanel.tsx   # 底部面板（终端）
│   │   ├── editor/
│   │   │   ├── EditorPane.tsx    # CodeMirror 编辑器
│   │   │   ├── EditorTabs.tsx    # 标签页栏
│   │   │   └── EditorToolbar.tsx # 工具栏
│   │   ├── preview/
│   │   │   └── PreviewPane.tsx   # 预览面板（Markdown → HTML）
│   │   ├── terminal/
│   │   │   └── TerminalPanel.tsx # 终端面板（xterm）
│   │   ├── file-tree/
│   │   │   └── FileTree.tsx      # 文件树
│   │   ├── dialogs/
│   │   │   ├── GlobalSearchDialog.tsx  # 全局搜索
│   │   │   ├── ExportDialog.tsx        # 导出对话框
│   │   │   ├── SettingsDialog.tsx      # 设置
│   │   │   └── FirstLaunchWizard.tsx   # 首次启动向导
│   │   └── statusbar/
│   │       └── StatusBar.tsx     # 状态栏
│   ├── stores/               # Zustand 状态管理
│   │   ├── useEditorStore.ts     # 编辑器状态（标签页、内容）
│   │   ├── useFileStore.ts       # 文件树状态
│   │   ├── usePreviewStore.ts    # 预览状态（视图模式、滚动）
│   │   ├── useTerminalStore.ts   # 终端状态
│   │   └── useThemeStore.ts      # 主题 & UI 状态
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useMermaidRenderer.ts # Mermaid 图表渲染
│   │   ├── useMathRenderer.ts    # KaTeX 数学渲染
│   │   ├── useAutoSave.ts        # 自动保存
│   │   └── useImagePaste.ts      # 图片粘贴处理
│   ├── styles/
│   │   └── globals.css       # 全局样式 & 主题变量 & Markdown 预览样式
│   └── types/
│       ├── ipc.ts            # IPC 接口类型定义
│       └── modules.d.ts      # Vite 模块声明
├── resources/
│   ├── icons/                # 应用图标
│   └── templates/            # 导出模板
├── electron-builder.yml      # electron-builder 打包配置
├── vite.config.ts            # Vite 构建配置
├── tailwind.config.ts        # Tailwind CSS 配置
└── package.json
```

---

## Markdown 渲染管线

编辑器内容经过以下流水线处理为预览 HTML：

```
Markdown 源码
  → ① 提取保护代码块 (```...```)
  → ② 提取保护数学公式 ($...$ 和 $$...$$)
  → ③ markdown-it 渲染 (breaks, linkify, emoji)
  → ④ 恢复代码块并 HTML 转义
  → ⑤ highlight.js 代码语法高亮
  → ⑥ KaTeX 渲染数学公式
  → ⑦ Mermaid 图表渲染
  → 最终 HTML
```

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
