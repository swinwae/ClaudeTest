# gsd-explorer 设计文档

> GET SHIT DONE (GSD) 可视化学习器 — 交互式探索 GSD 的阶段化工作流、agents、commands 和 hooks。

## 目标

1. **学习 GSD 工作流理念** — 通过可视化流程图理解 Discussion → Research → Planning → Execution → Verification 五阶段模型
2. **作为 GSD 参考手册** — 快速查找任意 agent / command / hook 的用途和用法

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | 原生 HTML / CSS / Vanilla JS（无框架、无构建工具） |
| 数据生成 | Node.js 脚本（generate.js） |
| AI 翻译 | DeepSeek API（deepseek-chat 模型） |
| 数据源 | GitHub 仓库 `gsd-build/get-shit-done`（git clone 到本地） |
| 数据格式 | JSON 内嵌为全局变量（`window.GSD_DATA`） |

## 文件结构

```
gsd-explorer/
├── generate.js     # clone/pull 仓库 + 解析组件 + 合并翻译 → data.js
├── translate.js    # DeepSeek 批量预翻译 → zh-cache.json
├── index.html      # 可视化界面（首页流程图 + 分组导航 + 卡片网格 + 详情面板）
├── data.js         # generate.js 输出物，window.GSD_DATA
├── zh-cache.json   # 翻译缓存，key: "type:id"
└── .cache/         # git clone 的本地仓库副本（已加入 .gitignore）
```

## 数据流

```
GitHub repo (gsd-build/get-shit-done)
    ↓ generate.js: git clone / git pull
    ↓ 解析 agents/*.md、commands/gsd/*.md、hooks/*
    ↓ 读取 zh-cache.json 合并翻译
    → data.js (window.GSD_DATA)
        ↓ index.html 加载并渲染
        → 用户浏览器
```

翻译管线：

```
translate.js → DeepSeek API → zh-cache.json → 合并进 data.js
```

## generate.js 逻辑

### 1. 获取仓库

```javascript
const REPO_URL = 'https://github.com/gsd-build/get-shit-done.git';
const CACHE_DIR = path.join(__dirname, '.cache', 'gsd');

// 不存在 → git clone；已存在 → git pull
```

### 2. 解析组件

- `agents/*.md` — 解析 YAML frontmatter + markdown body，提取 name、description、model、tools 等字段
- `commands/gsd/*.md` — 解析 frontmatter + body，提取 name、description 等
- `hooks/*.js` / `hooks/*.sh` — 读取文件头部注释作为描述

### 3. 阶段归类

根据 command 的 frontmatter 字段（如 `category`、`tags`）或文件名关键词，将 commands 和 agents 归入 5 个 GSD 阶段：

| 阶段 | 中文 | 关键词示例 |
|------|------|-----------|
| Discussion | 讨论需求 | discuss, brainstorm, requirements |
| Research | 调研分析 | research, analyze, investigate |
| Planning | 制定计划 | plan, design, architect, spec |
| Execution | 执行实现 | execute, implement, build, code, task |
| Verification | 验证交付 | verify, test, review, audit, validate |

无法归类的放入 `uncategorized` 分组。

### 4. 输出 data.js

```javascript
window.GSD_DATA = {
  meta: { version, repo, generatedAt, stats },
  phases: [
    {
      id: "discussion",
      label: "Discussion",
      labelZh: "讨论需求",
      description: "阶段描述...",
      commands: [{ id, name, description, raw, zh }],
      agents: [{ id, name, description, model, tools, raw, zh }]
    },
    // ... research, planning, execution, verification
  ],
  uncategorized: { commands: [], agents: [] },
  hooks: [{ id, name, description, raw, zh }]
};
```

## 翻译策略（双层）

### 第一层：预翻译（translate.js）

运行 `DEEPSEEK_API_KEY=sk-xxx node gsd-explorer/translate.js` 批量翻译所有组件的概览信息：

- **输出字段**：summary / keyPoints[] / whenToUse / tips
- **缓存文件**：zh-cache.json，key 格式 `"type:id"`（如 `"command:execute-task"`）
- **增量翻译**：已缓存的条目跳过，每次翻译后立即保存
- **完成后自动调用 generate.js** 重新生成 data.js

### 第二层：按需翻译（浏览器端）

- 详情面板默认展示英文原文
- 用户点击"翻译原文"按钮 → 前端调用 DeepSeek API 翻译全文
- 翻译结果存入 localStorage（key: `gsd-translate:type:id`），下次直接读取
- 注意：前端调用需要用户在 index.html 中配置 API Key（localStorage 存储），或通过 URL 参数传入

## UI 设计

### 视觉风格

- **色调**：紫蓝渐变（`#667eea → #764ba2`）
- **卡片**：圆角、半透明背景、微阴影
- **字体**：系统字体栈，代码用等宽字体
- **主题**：支持深色 / 浅色切换（localStorage 持久化）

### 首页（着陆页）

打开 gsd-explorer 首先看到 GSD 五阶段工作流总览：

- 5 个阶段卡片横向排列，箭头连接
- 每个卡片显示：阶段名称（英文 + 中文）、包含的 commands/agents 数量、简要说明
- 点击阶段卡片 → 跳转到该阶段的组件列表视图
- 页面顶部显示统计信息（总 agents/commands/hooks 数量）

### 组件列表页

- **左侧导航**：
  - 按阶段分区（Discussion / Research / Planning / Execution / Verification）
  - 独立分区：Agents（全部）/ Hooks
  - 当前选中项高亮
- **中间区域**：卡片网格
  - 每张卡片：类型标签（CMD/AGT/HOOK） + 名称 + 中文摘要（如有）+ 英文描述
  - 搜索栏：多字段评分搜索（中文摘要 +3、名称 +2、描述 +1）
- **右侧详情面板**：点击卡片右滑弹出
  - 中文说明区（预翻译的 summary / keyPoints / whenToUse / tips）
  - 配置信息（model、tools 等结构化字段，agent 专有）
  - 英文原文区（可折叠，默认收起，含"翻译原文"按钮）

## 常用命令

```bash
# 首次生成（会自动 clone 仓库）
node gsd-explorer/generate.js

# 打开可视化界面
open gsd-explorer/index.html

# 批量预翻译（需 DeepSeek API Key）
DEEPSEEK_API_KEY=sk-xxx node gsd-explorer/translate.js

# 仓库更新后重新生成
node gsd-explorer/generate.js
```
