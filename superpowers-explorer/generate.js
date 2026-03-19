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

function extractSection(body, type) {
  if (type === 'whenToUse') {
    // 提取 ## When to Use 段落
    const re = /(?:^|\n)##\s+When to Use\s*\n([\s\S]*?)(?=\n##\s|$)/i;
    const m = body.match(re);
    return m ? m[1].trim() : '';
  }
  if (type === 'hardGate') {
    // 提取 <HARD-GATE>...</HARD-GATE> 块
    const re = /<HARD-GATE>([\s\S]*?)<\/HARD-GATE>/i;
    const m = body.match(re);
    return m ? m[1].trim() : '';
  }
  return '';
}

// ─── 内置中文描述（无需 DeepSeek API）────────────────────────────────────────

const ZH_BUILTIN = {
  'brainstorming': {
    summary: '在任何开发工作开始前，通过对话探索用户意图、需求和设计方案，将模糊想法转化为具体规格。',
    keyPoints: ['必须在写代码前调用', '一次只问一个澄清问题', '提出 2-3 个方案并给出推荐', '形成设计文档后才能开始实现'],
    whenToUse: '在创建新功能、组件、添加行为或修改任何现有功能之前调用。',
    tips: '不要跳过此步骤——即使是"简单"的功能也需要设计确认，避免返工。',
  },
  'writing-plans': {
    summary: '将需求规格转化为详细的实施计划，每个任务细化到 2-5 分钟的步骤，并遵循 TDD、DRY、YAGNI 原则。',
    keyPoints: ['先规划文件结构和职责边界', '每步骤写明精确的文件路径和测试命令', '计划内含完整代码示例', '经计划审查 agent 校验后再执行'],
    whenToUse: '拥有需求规格或多步骤任务时，在动手写代码之前调用。',
    tips: '将计划保存到 docs/superpowers/plans/，然后用 subagent-driven-development 执行。',
  },
  'using-git-worktrees': {
    summary: '为功能开发创建隔离的 git worktree，避免污染当前工作区，支持并行开发多个分支。',
    keyPoints: ['自动选择合适的目录', '执行计划前建议先创建 worktree', '包含安全验证步骤', '完成后由 finishing-a-development-branch 清理'],
    whenToUse: '开始需要与当前工作区隔离的功能开发，或在执行实施计划前调用。',
    tips: '与 subagent-driven-development 配合使用，保持主工作区干净。',
  },
  'subagent-driven-development': {
    summary: '通过为每个任务派发独立子 agent 执行计划，每次任务完成后进行规格合规审查和代码质量审查两阶段把关。',
    keyPoints: ['每任务一个新鲜子 agent（不继承上下文）', '实现 → 规格审查 → 质量审查 三阶段', '子 agent 可在开始前提问', '审查不通过则循环修复'],
    whenToUse: '拥有实施计划且任务基本独立时，在同一 session 内执行。',
    tips: '比手动执行质量更高，因为子 agent 有全新上下文，不会被历史干扰。',
  },
  'executing-plans': {
    summary: '跨 session 分批执行实施计划，每批次完成后暂停等待人工审查，适合长期或需要人工检查点的任务。',
    keyPoints: ['按批次执行，每批暂停审查', '适合跨 session 的长期任务', '与 subagent-driven-development 互为替代', '支持从中断处继续'],
    whenToUse: '需要在独立 session 中执行计划，或需要人工审查检查点时调用。',
    tips: '如果任务可以在当前 session 完成，优先选用 subagent-driven-development。',
  },
  'dispatching-parallel-agents': {
    summary: '将 2 个以上相互独立的任务同时派发给多个子 agent 并行处理，显著提升执行效率。',
    keyPoints: ['任务必须无共享状态、无顺序依赖', '汇总所有结果后再继续', '适合测试、分析等可并行的工作', '避免文件写入冲突'],
    whenToUse: '面对 2 个以上可独立完成、无状态共享的任务时调用。',
    tips: '先确认任务真正独立——有依赖关系的任务并行会导致冲突。',
  },
  'test-driven-development': {
    summary: '先写失败的测试，再写最小实现使测试通过，最后重构，确保每次提交都有测试覆盖。',
    keyPoints: ['红 → 绿 → 重构 三步骤', '先运行测试确认它确实失败', '只写让测试通过的最小代码', '目标 80%+ 覆盖率'],
    whenToUse: '实现任何功能或修复 bug 时调用，在写实现代码之前。',
    tips: '子 agent 在执行 subagent-driven-development 任务时应自然遵循此工作流。',
  },
  'requesting-code-review': {
    summary: '在提交或合并前，系统化地请求代码审查，提供完整上下文让审查者能高效评估变更。',
    keyPoints: ['列出所有变更文件和意图', '提供测试结果证据', '标注需要特别关注的部分', '在声明完成之前调用'],
    whenToUse: '完成任务实现、实现重要功能、或在合并之前调用。',
    tips: '提供 git diff 和测试输出，让审查者无需猜测上下文。',
  },
  'receiving-code-review': {
    summary: '收到代码审查反馈后，以技术严谨性处理每条意见——验证后再实施，不盲目同意。',
    keyPoints: ['先理解再实施', '技术上有异议时提出质疑', '不做表演性同意', '每条反馈都需技术验证'],
    whenToUse: '收到代码审查反馈，尤其是反馈不清晰或技术上存疑时调用。',
    tips: '批判性思考比顺从更有价值——如果反馈有误，礼貌地说明原因。',
  },
  'verification-before-completion': {
    summary: '在声明工作完成之前，实际运行验证命令并确认输出，禁止在未验证的情况下宣称成功。',
    keyPoints: ['必须运行真实命令，不能假设', '看到实际输出才能声明通过', '提交或创建 PR 前必须调用', '证据优先于断言'],
    whenToUse: '即将声明工作完成、修复成功或测试通过时，在提交或创建 PR 之前调用。',
    tips: '这是防止"假完成"的关键门控——没有跑过命令就不算完成。',
  },
  'finishing-a-development-branch': {
    summary: '实现完成后引导完成工作：验证测试 → 呈现四个选项（本地合并/PR/保留/丢弃）→ 执行选择 → 清理 worktree。',
    keyPoints: ['先验证测试通过再展示选项', '精确呈现 4 个结构化选项', '选项 1/4 清理 worktree，选项 2/3 保留', '丢弃前需输入 "discard" 确认'],
    whenToUse: '所有任务实现完成、测试通过，需要决定如何整合工作时调用。',
    tips: '跳过测试验证是最常见的错误——即使"看起来能工作"也要跑一遍。',
  },
  'systematic-debugging': {
    summary: '遇到任何 bug 或意外行为时，通过系统化的根因分析找到真正原因，而不是猜测和瞎试。',
    keyPoints: ['先理解问题再提出假设', '一次只测试一个假设', '从错误信息出发而不是猜测', '找到根因后再修复'],
    whenToUse: '遇到任何 bug、测试失败或意外行为时，在提出修复方案之前调用。',
    tips: '抵制"先改改看"的冲动——系统化调试比盲目尝试节省 80% 的时间。',
  },
  'writing-skills': {
    summary: '创建新的 Superpowers skill 文件，包括编写 SKILL.md 规格、测试 skill 在真实场景中的效果、迭代改进。',
    keyPoints: ['先分析现有 skill 的模式', '明确 skill 的触发时机和核心流程', '包含 HARD GATE 规则（如需要）', '在真实场景中测试后再部署'],
    whenToUse: '需要创建新 skill、编辑现有 skill，或在部署前验证 skill 是否正常工作时调用。',
    tips: '好的 skill 需要明确说明"何时不用"——边界和触发条件同样重要。',
  },
  'using-superpowers': {
    summary: 'Superpowers 入门指南：建立如何查找和使用 skill 的工作规范，要求在任何响应前先调用 Skill 工具检查是否有适用的 skill。',
    keyPoints: ['每次对话开始时自动加载', 'skill 适用时必须调用，不可跳过', '有 1% 的可能适用就要检查', '用户指令优先于 skill 指令'],
    whenToUse: '每次对话开始时自动调用，建立 skill 使用的基础规范。',
    tips: '"这太简单了不需要 skill" 是最常见的错误——只要有 skill 就必须调用。',
  },
};

