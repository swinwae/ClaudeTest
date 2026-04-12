# gsd-explorer 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 GSD (Get Shit Done) 可视化学习器，支持阶段化工作流总览、组件浏览和中文翻译。

**Architecture:** 纯前端单页应用，数据由 Node.js 脚本从 git clone 的 GSD 仓库解析生成。翻译分两层：translate.js 预翻译概览信息写入 zh-cache.json，浏览器端按需翻译原文存 localStorage。UI 采用现代渐变风格（紫蓝色调），首页为阶段流程图着陆页，组件列表按 GSD 阶段分组。

**Tech Stack:** Node.js (generate.js / translate.js), Vanilla HTML/CSS/JS, DeepSeek API, Git

**Spec:** `docs/superpowers/specs/2026-04-12-gsd-explorer-design.md`

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `gsd-explorer/generate.js` | clone/pull GSD 仓库 → 解析 agents/commands/hooks → 阶段归类 → 合并翻译 → 输出 data.js |
| `gsd-explorer/translate.js` | 读取 .cache/gsd/ 中的组件 → 调用 DeepSeek API 批量翻译 → 写入 zh-cache.json → 自动重新生成 data.js |
| `gsd-explorer/index.html` | 完整的可视化界面：首页阶段流程图 + 侧边栏导航 + 卡片网格 + 右滑详情面板 + 搜索 + 主题切换 |
| `gsd-explorer/data.js` | generate.js 的输出物，`window.GSD_DATA` 全局变量（自动生成，不手动编辑） |
| `gsd-explorer/zh-cache.json` | DeepSeek 翻译缓存（自动生成） |
| `gsd-explorer/.cache/` | git clone 的 GSD 仓库本地副本（.gitignore 排除） |

---

### Task 1: generate.js — 仓库获取与组件解析

**Files:**
- Create: `gsd-explorer/generate.js`

- [ ] **Step 1: 创建 generate.js 基础框架**

