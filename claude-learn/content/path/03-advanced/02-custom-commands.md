---
title: 自定义斜杠命令
difficulty: 高级
readTime: 10
order: 2
tags: [命令, 自定义, 效率, 工作流自动化]
---

## 什么是斜杠命令？

斜杠命令（Slash Commands）是**预设的 Prompt 模板**，通过 `/命令名` 快速触发。

```
/review-pr           → 触发代码审查流程
/pre-commit          → 提交前检查
/release-note 1.2.0  → 生成 1.2.0 版本的发布说明
```

比每次重新输入长 Prompt 高效 10 倍。

## 命令文件格式与存放位置

**项目级命令**（随代码库提交，团队共享）：
```
.claude/commands/
├── review.md        → /project:review
├── pre-commit.md    → /project:pre-commit
└── release-note.md  → /project:release-note
```

**用户级命令**（个人使用，适用于所有项目）：
```
~/.claude/commands/
├── daily-standup.md  → /user:daily-standup
└── explain.md        → /user:explain
```

文件名即命令名，扩展名 `.md`。

## 命令文件格式

```markdown
---
description: 简短说明命令的用途（显示在命令列表中）
---

命令的完整 Prompt 内容。

可以使用 $ARGUMENTS 接收用户输入。
```

### 示例：代码快速审查命令

文件：`.claude/commands/review.md`

```markdown
---
description: 快速审查指定文件的代码质量和安全性
---

读取文件：$ARGUMENTS

按以下维度审查：

**代码质量**：
- 命名是否清晰
- 函数是否职责单一
- 是否有明显的代码重复

**潜在问题**：
- 空指针/null 风险
- 异常处理是否完整
- 边界条件是否考虑

**安全性**：
- 是否有 SQL 注入风险
- 用户输入是否经过验证

输出格式：按优先级排列问题，每条给出具体的改进建议。
```

使用方式：
```
/project:review src/service/UserService.java
```

## 项目级 vs 用户级命令

| | 项目级（.claude/commands/） | 用户级（~/.claude/commands/） |
|--|--------------------------|------------------------------|
| 调用前缀 | `/project:` | `/user:` |
| 提交 Git | ✅ 随项目提交 | ❌ 本地私有 |
| 团队共享 | ✅ 所有成员 | ❌ 个人专用 |
| 适合内容 | 项目规范、工作流 | 个人习惯、通用技巧 |

## $ARGUMENTS 参数传递

`$ARGUMENTS` 占位符接收命令后面的所有文字：

```
/project:release-note 1.2.0 --from v1.1.0
```

对应命令文件中的 `$ARGUMENTS` 会被替换为 `1.2.0 --from v1.1.0`。

**多参数技巧**：用分隔符约定多个参数：

```markdown
---
description: 对比两个文件的实现差异
---

读取并对比以下两个文件的实现方式，找出差异和各自的优缺点：

文件 1 和 文件 2：$ARGUMENTS

请用表格展示主要差异。
```

使用：`/project:compare UserServiceV1.java UserServiceV2.java`

## 实战：构建一套项目工作流命令集

推荐为每个项目创建这三个基础命令：

### 1. pre-commit 提交前检查

```markdown
---
description: 提交前自动检查：运行测试、检查代码风格、扫描安全问题
---

在提交代码前，执行以下检查：

1. **运行测试**：执行项目的测试命令，报告通过/失败数量
2. **代码风格**：检查最近修改的文件是否有明显风格问题
3. **安全扫描**：快速扫描有没有硬编码的密钥或密码
4. **TODO 检查**：列出本次修改的文件中有哪些 TODO

如果发现 CRITICAL 问题，建议不要提交并给出修复建议。
```

### 2. review-pr PR 描述生成

```markdown
---
description: 根据 git diff 生成规范的 PR 描述
---

执行 git diff main...HEAD，分析所有变更，生成 PR 描述：

**标题**：一行，< 70 字，使用 Conventional Commits 格式

**变更摘要**：
- 3-5 条要点，说明"做了什么"和"为什么"

**影响范围**：
- 哪些模块受到影响
- 是否有 breaking change

**测试计划**：
- [ ] 核心功能测试项
- [ ] 边界情况测试项
- [ ] 回归测试建议

输出 Markdown 格式，可直接粘贴到 GitHub PR。
```

### 3. explain 代码解释

```markdown
---
description: 详细解释指定代码的工作原理
---

读取并解释以下代码：$ARGUMENTS

解释要包含：
1. **功能概述**：这段代码做什么
2. **核心逻辑**：关键的算法或设计决策
3. **依赖关系**：依赖哪些外部类/函数/服务
4. **注意事项**：使用时需要注意什么（边界条件、副作用）

用清晰的中文，适合对代码不熟悉的开发者理解。
```

---exercise---
title: 创建你的项目命令套件
difficulty: 高级
---
为你的项目创建至少 2 个自定义斜杠命令：

1. 一个带 `$ARGUMENTS` 的命令（如代码解释、文件审查）
2. 一个不带参数的工作流命令（如提交前检查、生成 PR 描述）

测试两个命令，确认它们正常工作。

---hints---
- 命令文件放在 `.claude/commands/` 目录
- 调用时用 `/project:命令名`，需要在 Claude Code 中输入 `/` 看到命令列表
- 写命令时把它想象成给 Claude 写一个非常详细的工作指令

---solution---
创建步骤：

```bash
mkdir -p .claude/commands

# 创建代码审查命令
cat > .claude/commands/review.md << 'EOF'
---
description: 审查指定文件的代码质量
---
读取文件：$ARGUMENTS

检查：代码风格、空指针风险、异常处理、重复代码。
按优先级输出问题，每条给出修复建议。
EOF

# 创建提交前检查命令
cat > .claude/commands/pre-commit.md << 'EOF'
---
description: 提交前检查：测试、风格、安全
---
执行以下提交前检查：
1. 运行项目测试，报告结果
2. 检查 git diff 中有无硬编码密钥
3. 列出本次修改的文件中的 TODO
给出是否可以安全提交的结论。
EOF
```

使用：
```
/project:review src/UserService.java
/project:pre-commit
```
