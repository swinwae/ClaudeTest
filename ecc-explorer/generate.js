#!/usr/bin/env node
/**
 * ECC Explorer 数据生成脚本
 * 读取 everything-claude-code 所有组件，生成可视化用的 data.js
 *
 * 用法：node generate.js
 * 输出：data.js（可直接被 index.html 引用）
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── 路径探测 ───────────────────────────────────────────────────────────────

function findECCBase() {
  const pluginCache = path.join(
    os.homedir(),
    '.claude/plugins/cache/everything-claude-code/everything-claude-code'
  );
  if (!fs.existsSync(pluginCache)) {
    throw new Error(`找不到 ECC 目录：${pluginCache}`);
  }
  const versions = fs.readdirSync(pluginCache)
    .filter(v => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!versions.length) throw new Error('找不到 ECC 版本目录');
  const latest = versions[versions.length - 1];
  console.log(`✓ 找到 ECC v${latest}`);
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
    if (val.startsWith('[') && val.endsWith(']')) {
      try { val = JSON.parse(val); } catch { val = []; }
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    fm[key] = val;
  });
  return { fm, body: match[2].trim() };
}

function readMdDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      return { id: path.basename(file, '.md'), fm, body };
    });
}

// ─── 中文翻译映射 ─────────────────────────────────────────────────────────────

const AGENT_ZH = {
  'planner':              { name: '规划专家',       desc: '复杂功能实施方案制定，将需求拆解为可操作步骤', tags: ['规划', '架构', '分析'], when: '请求功能实现、架构变更或复杂重构时自动激活', tip: '制定计划后必须等待用户确认才能写代码' },
  'architect':            { name: '架构师',         desc: '系统设计与重大技术决策，评估可扩展性与权衡方案', tags: ['架构', '设计', '决策'], when: '规划新功能、重构大型系统或做架构选型时使用', tip: '与 planner 配合：planner 做步骤，architect 做整体设计' },
  'code-reviewer':        { name: '代码审查员',     desc: '代码质量、安全和可维护性审查，写完代码后立即使用', tags: ['质量', '安全', '代码审查'], when: '写完或修改代码后主动使用', tip: '有 CRITICAL 问题必须修复才能合并' },
  'build-error-resolver': { name: '构建错误修复专家', desc: '修复编译、构建、类型错误，最小化改动快速让构建变绿', tags: ['构建', '修复', 'TypeScript'], when: '构建失败或出现类型错误时使用', tip: '只修复错误，不做架构改动' },
  'e2e-runner':           { name: 'E2E 测试专家',  desc: 'Playwright 端到端测试生成与运行，确保关键用户流程正常', tags: ['测试', 'Playwright', 'E2E'], when: '为关键用户流程生成、维护或运行 E2E 测试时使用', tip: '优先用 Vercel Agent Browser，Playwright 作备选' },
  'tdd-guide':            { name: 'TDD 专家',       desc: '测试驱动开发，强制先写测试再写实现，确保 80%+ 覆盖率', tags: ['测试', 'TDD', '质量'], when: '写新功能、修 Bug 或重构代码时使用', tip: '红 → 绿 → 重构的严格工作流' },
  'refactor-cleaner':     { name: '重构清理专家',   desc: '死代码清理与整合，运行 knip/depcheck/ts-prune 找并删除无用代码', tags: ['重构', '清理', '优化'], when: '需要删除未使用代码、去重或重构时使用', tip: '安全删除，不做功能改动' },
  'security-reviewer':    { name: '安全审查员',     desc: '漏洞检测与修复，覆盖 OWASP Top 10、注入、XSS 等', tags: ['安全', 'OWASP', '漏洞'], when: '处理用户输入、认证、API 端点或敏感数据后使用', tip: '发现 CRITICAL 问题时必须立即修复' },
  'doc-updater':          { name: '文档更新专家',   desc: '文档与代码图谱更新，运行 /update-codemaps 和 /update-docs', tags: ['文档', 'README', 'Codemaps'], when: '更新文档、生成 API 文档或维护代码图谱时使用', tip: '保持文档与代码同步' },
  'database-reviewer':    { name: '数据库专家',     desc: 'PostgreSQL 查询优化、Schema 设计、安全与性能', tags: ['数据库', 'PostgreSQL', '优化'], when: '写 SQL、创建迁移、设计 Schema 或数据库性能调优时使用', tip: '遵循 Supabase 最佳实践' },
  'kotlin-reviewer':      { name: 'Kotlin 审查员',  desc: 'Kotlin/Android/KMP 代码审查，协程安全、Compose 最佳实践', tags: ['Kotlin', 'Android', 'KMP'], when: '所有 Kotlin 代码变更后使用', tip: '检查 null 安全和协程正确性' },
  'kotlin-build-resolver':{ name: 'Kotlin 构建修复专家', desc: 'Kotlin/Gradle 构建错误和依赖问题修复', tags: ['Kotlin', 'Gradle', '构建'], when: 'Kotlin 构建失败时使用', tip: '最小化改动，不做架构变更' },
  'go-reviewer':          { name: 'Go 审查员',      desc: '惯用 Go、并发模式、错误处理和性能审查', tags: ['Go', '并发', '性能'], when: '所有 Go 代码变更后使用', tip: '检查 goroutine 泄漏和错误处理' },
  'go-build-resolver':    { name: 'Go 构建修复专家', desc: 'Go 构建错误、go vet 警告和 linter 问题修复', tags: ['Go', '构建', 'vet'], when: 'Go 构建失败时使用', tip: '最小化改动' },
  'python-reviewer':      { name: 'Python 审查员',  desc: 'PEP 8 合规、Pythonic 惯用法、类型提示、安全和性能', tags: ['Python', 'PEP8', '类型'], when: '所有 Python 代码变更后使用', tip: '检查类型注解完整性' },
  'chief-of-staff':       { name: '首席参谋',       desc: '邮件、Slack、LINE、Messenger 多渠道通信分类与草拟回复', tags: ['通信', 'Slack', '邮件'], when: '管理多渠道通信工作流时使用', tip: '4 级分类：跳过/仅信息/会议/需行动' },
  'harness-optimizer':    { name: '评估优化专家',   desc: '分析和改进本地 Agent 配置，优化可靠性、成本和吞吐量', tags: ['优化', 'Agent', '配置'], when: '需要优化 Agent 配置时使用', tip: '与 /harness-audit 命令配合' },
  'loop-operator':        { name: '循环操作员',     desc: '操作自主 Agent 循环，监控进度，在循环卡住时安全介入', tags: ['循环', '自主', '监控'], when: '运行自主 Agent 循环时使用', tip: '循环卡住时使用此 Agent 介入' },
};

const COMMAND_ZH = {
  'plan':           { name: '规划', desc: '制定实施方案，等待确认后才写代码', usage: '/plan 我想添加用户认证功能' },
  'code-review':    { name: '代码审查', desc: '审查代码质量、安全与可维护性', usage: '/code-review' },
  'build-fix':      { name: '修复构建', desc: '修复构建和 TypeScript 错误', usage: '/build-fix' },
  'e2e':            { name: 'E2E 测试', desc: '生成并运行 Playwright E2E 测试', usage: '/e2e' },
  'tdd':            { name: 'TDD 开发', desc: '测试驱动开发工作流', usage: '/tdd 为登录功能写测试' },
  'eval':           { name: '评估', desc: '正式评估当前会话实现质量', usage: '/eval' },
  'evolve':         { name: '进化', desc: '分析 instincts 并生成进化结构', usage: '/evolve' },
  'skill-create':   { name: '创建技能', desc: '从本地 git 历史提取编码模式，生成 SKILL.md', usage: '/skill-create' },
  'learn-eval':     { name: '学习评估', desc: '从会话中提取可复用模式，自我评估质量', usage: '/learn-eval' },
  'save-session':   { name: '保存会话', desc: '保存当前会话状态到文件', usage: '/save-session' },
  'resume-session': { name: '恢复会话', desc: '从最近会话文件恢复工作', usage: '/resume-session' },
  'refactor-clean': { name: '清理重构', desc: '发现并安全删除死代码', usage: '/refactor-clean' },
  'go-build':       { name: 'Go 构建修复', desc: '修复 Go 构建错误和 vet 警告', usage: '/go-build' },
  'go-review':      { name: 'Go 代码审查', desc: '惯用 Go 代码审查', usage: '/go-review' },
  'go-test':        { name: 'Go TDD', desc: 'Go 测试驱动开发，表格驱动测试', usage: '/go-test' },
  'kotlin-build':   { name: 'Kotlin 构建修复', desc: '修复 Kotlin/Gradle 构建错误', usage: '/kotlin-build' },
  'kotlin-review':  { name: 'Kotlin 代码审查', desc: 'Kotlin 惯用法和协程审查', usage: '/kotlin-review' },
  'kotlin-test':    { name: 'Kotlin TDD', desc: 'Kotlin Kotest 测试驱动开发', usage: '/kotlin-test' },
  'gradle-build':   { name: 'Gradle 构建修复', desc: '修复 Android/KMP Gradle 构建', usage: '/gradle-build' },
  'python-review':  { name: 'Python 代码审查', desc: 'PEP 8 和类型提示审查', usage: '/python-review' },
  'update-docs':    { name: '更新文档', desc: '更新项目文档和 README', usage: '/update-docs' },
  'update-codemaps':{ name: '更新代码图谱', desc: '生成和更新 docs/CODEMAPS/', usage: '/update-codemaps' },
  'verify':         { name: '验证', desc: '运行项目的完整验证循环', usage: '/verify' },
  'checkpoint':     { name: '检查点', desc: '创建进度检查点，便于回溯', usage: '/checkpoint' },
  'aside':          { name: '快问', desc: '不打断主流程地快速问一个问题', usage: '/aside 这个模式叫什么名字？' },
  'prompt-optimize':{ name: '优化提示词', desc: '分析并优化提示词', usage: '/prompt-optimize' },
  'harness-audit':  { name: '评估 Harness', desc: '审计本地 agent harness 配置', usage: '/harness-audit' },
  'claw':           { name: 'NanoClaw REPL', desc: '启动零依赖的持久化 REPL 环境', usage: '/claw' },
  'loop-start':     { name: '启动循环', desc: '启动自主 Agent 循环', usage: '/loop-start' },
  'loop-status':    { name: '循环状态', desc: '查看当前 Agent 循环状态', usage: '/loop-status' },
  'orchestrate':    { name: '编排', desc: '编排多 Agent 并行工作流', usage: '/orchestrate' },
  'multi-plan':     { name: '多步规划', desc: '多 Agent 协作规划', usage: '/multi-plan' },
  'multi-backend':  { name: '多后端', desc: '多 Agent 后端并行开发', usage: '/multi-backend' },
  'multi-frontend': { name: '多前端', desc: '多 Agent 前端并行开发', usage: '/multi-frontend' },
  'multi-execute':  { name: '多执行', desc: '多 Agent 并行执行任务', usage: '/multi-execute' },
  'multi-workflow': { name: '多工作流', desc: '多 Agent 工作流编排', usage: '/multi-workflow' },
  'quality-gate':   { name: '质量门', desc: '运行质量门控检查', usage: '/quality-gate' },
  'test-coverage':  { name: '测试覆盖率', desc: '分析和提升测试覆盖率', usage: '/test-coverage' },
  'instinct-status':{ name: 'Instinct 状态', desc: '查看已学习的项目/全局 instincts', usage: '/instinct-status' },
  'instinct-export':{ name: '导出 Instincts', desc: '导出 instincts 到文件', usage: '/instinct-export' },
  'instinct-import':{ name: '导入 Instincts', desc: '从文件或 URL 导入 instincts', usage: '/instinct-import' },
  'promote':        { name: '提升 Instincts', desc: '将项目级 instincts 提升为全局级', usage: '/promote' },
  'sessions':       { name: '会话列表', desc: '列出所有已保存的会话', usage: '/sessions' },
  'projects':       { name: '项目列表', desc: '列出已知项目和 instinct 统计', usage: '/projects' },
  'setup-pm':       { name: '配置 PM2', desc: '配置 PM2 进程管理', usage: '/setup-pm' },
  'pm2':            { name: 'PM2 管理', desc: '管理 PM2 进程', usage: '/pm2' },
  'model-route':    { name: '模型路由', desc: '按任务成本路由到合适的模型', usage: '/model-route' },
};

const HOOK_ZH = {
  'session-start':        { name: '会话开始', trigger: 'SessionStart', desc: '会话启动时加载上下文，检测开发环境', profiles: ['minimal', 'standard', 'strict'] },
  'session-end':          { name: '会话结束', trigger: 'Stop', desc: '会话结束时持久化状态，生成会话摘要', profiles: ['minimal', 'standard', 'strict'] },
  'before-shell-execution':{ name: 'Shell 执行前', trigger: 'PreToolUse(Bash)', desc: '阻止未在 tmux 中运行 dev 服务器；git push 前提醒审查 diff', profiles: ['standard', 'strict'] },
  'after-shell-execution': { name: 'Shell 执行后', trigger: 'PostToolUse(Bash)', desc: '记录 PR URL 日志，分析构建输出', profiles: ['standard', 'strict'] },
  'after-file-edit':      { name: '文件编辑后', trigger: 'PostToolUse(Edit/Write)', desc: '自动格式化，TypeScript 类型检查，警告 console.log', profiles: ['standard', 'strict'] },
  'before-mcp-execution': { name: 'MCP 执行前', trigger: 'PreToolUse(MCP)', desc: 'MCP 调用审计日志，不可信服务器警告', profiles: ['standard', 'strict'] },
  'after-mcp-execution':  { name: 'MCP 执行后', trigger: 'PostToolUse(MCP)', desc: '记录 MCP 调用结果日志', profiles: ['standard', 'strict'] },
  'before-read-file':     { name: '读文件前', trigger: 'PreToolUse(Read)', desc: '检测并警告敏感文件访问（.env, .key, .pem）', profiles: ['standard', 'strict'] },
  'before-submit-prompt': { name: '提交提示词前', trigger: 'PreToolUse(SubmitPrompt)', desc: '扫描提示词中的 API Key 模式（sk-*, ghp_, AKIA*）', profiles: ['standard', 'strict'] },
  'before-tab-file-read': { name: 'Tab 读文件前', trigger: 'PreToolUse(Tab)', desc: '阻止 Tab 读取敏感文件', profiles: ['strict'] },
  'after-tab-file-edit':  { name: 'Tab 编辑后', trigger: 'PostToolUse(Tab)', desc: '自动格式化 Tab 编辑的文件', profiles: ['standard', 'strict'] },
  'pre-compact':          { name: '压缩前', trigger: 'PreCompact', desc: '上下文压缩前保存当前状态', profiles: ['minimal', 'standard', 'strict'] },
  'stop':                 { name: '停止时', trigger: 'Stop', desc: '检查已修改文件中的 console.log，评估会话，追踪成本', profiles: ['minimal', 'standard', 'strict'] },
  'subagent-start':       { name: 'Subagent 启动', trigger: 'AgentStart', desc: '记录子 Agent 生成日志', profiles: ['standard', 'strict'] },
  'subagent-stop':        { name: 'Subagent 停止', trigger: 'AgentStop', desc: '记录子 Agent 完成日志', profiles: ['standard', 'strict'] },
  'adapter':              { name: '适配器', trigger: '内部', desc: 'Cursor 格式到 Claude 格式转换，Hook 启用状态检查', profiles: ['internal'] },
};

const RULE_ZH = {
  'common-agents':             { name: 'Agent 编排', lang: '通用', desc: '可用 Agent 列表、并行执行、多视角分析模式', key: '何时使用哪个 Agent，如何并行执行' },
  'common-coding-style':       { name: '编码风格', lang: '通用', desc: '代码风格指南：命名、格式、注释规范', key: '保持代码库风格一致' },
  'common-development-workflow':{ name: '开发工作流', lang: '通用', desc: '标准开发工作流：功能分支、PR 流程', key: '标准化团队协作流程' },
  'common-git-workflow':       { name: 'Git 工作流', lang: '通用', desc: 'Git 提交规范、分支策略、rebase vs merge', key: '干净的 Git 历史' },
  'common-hooks':              { name: 'Hook 系统', lang: '通用', desc: 'Hook 类型说明、权限控制、TodoWrite 最佳实践', key: '理解 Hook 生命周期' },
  'common-patterns':           { name: '通用模式', lang: '通用', desc: '跨语言通用设计模式和最佳实践', key: '可复用的设计模式' },
  'common-performance':        { name: '性能优化', lang: '通用', desc: '性能优化原则：缓存、懒加载、批处理', key: '发现和修复性能瓶颈' },
  'common-security':           { name: '安全实践', lang: '通用', desc: '安全编码实践：输入验证、认证、加密', key: '避免常见安全漏洞' },
  'common-testing':            { name: '测试最佳实践', lang: '通用', desc: '测试策略：单元、集成、E2E 测试层次', key: '构建可靠的测试套件' },
};

// 语言特定规则
['golang', 'kotlin', 'php', 'python', 'swift', 'typescript'].forEach(lang => {
  const langDisplay = { golang: 'Go', kotlin: 'Kotlin', php: 'PHP', python: 'Python', swift: 'Swift', typescript: 'TypeScript' }[lang];
  RULE_ZH[`${lang}-coding-style`] = { name: `${langDisplay} 编码风格`, lang: langDisplay, desc: `${langDisplay} 语言特定编码规范和惯用法`, key: `${langDisplay} 最佳代码风格` };
  RULE_ZH[`${lang}-hooks`]        = { name: `${langDisplay} Hook 规则`, lang: langDisplay, desc: `${langDisplay} 项目专用 Hook 配置和约定`, key: `${langDisplay} 项目 Hook 集成` };
  RULE_ZH[`${lang}-patterns`]     = { name: `${langDisplay} 设计模式`, lang: langDisplay, desc: `${langDisplay} 惯用设计模式和架构实践`, key: `${langDisplay} 最佳架构模式` };
  RULE_ZH[`${lang}-security`]     = { name: `${langDisplay} 安全规则`, lang: langDisplay, desc: `${langDisplay} 语言和框架特定安全实践`, key: `${langDisplay} 安全漏洞防范` };
  RULE_ZH[`${lang}-testing`]      = { name: `${langDisplay} 测试规则`, lang: langDisplay, desc: `${langDisplay} 测试框架和策略`, key: `${langDisplay} 测试最佳实践` };
});

// Skill 分类映射
const SKILL_CATEGORIES = {
  'agentic-engineering':          { cat: 'AI & 自动化', zh: '自主 Agent 工程' },
  'ai-first-engineering':         { cat: 'AI & 自动化', zh: 'AI 优先工程实践' },
  'agent-harness-construction':   { cat: 'AI & 自动化', zh: 'Agent 动作空间设计' },
  'autonomous-loops':             { cat: 'AI & 自动化', zh: '自主循环架构模式' },
  'continuous-agent-loop':        { cat: 'AI & 自动化', zh: '持续 Agent 循环质量门' },
  'continuous-learning':          { cat: 'AI & 自动化', zh: '会话模式自动提取' },
  'continuous-learning-v2':       { cat: 'AI & 自动化', zh: '基于 Instinct 的学习系统' },
  'cost-aware-llm-pipeline':      { cat: 'AI & 自动化', zh: 'LLM 成本优化路由' },
  'enterprise-agent-ops':         { cat: 'AI & 自动化', zh: '企业级 Agent 运维' },
  'eval-harness':                 { cat: 'AI & 自动化', zh: '正式评估框架' },
  'iterative-retrieval':          { cat: 'AI & 自动化', zh: '渐进式上下文检索' },
  'loop-operator':                { cat: 'AI & 自动化', zh: '循环操作员模式' },
  'nanoclaw-repl':                { cat: 'AI & 自动化', zh: 'NanoClaw REPL 操作' },
  'prompt-optimizer':             { cat: 'AI & 自动化', zh: '提示词优化器' },
  'ralphinho-rfc-pipeline':       { cat: 'AI & 自动化', zh: 'RFC 驱动多 Agent DAG' },
  'search-first':                 { cat: 'AI & 自动化', zh: '研究优先工作流' },
  'verification-loop':            { cat: 'AI & 自动化', zh: '会话验证系统' },
  'claude-api':                   { cat: 'AI & 自动化', zh: 'Claude API 集成模式' },
  'api-design':                   { cat: '后端开发', zh: 'REST API 设计规范' },
  'backend-patterns':             { cat: '后端开发', zh: '后端架构模式' },
  'database-migrations':          { cat: '后端开发', zh: '数据库迁移最佳实践' },
  'deployment-patterns':          { cat: '后端开发', zh: '部署和 CI/CD 模式' },
  'docker-patterns':              { cat: '后端开发', zh: 'Docker 容器化模式' },
  'jpa-patterns':                 { cat: '后端开发', zh: 'JPA/Hibernate 模式' },
  'postgres-patterns':            { cat: '后端开发', zh: 'PostgreSQL 优化模式' },
  'clickhouse-io':                { cat: '后端开发', zh: 'ClickHouse 分析数据库' },
  'content-hash-cache-pattern':   { cat: '后端开发', zh: '内容哈希缓存模式' },
  'regex-vs-llm-structured-text': { cat: '后端开发', zh: '正则 vs LLM 结构化文本' },
  'django-patterns':              { cat: '后端开发', zh: 'Django 架构模式' },
  'django-security':              { cat: '后端开发', zh: 'Django 安全最佳实践' },
  'django-tdd':                   { cat: '后端开发', zh: 'Django TDD 测试策略' },
  'django-verification':          { cat: '后端开发', zh: 'Django 验证循环' },
  'springboot-patterns':          { cat: '后端开发', zh: 'Spring Boot 架构模式' },
  'springboot-security':          { cat: '后端开发', zh: 'Spring Security 最佳实践' },
  'springboot-tdd':               { cat: '后端开发', zh: 'Spring Boot TDD' },
  'springboot-verification':      { cat: '后端开发', zh: 'Spring Boot 验证循环' },
  'golang-patterns':              { cat: '后端开发', zh: '惯用 Go 模式' },
  'golang-testing':               { cat: '后端开发', zh: 'Go 测试模式' },
  'perl-patterns':                { cat: '后端开发', zh: 'Modern Perl 模式' },
  'perl-security':                { cat: '后端开发', zh: 'Perl 安全实践' },
  'perl-testing':                 { cat: '后端开发', zh: 'Perl 测试模式' },
  'frontend-patterns':            { cat: '前端开发', zh: 'React/Next.js 前端模式' },
  'frontend-slides':              { cat: '前端开发', zh: 'HTML 演示文稿生成' },
  'coding-standards':             { cat: '前端开发', zh: '通用编码标准' },
  'tdd-workflow':                 { cat: '前端开发', zh: 'TDD 工作流' },
  'e2e-testing':                  { cat: '前端开发', zh: 'Playwright E2E 测试' },
  'python-patterns':              { cat: '前端开发', zh: 'Python 惯用模式' },
  'python-testing':               { cat: '前端开发', zh: 'Python pytest 测试' },
  'cpp-coding-standards':         { cat: '前端开发', zh: 'C++ 编码标准' },
  'cpp-testing':                  { cat: '前端开发', zh: 'C++ GoogleTest 测试' },
  'android-clean-architecture':   { cat: '移动开发', zh: 'Android 清洁架构' },
  'compose-multiplatform-patterns':{ cat: '移动开发', zh: 'Compose 多平台模式' },
  'kotlin-patterns':              { cat: '移动开发', zh: 'Kotlin 惯用模式' },
  'kotlin-coroutines-flows':      { cat: '移动开发', zh: 'Kotlin 协程与 Flow' },
  'kotlin-exposed-patterns':      { cat: '移动开发', zh: 'Kotlin Exposed ORM' },
  'kotlin-ktor-patterns':         { cat: '移动开发', zh: 'Ktor 服务端模式' },
  'kotlin-testing':               { cat: '移动开发', zh: 'Kotlin Kotest 测试' },
  'swiftui-patterns':             { cat: '移动开发', zh: 'SwiftUI 架构模式' },
  'swift-actor-persistence':      { cat: '移动开发', zh: 'Swift Actor 数据持久化' },
  'swift-concurrency-6-2':        { cat: '移动开发', zh: 'Swift 6.2 并发模型' },
  'swift-protocol-di-testing':    { cat: '移动开发', zh: 'Swift 协议依赖注入' },
  'foundation-models-on-device':  { cat: '移动开发', zh: '苹果 Foundation Models' },
  'liquid-glass-design':          { cat: '移动开发', zh: 'iOS 26 Liquid Glass 设计' },
  'article-writing':              { cat: '内容创作', zh: '长篇文章写作' },
  'content-engine':               { cat: '内容创作', zh: '多平台内容系统' },
  'crosspost':                    { cat: '内容创作', zh: '多平台内容分发' },
  'investor-materials':           { cat: '内容创作', zh: '投资者材料制作' },
  'investor-outreach':            { cat: '内容创作', zh: '投资者拓展邮件' },
  'market-research':              { cat: '内容创作', zh: '市场研究与竞争分析' },
  'video-editing':                { cat: '内容创作', zh: 'AI 辅助视频剪辑' },
  'visa-doc-translate':           { cat: '内容创作', zh: '签证文件翻译' },
  'x-api':                        { cat: '内容创作', zh: 'X/Twitter API 集成' },
  'fal-ai-media':                 { cat: '内容创作', zh: 'fal.ai 媒体生成' },
  'videodb':                      { cat: '内容创作', zh: 'VideoDB 视频理解' },
  'exa-search':                   { cat: '内容创作', zh: 'Exa 神经搜索' },
  'deep-research':                { cat: '内容创作', zh: '多源深度研究' },
  'customs-trade-compliance':     { cat: '企业应用', zh: '海关贸易合规' },
  'energy-procurement':           { cat: '企业应用', zh: '能源采购优化' },
  'inventory-demand-planning':    { cat: '企业应用', zh: '库存需求规划' },
  'logistics-exception-management':{ cat: '企业应用', zh: '物流异常管理' },
  'carrier-relationship-management':{ cat: '企业应用', zh: '承运商关系管理' },
  'production-scheduling':        { cat: '企业应用', zh: '生产调度优化' },
  'quality-nonconformance':       { cat: '企业应用', zh: '质量不合格管理' },
  'returns-reverse-logistics':    { cat: '企业应用', zh: '退货逆向物流' },
  'blueprint':                    { cat: '工具辅助', zh: '一句话到完整建设方案' },
  'configure-ecc':                { cat: '工具辅助', zh: 'ECC 交互安装器' },
  'dmux-workflows':               { cat: '工具辅助', zh: 'dmux 多 Agent 编排' },
  'plankton-code-quality':        { cat: '工具辅助', zh: 'Plankton 代码质量' },
  'security-review':              { cat: '工具辅助', zh: '安全漏洞检测' },
  'security-scan':                { cat: '工具辅助', zh: 'Claude 配置安全扫描' },
  'skill-stocktake':              { cat: '工具辅助', zh: 'Skill 质量审计' },
  'strategic-compact':            { cat: '工具辅助', zh: '手动上下文压缩建议' },
  'nutrient-document-processing': { cat: '工具辅助', zh: 'Nutrient 文档处理' },
  'project-guidelines-example':   { cat: '工具辅助', zh: '项目专用 Skill 模板示例' },
  'ai-first-engineering':         { cat: 'AI & 自动化', zh: 'AI 优先工程操作模型' },
};

// ─── 主程序 ───────────────────────────────────────────────────────────────────

function main() {
  const { base, version } = findECCBase();

  // 读取 DeepSeek 翻译缓存
  const cacheFile = path.join(__dirname, 'zh-cache.json');
  const zhCache = fs.existsSync(cacheFile)
    ? JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
    : {};
  const getCached = (type, id) => zhCache[`${type}:${id}`] || null;
  const hasCached = Object.keys(zhCache).length > 0;
  if (hasCached) console.log(`  已加载翻译缓存：${Object.keys(zhCache).length} 条`);

  // 读取 Agents
  console.log('  读取 Agents...');
  const agents = readMdDir(path.join(base, 'agents')).map(({ id, fm, body }) => {
    const base = AGENT_ZH[id] || { name: id, desc: fm.description || '', tags: [], when: '', tip: '' };
    const cached = getCached('agent', id);
    return {
      id, name: fm.name || id,
      description: fm.description || '',
      tools: Array.isArray(fm.tools) ? fm.tools : [],
      model: fm.model || 'sonnet',
      content: body,
      zh: { ...base, ...(cached || {}) },
    };
  });

  // 读取 Commands
  console.log('  读取 Commands...');
  const commands = readMdDir(path.join(base, 'commands')).map(({ id, fm, body }) => {
    const base = COMMAND_ZH[id] || { name: id, desc: fm.description || '', usage: `/${id}` };
    const cached = getCached('command', id);
    return {
      id, description: fm.description || '',
      content: body,
      zh: { ...base, ...(cached || {}) },
    };
  });

  // 读取 Skills（每个子目录的 SKILL.md）
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
          const cat = SKILL_CATEGORIES[dir] || { cat: '其他', zh: dir };
          const cached = getCached('skill', dir);
          return {
            id: dir,
            name: fm.name || dir,
            description: fm.description || '',
            origin: fm.origin || 'ECC',
            content: body,
            category: cat.cat,
            zh: { name: cat.zh, desc: fm.description || '', ...(cached || {}) },
          };
        }).filter(Boolean)
    : [];

  // 读取 Hooks
  console.log('  读取 Hooks...');
  const hooksDir = path.join(base, '.cursor', 'hooks');
  const hooks = fs.existsSync(hooksDir)
    ? fs.readdirSync(hooksDir)
        .filter(f => f.endsWith('.js') && f !== 'adapter.js')
        .map(file => {
          const id = path.basename(file, '.js');
          const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
          const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
          const comment = commentMatch ? commentMatch[1].replace(/\s*\*\s?/g, '\n').trim() : '';
          const base = HOOK_ZH[id] || { name: id, trigger: '未知', desc: '', profiles: [] };
          const cached = getCached('hook', id);
          return {
            id, file,
            content: content.slice(0, 2000),
            comment,
            zh: { ...base, ...(cached || {}) },
          };
        })
    : [];
  // 补充 adapter
  const adapterFile = path.join(hooksDir, 'adapter.js');
  if (fs.existsSync(adapterFile)) {
    const cached = getCached('hook', 'adapter');
    hooks.push({
      id: 'adapter',
      file: 'adapter.js',
      content: fs.readFileSync(adapterFile, 'utf8').slice(0, 2000),
      comment: '',
      zh: { ...HOOK_ZH['adapter'], ...(cached || {}) },
    });
  }

  // 读取 Rules
  console.log('  读取 Rules...');
  const rulesDir = path.join(base, '.cursor', 'rules');
  const rules = readMdDir(rulesDir).map(({ id, fm, body }) => {
    const base = RULE_ZH[id] || { name: id, lang: '通用', desc: fm.description || '', key: '' };
    const cached = getCached('rule', id);
    return {
      id,
      description: fm.description || '',
      alwaysApply: fm.alwaysApply === true || fm.alwaysApply === 'true',
      content: body,
      zh: { ...base, ...(cached || {}) },
    };
  });

  // 汇总
  const data = {
    meta: {
      version,
      generatedAt: new Date().toISOString().slice(0, 10),
      stats: {
        agents: agents.length,
        commands: commands.length,
        skills: skills.length,
        hooks: hooks.length,
        rules: rules.length,
      }
    },
    agents,
    commands,
    skills,
    hooks,
    rules,
  };

  // 输出 data.js
  const outputPath = path.join(__dirname, 'data.js');
  const js = `// 由 generate.js 自动生成 — ${data.meta.generatedAt}\n// ECC v${version}\nwindow.ECC_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outputPath, js, 'utf8');

  console.log(`\n✅ 生成完成：${outputPath}`);
  console.log(`   Agents:   ${agents.length}`);
  console.log(`   Commands: ${commands.length}`);
  console.log(`   Skills:   ${skills.length}`);
  console.log(`   Hooks:    ${hooks.length}`);
  console.log(`   Rules:    ${rules.length}`);
  console.log('\n💡 用浏览器打开 index.html 即可查看');
}

main();
