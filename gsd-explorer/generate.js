#!/usr/bin/env node
/**
 * GSD Explorer 数据生成脚本
 * 从 GitHub 仓库 gsd-build/get-shit-done 获取数据，解析组件，生成 data.js
 *
 * 用法：node gsd-explorer/generate.js
 * 输出：gsd-explorer/data.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const REPO_URL = 'https://github.com/gsd-build/get-shit-done.git';
const CACHE_DIR = path.join(__dirname, '.cache', 'gsd');

const PHASES = [
  { id: 'discussion', label: 'Discussion', labelZh: '讨论需求',
    description: '与用户讨论需求，明确目标、约束和成功标准',
    keywords: ['discuss', 'brainstorm', 'requirement', 'new-project', 'new-milestone', 'scope', 'profile'] },
  { id: 'research', label: 'Research', labelZh: '调研分析',
    description: '分析代码库、技术栈和领域知识，为规划提供依据',
    keywords: ['research', 'analyze', 'investigate', 'map-codebase', 'intel', 'domain', 'advisor', 'forensics', 'pattern'] },
  { id: 'planning', label: 'Planning', labelZh: '制定计划',
    description: '将需求拆分为原子任务，制定详细实施计划',
    keywords: ['plan', 'design', 'architect', 'spec', 'roadmap', 'milestone', 'framework-select', 'estimate'] },
  { id: 'execution', label: 'Execution', labelZh: '执行实现',
    description: '按计划逐波执行原子任务，编写代码和测试',
    keywords: ['execute', 'implement', 'build', 'code', 'task', 'fix', 'debug', 'undo', 'phase'] },
  { id: 'verification', label: 'Verification', labelZh: '验证交付',
    description: '审查代码质量、安全性，验证功能完整性',
    keywords: ['verify', 'test', 'review', 'audit', 'validate', 'check', 'secure', 'uat', 'health', 'progress', 'stats', 'report', 'cleanup'] },
];

// ─── 仓库获取 ──────────────────────────────────────────────────────────────────

function ensureRepo() {
  if (fs.existsSync(path.join(CACHE_DIR, '.git'))) {
    console.log('✓ 仓库已存在，拉取最新代码...');
    try {
      execSync('git pull --ff-only', { cwd: CACHE_DIR, stdio: 'pipe' });
      console.log('  已更新到最新');
    } catch (e) {
      console.warn('  ⚠️ git pull 失败，使用本地缓存继续');
    }
  } else {
    console.log('⏳ 克隆仓库...');
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    execSync(`git clone --depth 1 ${REPO_URL} ${CACHE_DIR}`, { stdio: 'inherit' });
    console.log('✓ 克隆完成');
  }
}

// ─── 解析工具 ──────────────────────────────────────────────────────────────────

/**
 * 解析 YAML frontmatter，返回 { fm, body }
 * 支持多行值（如 tools 数组）
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fm: {}, body: content.trim() };

  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = null;

  for (const line of lines) {
    // 数组项（以 - 开头，前面有空格）
    if (/^\s+-\s/.test(line) && currentKey) {
      const val = line.replace(/^\s+-\s*/, '').trim();
      if (!Array.isArray(fm[currentKey])) {
        fm[currentKey] = [];
      }
      fm[currentKey].push(val);
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) continue;

    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    val = val.replace(/^["']|["']$/g, '');
    currentKey = key;

    if (val === '' || val === '|') {
      // 可能是多行值或数组，先设为空字符串
      fm[key] = val === '|' ? '' : val;
    } else {
      fm[key] = val;
    }
  }

  return { fm, body: match[2].trim() };
}

/**
 * 从 hook 文件头部注释提取描述
 */
function extractHookDescription(content, fileType) {
  if (fileType === 'js') {
    // 提取 // 或 /* */ 注释
    const singleLine = content.match(/^\/\/\s*(.+)/m);
    const multiLine = content.match(/^\/\*\*?\s*\n?\s*\*?\s*(.+)/m);
    if (multiLine) return multiLine[1].replace(/\*\/\s*$/, '').trim();
    if (singleLine) return singleLine[1].trim();
  } else if (fileType === 'sh') {
    // 提取 # 注释（跳过 shebang）
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('#!')) continue; // shebang
      if (line.startsWith('#')) {
        const desc = line.replace(/^#+\s*/, '').trim();
        if (desc) return desc;
      }
      if (line.trim() && !line.startsWith('#')) break;
    }
  }
  return '';
}

// ─── 阶段归类 ──────────────────────────────────────────────────────────────────

/**
 * 根据 id、name、description 中的关键词将组件归入阶段
 */