```javascript
#!/usr/bin/env node
/**
 * GSD Explorer 数据生成脚本
 * clone/pull GSD 仓库，解析组件，生成 data.js
 *
 * 用法：node gsd-explorer/generate.js
 * 输出：gsd-explorer/data.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_URL = 'https://github.com/gsd-build/get-shit-done.git';
const CACHE_DIR = path.join(__dirname, '.cache', 'gsd');
const OUTPUT_FILE = path.join(__dirname, 'data.js');
const ZH_CACHE_FILE = path.join(__dirname, 'zh-cache.json');

// ─── 仓库获取 ───────────────────────────────���──────────────────────────────

function ensureRepo() {
  if (fs.existsSync(path.join(CACHE_DIR, '.git'))) {
    console.log('✓ 仓库已存在，执行 git pull...');
    try {
      execSync('git pull --ff-only', { cwd: CACHE_DIR, stdio: 'pipe' });
      console.log('  已更新到最新');
    } catch (e) {
      console.warn('  ⚠️ git pull 失败，使用现有版本');
    }
  } else {
    console.log(`⏳ 首次运行，clone 仓库到 ${CACHE_DIR}...`);
    fs.mkdirSync(path.dirname(CACHE_DIR), { recursive: true });
    execSync(`git clone --depth 1 ${REPO_URL} "${CACHE_DIR}"`, { stdio: 'inherit' });
    console.log('✓ clone 完成');
  }
}

// ─── 解析工具 ────────────────────────────────────────────────��─────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fm: {}, body: content.trim() };
  const fm = {};
  let currentKey = null;
  let currentArray = null;
  match[1].split('\n').forEach(line => {
    // 数组项
    if (currentKey && /^\s+-\s/.test(line)) {
      const val = line.replace(/^\s+-\s*/, '').trim();
      if (val) {
        if (!currentArray) { currentArray = []; fm[currentKey] = currentArray; }
        currentArray.push(val);
      }
      return;
    }
    // 普通键值对
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    currentKey = key;
    currentArray = null;
    if (!val) return; // 可能是数组的开始
    val = val.replace(/^["']|["']$/g, '');
    fm[key] = val;
  });
  return { fm, body: match[2].trim() };
}

function getVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, 'package.json'), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

// ─── 阶段归类 ──────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: 'discussion',
    label: 'Discussion',
    labelZh: '讨论需求',
    description: '与用户讨论需求，明确目标、约束和成功标准',
    keywords: ['discuss', 'brainstorm', 'requirement', 'new-project', 'new-milestone', 'scope', 'profile'],
  },
  {
    id: 'research',
    label: 'Research',
    labelZh: '调研分析',
    description: '分析代码库、技术栈和领域知识，为规划提供依据',
    keywords: ['research', 'analyze', 'investigate', 'map-codebase', 'intel', 'domain', 'advisor', 'forensics', 'pattern'],
  },
  {
    id: 'planning',
    label: 'Planning',
    labelZh: '制定计划',
    description: '将需求拆分为原子任务，制定详细实施计划',
    keywords: ['plan', 'design', 'architect', 'spec', 'roadmap', 'milestone', 'framework-select', 'estimate'],
  },
  {
    id: 'execution',
    label: 'Execution',
    labelZh: '执行实现',
    description: '按计划逐波执行原子任务，编写代码和测试',
    keywords: ['execute', 'implement', 'build', 'code', 'task', 'fix', 'debug', 'undo', 'phase'],
  },
  {
    id: 'verification',
    label: 'Verification',
    labelZh: '验证交付',
    description: '审查代码质量、安全性，验证功能完整性',
    keywords: ['verify', 'test', 'review', 'audit', 'validate', 'check', 'secure', 'uat', 'health', 'progress', 'stats', 'report', 'cleanup'],
  },
];

function classifyPhase(id, name, description) {
  const text = `${id} ${name} ${description}`.toLowerCase();
  let bestPhase = null;
  let bestScore = 0;
  for (const phase of PHASES) {
    let score = 0;
    for (const kw of phase.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPhase = phase.id;
    }
  }
  return bestPhase;
}

// ─── 组件读取 ──────────────────────────────────────────────────────────────

function readAgents() {
  const dir = path.join(CACHE_DIR, 'agents');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const id = path.basename(file, '.md');
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      return {
        id,
        type: 'agent',
        name: fm.name || id,
        description: fm.description || '',
        tools: fm.tools || '',
        color: fm.color || '',
        spawnedBy: fm.spawned_by || fm['spawned_by'] || '',
        phase: classifyPhase(id, fm.name || id, fm.description || ''),
        raw: body,
        zh: null,
      };
    });
}

function readCommands() {
  const dir = path.join(CACHE_DIR, 'commands', 'gsd');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(file => {
      const id = path.basename(file, '.md');
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      return {
        id,
        type: 'command',
        name: fm.name || id,
        description: fm.description || '',
        argumentHint: fm['argument-hint'] || '',
        allowedTools: fm['allowed-tools'] || '',
        agent: fm.agent || '',
        phase: classifyPhase(id, fm.name || id, fm.description || ''),
        raw: body,
        zh: null,
      };
    });
}

function readHooks() {
  const dir = path.join(CACHE_DIR, 'hooks');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.js') || f.endsWith('.sh'))
    .map(file => {
      const id = path.basename(file).replace(/\.(js|sh)$/, '');
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      // 提取文件头部注释作为描述
      let description = '';
      const jsComment = content.match(/^\/\*\*?\s*([\s\S]*?)\*\//);
      const shComment = content.match(/^#[!].*\n((?:#[^!].*\n)*)/);
      if (jsComment) {
        description = jsComment[1].replace(/^\s*\*\s?/gm, '').trim().split('\n')[0];
      } else if (shComment) {
        description = shComment[1].replace(/^#\s?/gm, '').trim().split('\n')[0];
      }
      return {
        id,
        type: 'hook',
        name: id,
        description,
        fileType: path.extname(file).slice(1),
        raw: content,
        zh: null,
      };
    });
}

// ─── 主程序 ──────────────────────────────────────────────────────────────��─

function main() {
  ensureRepo();
  const version = getVersion();
  console.log(`\n✓ GSD v${version}\n`);

  // 读取翻译缓存
  let zhCache = {};
  if (fs.existsSync(ZH_CACHE_FILE)) {
    try {
      zhCache = JSON.parse(fs.readFileSync(ZH_CACHE_FILE, 'utf8'));
      console.log(`  已加载翻译缓存：${Object.keys(zhCache).length} 条`);
    } catch (e) {
      console.warn(`  ⚠️ zh-cache.json 解析失败：${e.message}`);
    }
  }
  const getCached = (type, id) => zhCache[`${type}:${id}`] || null;

  // 读取组件
  console.log('  读取 Agents...');
  const agents = readAgents();
  agents.forEach(a => { a.zh = getCached('agent', a.id); });

  console.log('  读取 Commands...');
  const commands = readCommands();
  commands.forEach(c => { c.zh = getCached('command', c.id); });

  console.log('  读取 Hooks...');
  const hooks = readHooks();
  hooks.forEach(h => { h.zh = getCached('hook', h.id); });

  // 按阶段分组
  const phases = PHASES.map(p => ({
    ...p,
    commands: commands.filter(c => c.phase === p.id),
    agents: agents.filter(a => a.phase === p.id),
  }));
  const uncategorized = {
    commands: commands.filter(c => !c.phase),
    agents: agents.filter(a => !a.phase),
  };

  // 汇总
  const data = {
    meta: {
      version,
      repo: 'gsd-build/get-shit-done',
      generatedAt: new Date().toISOString().slice(0, 10),
      stats: {
        agents: agents.length,
        commands: commands.length,
        hooks: hooks.length,
      },
    },
    phases,
    uncategorized,
    hooks,
  };

  // 输出
  const js = `// 由 generate.js 自动生成 — ${data.meta.generatedAt}\n// GSD v${version}\nwindow.GSD_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_FILE, js, 'utf8');

  console.log(`\n✅ 生成完成：${OUTPUT_FILE}`);
  console.log(`   Agents:   ${agents.length}`);
  console.log(`   Commands: ${commands.length}`);
  console.log(`   Hooks:    ${hooks.length}`);
  const classified = commands.filter(c => c.phase).length + agents.filter(a => a.phase).length;
  const total = commands.length + agents.length;
  console.log(`   阶段归类：${classified}/${total}（${Math.round(classified / total * 100)}%）`);
  console.log('\n💡 用浏览器打开 gsd-explorer/index.html 即可查看');
}