// commands 和 agents 的中文描述
const ZH_COMMANDS = {
  'plan-ceo-review': {
    summary: 'CEO/创始人视角的计划审查：用 10 倍思维挑战计划边界，支持四种模式（扩展/选择性扩展/保持范围/缩减），逐条确认每个范围决策。',
    keyPoints: ['支持 SCOPE_EXPANSION、SELECTIVE_EXPANSION、HOLD_SCOPE、SCOPE_REDUCTION 四种模式', '逐节审查架构、错误处理、安全、测试、性能、可观测性等', '每个问题单独提问，不批量处理', '输出 CEO 计划文档并保存到本地'],
    whenToUse: '在规划新功能、重大产品决策或架构变更时，对实施计划进行全面审查。',
    tips: '选择 SCOPE_EXPANSION 模式获得最完整的审查体验。',
  },
  'plan-eng-review': {
    summary: '工程经理视角的计划审查：锁定工程细节，确保架构合理、测试充分、错误处理完善、部署安全。',
    keyPoints: ['专注工程质量而非产品范围', '审查架构、错误处理、测试、性能、安全', '输出审查日志供后续参考', '与 plan-ceo-review 互补'],
    whenToUse: '在执行实施计划前，需要从工程角度确认技术方案的合理性时调用。',
    tips: '与 plan-ceo-review 配合使用，形成产品 + 工程的双重把关。',
  },
};

const ZH_AGENTS = {
  'code-quality-reviewer': {
    summary: '代码质量审查 agent：评估代码的可读性、可维护性、边界处理和测试质量，给出明确的通过/不通过结论。',
    keyPoints: ['由 subagent-driven-development 自动调用', '审查代码质量，不审查功能规格', '给出强项和待改进项', '不通过则触发修复循环'],
    whenToUse: '由 subagent-driven-development 在规格审查通过后自动调用，不需要手动触发。',
    tips: '永远不要跳过代码质量审查——它是防止技术债的最后一道门控。',
  },
};

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
            whenToUse: extractSection(body, 'whenToUse'),
            hardGate: extractSection(body, 'hardGate'),
            keywords: SCENARIO_KEYWORDS[dir] || [],
            raw: body,
            zh: getCached('skill', dir) || ZH_BUILTIN[dir] || null,
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
            zh: getCached('command', id) || ZH_COMMANDS[id] || null,
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
            zh: getCached('agent', id) || ZH_AGENTS[id] || null,
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