function classifyPhase(item) {
  const text = `${item.id} ${item.name || ''} ${item.description || ''}`.toLowerCase();

  let bestPhase = null;
  let bestScore = 0;

  for (const phase of PHASES) {
    let score = 0;
    for (const kw of phase.keywords) {
      if (text.includes(kw)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPhase = phase.id;
    }
  }

  return bestPhase;
}

// ─── 读取组件 ──────────────────────────────────────────────────────────────────

function readAgents() {
  const dir = path.join(CACHE_DIR, 'agents');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const id = path.basename(file, '.md');
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);

      // tools 可能是数组或逗号分隔字符串
      let tools = fm.tools || [];
      if (typeof tools === 'string') {
        tools = tools.split(',').map(t => t.trim()).filter(Boolean);
      }

      return {
        id,
        type: 'agent',
        name: fm.name || id,
        description: fm.description || '',
        tools,
        color: fm.color || '',
        spawnedBy: fm.spawned_by || fm['spawned-by'] || '',
        phase: null, // 后续归类
        raw: body,
        zh: null,    // 后续合并
      };
    });
}

function readCommands() {
  const dir = path.join(CACHE_DIR, 'commands', 'gsd');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const id = path.basename(file, '.md');
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);

      // allowed-tools 可能是数组或逗号分隔字符串
      let allowedTools = fm['allowed-tools'] || fm.allowedTools || [];
      if (typeof allowedTools === 'string') {
        allowedTools = allowedTools.split(',').map(t => t.trim()).filter(Boolean);
      }

      return {
        id,
        type: 'command',
        name: fm.name || id,
        description: fm.description || '',
        argumentHint: fm['argument-hint'] || fm.argumentHint || '',
        allowedTools: allowedTools,
        agent: fm.agent || '',
        phase: null,
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
      const ext = path.extname(file).slice(1); // 'js' 或 'sh'
      const id = path.basename(file, path.extname(file));
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const description = extractHookDescription(content, ext);

      return {
        id,
        type: 'hook',
        name: id,
        description,
        fileType: ext,
        raw: content,
        zh: null,
      };
    });
}

// ─── 读取版本号 ────────────────────────────────────────────────────────────────

function readVersion() {
  const pkgPath = path.join(CACHE_DIR, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }
  return 'unknown';
}

// ─── 主程序 ───────────────────────────────────────────────────────────────────

function main() {
  // 1. 获取仓库
  ensureRepo();

  const version = readVersion();
  console.log(`✓ GSD 版本: v${version}`);

  // 2. 读取翻译缓存
  const cacheFile = path.join(__dirname, 'zh-cache.json');
  let zhCache = {};
  if (fs.existsSync(cacheFile)) {
    try {
      zhCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      console.log(`  已加载翻译缓存：${Object.keys(zhCache).length} 条`);
    } catch (e) {
      console.warn(`  ⚠️ zh-cache.json 解析失败，跳过缓存：${e.message}`);
    }
  }
  const getCached = (type, id) => zhCache[`${type}:${id}`] || null;

  // 3. 解析组件
  console.log('  读取 Agents...');
  const agents = readAgents();
  console.log(`    找到 ${agents.length} 个 agents`);

  console.log('  读取 Commands...');
  const commands = readCommands();
  console.log(`    找到 ${commands.length} 个 commands`);

  console.log('  读取 Hooks...');
  const hooks = readHooks();
  console.log(`    找到 ${hooks.length} 个 hooks`);

  // 4. 合并翻译
  for (const a of agents) {
    a.zh = getCached('agent', a.id);
  }
  for (const c of commands) {
    c.zh = getCached('command', c.id);
  }
  for (const h of hooks) {
    h.zh = getCached('hook', h.id);
  }

  // 5. 阶段归类
  for (const a of agents) {
    a.phase = classifyPhase(a);
  }
  for (const c of commands) {
    c.phase = classifyPhase(c);
  }

  // 按阶段分组
  const phases = PHASES.map(p => ({
    id: p.id,
    label: p.label,
    labelZh: p.labelZh,
    description: p.description,
    keywords: p.keywords,
    commands: commands.filter(c => c.phase === p.id),
    agents: agents.filter(a => a.phase === p.id),
  }));

  const uncategorized = {
    commands: commands.filter(c => c.phase === null),
    agents: agents.filter(a => a.phase === null),
  };

  // 统计归类情况
  const totalCategorized = commands.filter(c => c.phase).length + agents.filter(a => a.phase).length;
  const total = commands.length + agents.length;
  const pct = total > 0 ? ((totalCategorized / total) * 100).toFixed(1) : 0;
  console.log(`\n  阶段归类：${totalCategorized}/${total} (${pct}%)`);
  for (const p of phases) {
    console.log(`    ${p.labelZh}: ${p.commands.length} commands, ${p.agents.length} agents`);
  }
  console.log(`    未归类: ${uncategorized.commands.length} commands, ${uncategorized.agents.length} agents`);

  // 6. 输出 data.js
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

  const outputPath = path.join(__dirname, 'data.js');
  const js = `// 由 generate.js 自动生成 — ${data.meta.generatedAt}\n// GSD v${version}\nwindow.GSD_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outputPath, js, 'utf8');

  console.log(`\n✅ 生成完成：${outputPath}`);
  console.log(`   Agents:   ${agents.length}`);
  console.log(`   Commands: ${commands.length}`);
  console.log(`   Hooks:    ${hooks.length}`);
  console.log('\n💡 用浏览器打开 gsd-explorer/index.html 即可查看');
}

main();