main();
```

- [ ] **Step 2: 确保 .cache/ 被 .gitignore 排除**

检查项目根目录的 `.gitignore`，如果没有排除 `gsd-explorer/.cache/`，则添加。同时排除 `gsd-explorer/data.js`（自动生成文件）。

```
# gsd-explorer
gsd-explorer/.cache/
gsd-explorer/data.js
```

- [ ] **Step 3: 运行 generate.js 验证**

Run: `node gsd-explorer/generate.js`

Expected: 成功 clone 仓库并输出 data.js，控制台显示 agents/commands/hooks 数量和阶段归类百分比。

- [ ] **Step 4: 检查 data.js 输出质量**

读取 `gsd-explorer/data.js`，验证：
- `meta.stats` 中 agents ≈ 32, commands ≈ 122, hooks ≈ 9
- 每个 phase 都有 commands 和 agents 分配
- uncategorized 数量合理（不应超过总数的 30%）
- 每个组件都有 id、name、description、raw 字段

如果阶段归类不理想（uncategorized 过多），调整 `PHASES` 中的 `keywords` 列表并重新运行。

- [ ] **Step 5: 提交**

```bash
git add gsd-explorer/generate.js .gitignore
git commit -m "feat: 添加 gsd-explorer generate.js 数据生成脚本"
```

---

### Task 2: translate.js — DeepSeek 批量预翻译

**Files:**
- Create: `gsd-explorer/translate.js`

- [ ] **Step 1: 创建 translate.js**

```javascript
#!/usr/bin/env node
/**
 * GSD Explorer 中文翻译脚本 — 使用 DeepSeek API 批量生成中文说明
 *
 * 用法：DEEPSEEK_API_KEY=sk-xxx node gsd-explorer/translate.js
 * 输出：gsd-explorer/zh-cache.json，然后自动重新生成 data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error('❌ 请设置环境变量 DEEPSEEK_API_KEY');
  process.exit(1);
}

const CACHE_DIR = path.join(__dirname, '.cache', 'gsd');
const ZH_CACHE_FILE = path.join(__dirname, 'zh-cache.json');
const DELAY_MS = 300;

// 确保仓库已 clone
if (!fs.existsSync(path.join(CACHE_DIR, '.git'))) {
  console.log('⏳ 仓库不存在，先运行 generate.js...');
  execSync('node ' + path.join(__dirname, 'generate.js'), { stdio: 'inherit' });
}

let cache = {};
if (fs.existsSync(ZH_CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(ZH_CACHE_FILE, 'utf8'));
    console.log(`✓ 已加载缓存：${Object.keys(cache).length} 条`);
  } catch (e) {
    console.warn(`⚠️ zh-cache.json 解析失败，从空缓存开始：${e.message}`);
  }
}

function saveCache() {
  fs.writeFileSync(ZH_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { body: content.trim() };
  return { body: match[2].trim() };
}

function callDeepSeek(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });
    const options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) { reject(new Error(parsed.error.message)); return; }
          const text = parsed.choices?.[0]?.message?.content || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          resolve(jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text.trim(), keyPoints: [], whenToUse: '', tips: '' });
        } catch (e) {
          reject(new Error(`解析失败: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('请求超时')); });
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildPrompt(type, id, content) {
  const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n...(截断)' : content;
  return `你是 GET SHIT DONE (GSD) AI 开发工作流工具的中文文档专家。请将以下《${type}》组件（ID: ${id}）的英文文档总结为中文。

要求：
1. summary：3-5句完整中文说明，覆盖核心功能、用途和工作方式
2. keyPoints：3-5个要点（数组），每条20字以内
3. whenToUse：何时使用（1-2句，具体场景）
4. tips：实用技巧或注意事项（1-2句）

必须返回严格 JSON，不要其他文字：
{"summary":"...","keyPoints":["..."],"whenToUse":"...","tips":"..."}

原文：
${truncated}`;
}

async function main() {
  console.log('🔤 GSD Explorer 中文翻译脚本\n');
  const items = [];

  // Agents
  const agentsDir = path.join(CACHE_DIR, 'agents');
  if (fs.existsSync(agentsDir)) {
    fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).forEach(file => {
      const id = path.basename(file, '.md');
      const { body } = parseFrontmatter(fs.readFileSync(path.join(agentsDir, file), 'utf8'));
      items.push({ type: 'agent', id, content: body });
    });
  }

  // Commands
  const commandsDir = path.join(CACHE_DIR, 'commands', 'gsd');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).filter(f => f.endsWith('.md') && !f.startsWith('_')).forEach(file => {
      const id = path.basename(file, '.md');
      const { body } = parseFrontmatter(fs.readFileSync(path.join(commandsDir, file), 'utf8'));
      items.push({ type: 'command', id, content: body });
    });
  }

  // Hooks
  const hooksDir = path.join(CACHE_DIR, 'hooks');
  if (fs.existsSync(hooksDir)) {
    fs.readdirSync(hooksDir).filter(f => f.endsWith('.js') || f.endsWith('.sh')).forEach(file => {
      const id = path.basename(file).replace(/\.(js|sh)$/, '');
      const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
      items.push({ type: 'hook', id, content: content.slice(0, 2000) });
    });
  }

  const pending = items.filter(({ type, id }) => !cache[`${type}:${id}`]);
  console.log(`📦 共 ${items.length} 个组件，已缓存 ${items.length - pending.length} 个，需翻译 ${pending.length} 个`);

  if (!pending.length) {
    console.log('✅ 全部已缓存，重新生成 data.js...');
  } else {
    console.log('🌐 开始调用 DeepSeek API...\n');
    let done = 0;
    for (const { type, id, content } of pending) {
      process.stdout.write(`  [${done + 1}/${pending.length}] ${type}:${id} ... `);
      try {
        const result = await callDeepSeek(buildPrompt(type, id, content));
        cache[`${type}:${id}`] = result;
        saveCache();
        process.stdout.write('✓\n');
      } catch (e) {
        process.stdout.write(`✗ ${e.message}\n`);
      }
      done++;
      if (done < pending.length) await sleep(DELAY_MS);
    }
    console.log('\n✅ 翻译完成！');
  }

  console.log('\n🔄 重新生成 data.js...');
  execSync('node ' + path.join(__dirname, 'generate.js'), { stdio: 'inherit' });
  console.log('\n🎉 完成！刷新 index.html 即可查看中文说明');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
```

- [ ] **Step 2: 验证 translate.js 结构正确**

Run: `node -c gsd-explorer/translate.js`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add gsd-explorer/translate.js
git commit -m "feat: 添加 gsd-explorer translate.js 翻译脚本"
```

---

### Task 3: index.html — UI 框架与主题系统

**Files:**
- Create: `gsd-explorer/index.html`

这是最大的任务，创建完整的可视化界面。由于文件较大，分为 CSS 变量/布局、首页、组件列表、详情面板、搜索、主题切换等部分。

- [ ] **Step 1: 创建 index.html 完整文件**

创建包含以下完整功能的 `gsd-explorer/index.html`：

**HTML 结构：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GSD Explorer</title>
  <!-- Google Fonts: DM Sans + IBM Plex Mono -->
</head>
<body>
  <!-- 顶部栏：logo + 标题 + 搜索框 + 统计数字 + 主题切换 -->
  <div id="topbar">...</div>

  <!-- 首页视图（默认显示）-->
  <div id="home-view">
    <!-- GSD 标题 + 描述 -->
    <!-- 5 个阶段卡片横向排列，带箭头连接 -->
    <!-- 每个卡片显示：阶段名 + 中文名 + commands/agents 数量 -->
    <!-- 点击卡片跳转到组件列表 -->
    <!-- 底部统计总览 -->
  </div>

  <!-- 组件列表视图（点击阶段后显示）-->
  <div id="list-view" style="display:none">
    <div id="app">
      <!-- 左侧导航栏 -->
      <div id="sidebar">
        <!-- 阶段分区（5 个阶段） -->
        <!-- 类型分区（全部 Agents / Hooks） -->
      </div>

      <!-- 中间卡片网格 -->
      <div id="main">
        <div id="cards-header"><!-- 当前分类名 + 数量 --></div>
        <div id="cards"><!-- 组件卡片列表 --></div>
      </div>

      <!-- 右侧详情面板 -->
      <div id="detail-panel">
        <!-- 关闭按钮 -->
        <!-- 中文说明区：summary + keyPoints + whenToUse + tips -->
        <!-- 配置信息区：tools, agent, argumentHint 等 -->
        <!-- 英文原文区（可折叠，默认收起）-->
        <!-- "翻译原文" 按钮（按需翻译） -->
      </div>
    </div>
  </div>

  <script src="data.js"></script>
  <script>
    // 完整的 JS 逻辑
  </script>
</body>
</html>
```

**CSS 设计要点（现代渐变风）：**

```css
:root {
  /* 主色：紫蓝渐变 */
  --primary: #667eea;
  --primary-end: #764ba2;
  --gradient: linear-gradient(135deg, #667eea, #764ba2);

  /* 背景层次 */
  --bg: #f8f9fc;
  --bg2: #ffffff;
  --bg3: #f0f1f6;
  --border: #e2e5f0;

  /* 文本 */
  --text: #374151;
  --text-dim: #9ca3af;
  --text-bright: #111827;

  /* 类型颜色 */
  --color-command: #667eea;
  --color-agent: #a855f7;
  --color-hook: #f59e0b;

  --sidebar-w: 220px;
  --panel-w: 480px;
  --topbar-h: 54px;
  --radius: 12px;
}

