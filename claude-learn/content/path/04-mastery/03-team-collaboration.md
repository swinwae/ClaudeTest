---
title: 团队协作规范
difficulty: 高级
readTime: 12
order: 3
tags: [团队, 协作, 规范, 标准化]
---

## 团队 AI 协作的挑战

当整个团队都使用 Claude Code 时，会出现新的协调问题：

- 每个人的 Claude 行为不一致（A 用的是 Java 8 风格，B 用的是 Java 17）
- 新成员不知道有哪些项目约定
- 一个人改了 Agent 配置，其他人不知道
- AI 生成的代码审查风格差异很大

解决方案：**将 Claude Code 配置视为基础设施，纳入版本管理**。

## 配置文件的版本管理策略

提交到 Git 的配置（团队共享）：

```
.claude/
├── settings.json          # 团队统一设置（权限策略、Hooks 配置）
├── agents/                # 项目专属 Agent 定义
│   ├── code-reviewer.md
│   └── security-auditor.md
├── commands/              # 团队共享的斜杠命令
│   ├── review.md
│   ├── pre-commit.md
│   └── release-note.md
└── rules/                 # 编码规范和工作流规则
    ├── git-workflow.md
    ├── coding-style.md
    └── security.md
CLAUDE.md                  # 项目说明书
```

**不提交到 Git**（写入 `.gitignore`）：

```
.claude/settings.local.json    # 个人设置覆盖（如个人 API Key 代理）
```

## CLAUDE.md 的团队编写规范

团队 CLAUDE.md 应当由负责人维护，遵循以下原则：

### 1. 写作受众是 Claude，不是人类

```markdown
# ❌ 写给人看的风格
本项目是一个博客系统，大家要注意 Tag 实体的懒加载问题。

# ✅ 写给 Claude 看的风格
## 已知陷阱（必读）

### Tag 懒加载
`Tag.posts` 是 LAZY 集合，JPA Session 在 Controller 返回后关闭。
**模板中禁止**调用 `tag.posts.size()`。
**正确做法**：使用 `TagRepository.findTagPostCounts()` 的 JPQL COUNT 查询，
结果以 `Map<Long, Long>` 传入模板，通过 `${tagPostCounts[tag.id]}` 访问。
```

### 2. 保持精简，避免臃肿

CLAUDE.md 过长会被截断或降低 Claude 的注意力。超过 200 行时考虑拆分到 Rules 文件。

### 3. 定期审查

每个 Sprint 结束时，检查 CLAUDE.md 是否需要更新：
- 有没有新的"已知陷阱"需要记录？
- 有没有过时的信息需要删除？
- 架构变更是否已经反映在文档中？

## 共享命令与 Agent 设计

团队共享的命令和 Agent 需要**足够通用**，适合不同成员的使用方式：

```markdown
# ✅ 好的共享命令（参数化，灵活）
---
description: 审查指定文件，支持指定重点关注的维度
---
审查文件 $ARGUMENTS

关注维度（按优先级）：
1. 安全漏洞
2. 架构合规性（是否违反项目分层规范）
3. 代码质量

# ❌ 过于个人化（不适合团队）
---
description: 按我喜欢的风格审查代码
---
用我偏好的 Google 风格...
```

## 新成员 Onboarding 流程

一份标准的"AI 辅助 Onboarding"流程：

```markdown
## 新成员使用 Claude Code 上手步骤

1. 克隆仓库后，在项目根目录启动 Claude Code
   cd your-project && claude

2. 运行以下命令了解项目
   > 读取 CLAUDE.md，告诉我这个项目的核心架构和常用命令

3. 完成第一个任务前，运行环境检查
   /project:env-check

4. 开发完成后，使用提交前检查
   /project:pre-commit

5. 创建 PR 时
   /project:review-pr
```

## 实战：为开源项目设计 Claude Code 配置

一个可供参考的完整 `.claude/` 目录结构：

```
.claude/
├── settings.json
│   └── hooks: PostToolUse(Edit) → 自动格式化
├── agents/
│   └── project-reviewer.md → 了解项目特定规范的审查员
├── commands/
│   ├── review.md      → /project:review <file>
│   ├── pre-commit.md  → /project:pre-commit
│   └── onboard.md     → /project:onboard（新成员引导）
└── rules/
    ├── git.md         → Git 规范（alwaysApply: true）
    ├── security.md    → 安全要求（alwaysApply: true）
    └── style.md       → 代码风格（按文件类型条件触发）
```

---exercise---
title: 项目配置模板设计
difficulty: 高级
---
为你的项目（或一个假设的全栈项目）设计完整的 `.claude/` 配置，并完成以下检验：

1. 写完配置后，**扮演新成员**：仅凭 CLAUDE.md 和 `.claude/` 配置，让 Claude 帮你理解项目架构
2. 用 `/project:pre-commit` 或你创建的等效命令执行一次提交前检查
3. 记录：哪些配置对新成员最有帮助？哪些 CLAUDE.md 内容缺失会造成混乱？

---hints---
- 最小可用的配置：一个 CLAUDE.md + 一个命令（pre-commit）+ 一个 Rule（git-workflow）
- "扮演新成员"验证很重要：说「假设我是刚加入这个项目的开发者，只有你面前的 CLAUDE.md 文件，帮我了解这个项目」
- 记录发现，更新 CLAUDE.md 填补空白

---solution---
最小可用 `.claude/` 配置：

```bash
mkdir -p .claude/commands .claude/rules

# 命令：提交前检查
cat > .claude/commands/pre-commit.md << 'EOF'
---
description: 提交前检查
---
执行：
1. git diff --name-only（查看修改的文件）
2. 检查这些文件中有无明显的安全问题（硬编码密钥、SQL 拼接）
3. 运行项目测试命令
4. 给出是否可以安全提交的结论
EOF

# Rule：Git 规范
cat > .claude/rules/git.md << 'EOF'
---
description: Git 提交规范
alwaysApply: true
---
- Commit message 格式：<type>: <中文描述>
- type 可选：feat/fix/refactor/docs/test/chore
- 不直接提交到 main，使用 feat/ 或 fix/ 分支
EOF
```

验证：
```
> 假设我是新来的开发者，读取 CLAUDE.md 帮我了解这个项目，
  然后说明我应该如何创建第一个功能分支
```
