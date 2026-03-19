#!/usr/bin/env node
/**
 * Superpowers Explorer 数据生成脚本
 * 读取 superpowers 插件目录，生成可视化用的 data.js
 *
 * 用法：node superpowers-explorer/generate.js
 * 输出：superpowers-explorer/data.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── 路径探测 ───────────────────────────────────────────────────────────────

function findSPBase() {
  const pluginCache = path.join(
    os.homedir(),
    '.claude/plugins/cache/superpowers-marketplace/superpowers'
  );
  if (!fs.existsSync(pluginCache)) {
    console.error(`❌ 找不到 Superpowers 目录：${pluginCache}`);
    process.exit(1);
  }
  const versions = fs.readdirSync(pluginCache)
    .filter(v => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!versions.length) {
    console.error('❌ 找不到 Superpowers 版本目录');
    process.exit(1);
  }
  const latest = versions[versions.length - 1];
  console.log(`✓ 找到 Superpowers v${latest}`);
  return { base: path.join(pluginCache, latest), version: latest };
}

// ─── 解析工具 ────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fm: {}, body: content.trim() };
  const fm = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    val = val.replace(/^["']|["']$/g, '');
    fm[key] = val;
  });
  return { fm, body: match[2].trim() };
}

function extractSection(body, heading) {
  // 提取 ## When to Use 或 # HARD GATE 部分
  const re = new RegExp(`(?:^|\\n)(?:##?\\s+(?:When to Use|HARD.GATE)[^\\n]*)\\n([\\s\\S]*?)(?=\\n##?\\s|$)`, 'i');
  const m = body.match(re);
  return m ? m[1].trim() : '';
}

// ─── 工作流数据（手工维护）────────────────────────────────────────────────────

const WORKFLOW_NODES = [
  { id: 'brainstorming',                 label: 'brainstorming',                 type: 'main' },
  { id: 'writing-plans',                 label: 'writing-plans',                 type: 'main' },
  { id: 'using-git-worktrees',           label: 'using-git-worktrees',           type: 'support' },
  { id: 'subagent-driven-development',   label: 'subagent-driven-development',   type: 'main' },
  { id: 'executing-plans',               label: 'executing-plans',               type: 'alt' },
  { id: 'dispatching-parallel-agents',   label: 'dispatching-parallel-agents',   type: 'support' },
  { id: 'test-driven-development',       label: 'test-driven-development',       type: 'support' },
  { id: 'requesting-code-review',        label: 'requesting-code-review',        type: 'main' },
  { id: 'receiving-code-review',         label: 'receiving-code-review',         type: 'alt' },
  { id: 'verification-before-completion',label: 'verification-before-completion',type: 'main' },
  { id: 'finishing-a-development-branch',label: 'finishing-a-development-branch',type: 'main' },
  { id: 'systematic-debugging',          label: 'systematic-debugging',          type: 'debug' },
  { id: 'writing-skills',                label: 'writing-skills',                type: 'support' },
  { id: 'using-superpowers',             label: 'using-superpowers',             type: 'meta' },
];

const WORKFLOW_EDGES = [
  // 黄金路径
  { from: 'brainstorming',              to: 'writing-plans',                  label: '有设计方案后', type: 'main' },
  { from: 'writing-plans',              to: 'subagent-driven-development',    label: '独立任务',     type: 'main' },
  { from: 'writing-plans',              to: 'executing-plans',                label: '跨 session',  type: 'alt' },
  { from: 'subagent-driven-development',to: 'requesting-code-review',         label: '实现完成',     type: 'main' },
  { from: 'requesting-code-review',     to: 'verification-before-completion', label: '审查通过',     type: 'main' },
  { from: 'verification-before-completion', to: 'finishing-a-development-branch', label: '验证通过', type: 'main' },
  // 支线
  { from: 'brainstorming',              to: 'using-git-worktrees',            label: '需要隔离',     type: 'support' },
  { from: 'subagent-driven-development',to: 'dispatching-parallel-agents',    label: '任务独立',     type: 'support' },
  { from: 'requesting-code-review',     to: 'receiving-code-review',          label: '收到反馈',     type: 'support' },
  { from: 'subagent-driven-development',to: 'test-driven-development',        label: 'TDD 嵌入',     type: 'support' },
  // 调试支线
  { from: 'systematic-debugging',       to: 'requesting-code-review',         label: '修复完成',     type: 'debug' },
];

// ─── 情景关键词映射（情景推荐引擎）──────────────────────────────────────────

const SCENARIO_KEYWORDS = {
  'systematic-debugging':           ['debug', 'bug', '调试', '报错', '排查', 'fix', '修复', 'error', 'fail', 'broken', 'test fail', '测试失败', '不工作'],
  'brainstorming':                  ['设计', 'design', '新功能', 'feature', '想法', 'idea', '计划', 'plan', '构思', '需求', '要做什么', '怎么做'],
  'writing-plans':                  ['实施计划', 'implementation', '任务拆分', 'breakdown', '计划文档', 'plan doc', '写计划'],
  'subagent-driven-development':    ['执行', 'execute', '实现', 'implement', '开始写代码', 'start coding', '子 agent'],
  'executing-plans':                ['执行计划', 'execute plan', '跨 session', 'cross session'],
  'test-driven-development':        ['测试', 'test', 'tdd', '单元测试', 'unit test', '先写测试'],
  'requesting-code-review':         ['code review', '代码审查', 'pr', '提交', 'merge', '审查', 'review', '代码质量'],
  'receiving-code-review':          ['收到反馈', 'got feedback', '审查意见', 'review comments', '怎么回应'],
  'verification-before-completion': ['验证', 'verify', '完成', 'done', 'complete', '测试通过', 'check'],
  'finishing-a-development-branch': ['合并', 'merge', 'ship', '发布', 'release', '完成功能', 'close branch', '结束分支'],
  'using-git-worktrees':            ['worktree', 'git worktree', '隔离', 'isolation', '并行开发'],
  'dispatching-parallel-agents':    ['并行', 'parallel', '多个任务', 'multiple tasks', '同时做'],
  'writing-skills':                 ['写 skill', 'create skill', '新建技能', '自定义技能'],
  'using-superpowers':              ['怎么用', 'how to use', '开始', 'start', '入门', 'getting started'],
};

// ─── 主程序 ───────────────────────────────────────────────────────────────────

function main() {
  const { base, version } = findSPBase();

  // 读取翻译缓存
  const cacheFile = path.join(__dirname, 'zh-cache.json');
  let zhCache = {};
  if (fs.existsSync(cacheFile)) {
    try {
      zhCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (e) {
      console.warn(`  ⚠️ zh-cache.json 解析失败，跳过缓存：${e.message}`);
    }
  }
  const getCached = (type, id) => zhCache[`${type}:${id}`] || null;
  if (Object.keys(zhCache).length > 0) {
    console.log(`  已加载翻译缓存：${Object.keys(zhCache).length} 条`);
  }

  // 读取 Skills
  console.log('  读取 Skills...');
  const skillsDir = path.join(base, 'skills');
  const skills = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir)
        .filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory())
        .map(dir => {
          const skillFile = path.join(skillsDir, dir, 'SKILL.md');
          if (!fs.existsSync(skillFile)) return null;
          const content = fs.readFileSync(skillFile, 'utf8');
          const { fm, body } = parseFrontmatter(content);
          return {
            id: dir,
            name: fm.name || dir,
            description: fm.description || '',
            whenToUse: extractSection(body, 'When to Use'),
            hardGate: extractSection(body, 'HARD GATE'),
            keywords: SCENARIO_KEYWORDS[dir] || [],
            raw: body,
            zh: getCached('skill', dir),
          };
        }).filter(Boolean)
    : [];

  // 读取 Commands
  console.log('  读取 Commands...');
  const commandsDir = path.join(base, 'commands');
  const commands = fs.existsSync(commandsDir)
    ? fs.readdirSync(commandsDir)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .map(file => {
          const id = path.basename(file, '.md');
          const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
          const { fm, body } = parseFrontmatter(content);
          return {
            id,
            name: fm.name || id,
            description: fm.description || '',
            raw: body,
            zh: getCached('command', id),
          };
        })
    : [];

  // 读取 Agents
  console.log('  读取 Agents...');
  const agentsDir = path.join(base, 'agents');
  const agents = fs.existsSync(agentsDir)
    ? fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.md'))
        .map(file => {
          const id = path.basename(file, '.md');
          const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
          const { fm, body } = parseFrontmatter(content);
          return {
            id,
            name: fm.name || id,
            description: fm.description || '',
            raw: body,
            zh: getCached('agent', id),
          };
        })
    : [];

  // 汇总
  const data = {
    meta: {
      version,
      generatedAt: new Date().toISOString().slice(0, 10),
      stats: {
        skills: skills.length,
        commands: commands.length,
        agents: agents.length,
      }
    },
    skills,
    commands,
    agents,
    workflow: { nodes: WORKFLOW_NODES, edges: WORKFLOW_EDGES },
  };

  // 输出 data.js
  const outputPath = path.join(__dirname, 'data.js');
  const js = `// 由 generate.js 自动生成 — ${data.meta.generatedAt}\n// Superpowers v${version}\nwindow.SP_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outputPath, js, 'utf8');

  console.log(`\n✅ 生成完成：${outputPath}`);
  console.log(`   Skills:   ${skills.length}`);
  console.log(`   Commands: ${commands.length}`);
  console.log(`   Agents:   ${agents.length}`);
  console.log('\n💡 用浏览器打开 superpowers-explorer/index.html 即可查看');
}

main();