/* 深色主题变量覆盖 */
[data-theme="dark"] {
  --bg: #0f1019;
  --bg2: #1a1b2e;
  --bg3: #252640;
  --border: #2d2f4a;
  --text: #b4b8d4;
  --text-dim: #6b6f8d;
  --text-bright: #e8eaf6;
}
```

**JS 核心逻辑：**

```javascript
const D = window.GSD_DATA;
let currentView = 'home';       // 'home' | 'list'
let currentFilter = null;        // { type: 'phase'|'agents'|'hooks', id: string }
let selectedItem = null;

// ─── 首页渲染 ──────────────────────────────
function renderHome() {
  // 渲染 5 个阶段卡片 + 箭头
  // 每个卡片内容：label + labelZh + commands.length + agents.length
  // 点击事件：switchToList({ type: 'phase', id: phase.id })
  // 底部统计：总 agents / commands / hooks 数量
}

// ─── 导航切换 ───────────────────────────���──
function switchToList(filter) {
  currentView = 'list';
  currentFilter = filter;
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('list-view').style.display = '';
  renderSidebar();
  renderCards();
}

function switchToHome() {
  currentView = 'home';
  currentFilter = null;
  selectedItem = null;
  document.getElementById('home-view').style.display = '';
  document.getElementById('list-view').style.display = 'none';
  closePanel();
}

// ─── 侧边栏 ────────────────────���───────────
function renderSidebar() {
  // 阶段分区：遍历 D.phases，高亮当前选中
  // 类型分区：全部 Agents / Hooks
  // 点击切换 currentFilter 并重新渲染 cards
  // 首页入口按钮
}

// ─── 卡片网格 ─────────────────────���─────────
function renderCards() {
  // 根据 currentFilter 获取对应组件列表
  // 渲染每张卡片：
  //   类型标签（CMD/AGT/HOOK，带对应颜色）
  //   组件名称
  //   中文摘要（zh.summary 的前 80 字，如有）
  //   英文描述
  // 点击打开详情面板
}

function getFilteredItems() {
  if (!currentFilter) return [];
  if (currentFilter.type === 'phase') {
    const phase = D.phases.find(p => p.id === currentFilter.id);
    if (!phase) return [];
    return [...phase.commands, ...phase.agents];
  }
  if (currentFilter.type === 'agents') {
    return D.phases.flatMap(p => p.agents).concat(D.uncategorized.agents);
  }
  if (currentFilter.type === 'hooks') {
    return D.hooks;
  }
  if (currentFilter.type === 'uncategorized') {
    return [...D.uncategorized.commands, ...D.uncategorized.agents];
  }
  return [];
}

// ─── 搜索 ───────────────────────────────────
function searchItems(query) {
  if (!query.trim()) { renderCards(); return; }
  const q = query.toLowerCase();
  const allItems = D.phases.flatMap(p => [...p.commands, ...p.agents])
    .concat(D.uncategorized.commands, D.uncategorized.agents, D.hooks);
  const scored = allItems.map(item => {
    let score = 0;
    if (item.zh?.summary?.toLowerCase().includes(q)) score += 3;
    if (item.name?.toLowerCase().includes(q)) score += 2;
    if (item.id?.toLowerCase().includes(q)) score += 2;
    if (item.description?.toLowerCase().includes(q)) score += 1;
    if (item.zh?.whenToUse?.toLowerCase().includes(q)) score += 1;
    return { item, score };
  }).filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
  // 渲染搜索结果卡片
}

// ─── 详情面板 ──────────────────────���────────
function openPanel(item) {
  selectedItem = item;
  // 渲染中文说明区（如有 zh）
  //   summary 段落
  //   keyPoints 列表
  //   whenToUse 段落
  //   tips 段落
  // 渲染配置信息（agent 专有：tools, color, spawnedBy）
  // 渲染英文原文（可折叠，默认收起）
  //   "翻译原文" 按钮
  // 面板滑入动画
}

function closePanel() {
  selectedItem = null;
  // 面板滑出动画
}

// ─── 按需翻译 ───────────────────────────────
async function translateRaw(item) {
  const cacheKey = `gsd-translate:${item.type}:${item.id}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    // 显示缓存的翻译
    return;
  }
  // 提示用户输入 API Key（首次使用时存入 localStorage）
  const apiKey = localStorage.getItem('gsd-deepseek-key');
  if (!apiKey) {
    // 弹窗让用户输入 API Key
    return;
  }
  // 调用 DeepSeek API 翻译 item.raw
  // 成功后存入 localStorage
  // 更新详情面板显示
}

// ─── 主题切换 ───────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('gsd-theme', next);
}

// ─── 初始化 ──────────────────────────���──────
function init() {
  // 加载主题
  const saved = localStorage.getItem('gsd-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  // 渲染顶部栏统计
  // 绑定搜索事件
  // 渲染首页
  renderHome();
}

init();
```

- [ ] **Step 2: 在浏览器中测试首页**

先运行 `node gsd-explorer/generate.js` 确保 data.js 存在，然后用浏览器打开 `gsd-explorer/index.html`。

验证：
- 5 个阶段卡片正确显示，数量正确
- 点击阶段卡片跳转到组件列表
- 搜索功能可用
- 深色/浅色主题切换正常
- 详情面板正确展示组件信息

- [ ] **Step 3: 修复首次测试中发现的问题**

根据浏览器测试结果修复 UI 问题（布局、样式、交互）。

- [ ] **Step 4: 提交**

```bash
git add gsd-explorer/index.html
git commit -m "feat: 添加 gsd-explorer 可视化界面"
```

---

### Task 4: 集成测试与 CLAUDE.md 更新

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 端到端测试**

完整流程测试：

```bash
# 1. 生成数据
node gsd-explorer/generate.js

# 2. 打开界面
open gsd-explorer/index.html
```

验证：
- 首页阶段流程图正常显示
- 各阶段卡片可点击进入
- 侧边栏导航切换正常
- 搜索功能（中英文）正常
- 详情面板展示正确（中文说明 / 配置 / 英文原文）
- 主题切换正常
- 返回首页正常

- [ ] **Step 2: 更新 CLAUDE.md 添加 gsd-explorer 使用说明**

在 CLAUDE.md 的 `## 常用命令` 部分，在 superpowers-explorer 之后添加：

```markdown
### gsd-explorer（GSD 可视化学习器）

\```bash
# 生成数据文件（首次运行会自动 clone GSD 仓库）
node gsd-explorer/generate.js

# 打开可视化界面
open gsd-explorer/index.html

# 批量预翻译（需 DeepSeek API Key）
DEEPSEEK_API_KEY=sk-xxx node gsd-explorer/translate.js

# GSD 仓库更新后重新生成
node gsd-explorer/generate.js
\```
```

在 `## 架构说明` 末尾添加 gsd-explorer 架构段落（参考 ecc-explorer 的格式）。

- [ ] **Step 3: 提交**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md 补充 gsd-explorer 使用说明"
```
