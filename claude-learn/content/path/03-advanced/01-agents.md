---
title: Agent 系统详解
difficulty: 高级
readTime: 16
order: 1
tags: [Agent, 子代理, Task, 并行执行]
---

## Agent 的概念与用途

Agent 是**可复用的 AI 专家角色**，把特定领域的知识和行为规范固化为一个可随时调用的"专家"。

与普通对话的区别：

| | 普通对话 | Agent |
|--|---------|-------|
| 知识 | 依赖你的描述 | 预置在 Agent 定义中 |
| 工具 | 所有工具 | 可限定专用工具 |
| 复用 | 每次重新说明 | 一次定义，随时调用 |
| 并行 | 串行对话 | 可并行启动多个 |

**典型用途**：代码审查员、安全检查员、文档生成员、TDD 专家、架构师…

## Agent 文件结构

Agent 定义文件放在 `~/.claude/agents/`（全局）或 `.claude/agents/`（项目级），格式：

```markdown
---
name: 代码审查员
description: 代码质量、安全性和可维护性审查。写完或修改代码后使用。
model: claude-sonnet-4-6
tools:
  - Read
  - Grep
  - Glob
  - Bash
---

你是一个经验丰富的代码审查专家。

审查时关注以下优先级：
1. **CRITICAL**：安全漏洞（SQL 注入、XSS、身份验证绕过）
2. **HIGH**：逻辑错误、数据丢失风险、性能严重问题
3. **MEDIUM**：代码可读性、命名规范、重复代码
4. **LOW**：格式、注释、小的改进建议

输出格式：
- 每个问题：[优先级] 文件名:行号 — 问题描述 + 建议修复方式
- 结尾：总结 CRITICAL 和 HIGH 问题数量
- CRITICAL 问题必须修复才能合并

审查要基于代码实际内容，不要泛泛而谈。
```

关键字段说明：
- `name`：Agent 的显示名称
- `description`：何时使用这个 Agent（Claude 会根据这个自动选择）
- `model`：可选，不指定则用当前默认模型
- `tools`：工具白名单，限制 Agent 的操作范围

## 内置 Agent vs 自定义 Agent

**ECC 内置 Agent**（通过 Everything Claude Code 插件提供）：

| Agent | 用途 |
|-------|------|
| `planner` | 复杂功能实施方案规划 |
| `code-reviewer` | 代码质量审查 |
| `tdd-guide` | 测试驱动开发 |
| `security-reviewer` | 安全漏洞检测 |
| `architect` | 系统架构设计 |

调用方式：`/agent planner` 或在对话中说"用 planner agent 帮我规划这个功能"。

**自定义 Agent** 的优势：针对你的项目定制，了解项目特有约定和工具链。

## Task 工具：启动子代理

Task 工具让 Claude 在后台启动独立的子代理任务，实现**并行执行**：

```
> 同时启动三个任务：
  1. 分析 src/auth/ 目录的安全问题
  2. 检查 src/api/ 目录的性能瓶颈
  3. 统计整个项目的测试覆盖率概况

  三个任务并行执行，完成后汇总结果
```

**何时用并行 Agent**：
- 三个任务相互独立
- 每个任务需要 > 30 秒
- 总时间可以从"3 × T"降到"1 × T + 汇总时间"

## Agent 调用时机判断

根据任务复杂度选择调用方式：

```
简单任务（< 5 分钟）→ 直接对话
中等任务（5-20 分钟）→ 调用专业 Agent
复杂任务（多步骤）→ 串行 Agent 流水线
独立任务（互不依赖）→ 并行 Agent
```

## 实战：创建项目专属的 Code Review Agent

创建一个了解 myblog 项目特定规范的审查 Agent：

```markdown
---
name: myblog-reviewer
description: myblog Spring Boot 项目代码审查，了解项目特定规范
model: claude-sonnet-4-6
tools: [Read, Grep, Glob, Bash]
---

你是 myblog 项目的代码审查专家，熟悉以下项目约定：

**架构规范**：
- Controller 只处理 HTTP，不直接操作 Repository
- Service 层通过接口调用，实现类命名为 XxxServiceImpl
- 所有懒加载集合（Tag.posts, Category.posts）必须用 Repository COUNT 查询，不得调用 .size()
- Thymeleaf 模板中不得触发懒加载

**安全规范**：
- /admin/** 路由必须有 @PreAuthorize 或依赖 SecurityConfig
- 密码必须 BCrypt 加密，禁止明文存储

**代码风格**：
- Java 文件注释用中文
- 分页结果用 PageResult<T> 包装
- 渐变色通过 GradientHelper Bean，不硬编码

审查时优先检查架构违规和安全问题。
```

---exercise---
title: 创建并使用安全审计 Agent
difficulty: 高级
---
完成以下任务：

1. 在 `.claude/agents/` 创建一个 `security-auditor.md` Agent
2. Agent 需要检查：SQL 注入、XSS、硬编码密钥、不安全的重定向
3. 用这个 Agent 对你的一个项目执行安全审计
4. 输出格式化的安全报告（分级：CRITICAL/HIGH/MEDIUM/LOW）

---hints---
- Agent 文件存放位置：项目根目录的 `.claude/agents/security-auditor.md`
- 工具权限建议：只给 Read、Grep、Glob（安全审计不需要修改文件）
- 调用方式：`/agent security-auditor` 或说「使用 security-auditor agent 审查 src/ 目录」

---solution---
Agent 文件内容：

```markdown
---
name: security-auditor
description: 安全漏洞检测。处理用户输入、认证、API 端点后使用。
tools: [Read, Grep, Glob]
---

你是一个安全审计专家。扫描代码中的以下安全问题：

**CRITICAL**：
- SQL 注入：字符串拼接构建 SQL 查询
- 硬编码密钥：代码中直接写 password、secret、api_key

**HIGH**：
- XSS：未转义的用户输入直接渲染到 HTML
- 不安全的重定向：直接使用用户提供的 URL 跳转

**MEDIUM**：
- 敏感信息暴露：错误信息泄露栈跟踪
- 缺少输入验证：未检查用户输入长度/格式

为每个发现的问题输出：
[级别] 文件:行号 — 漏洞描述 — 修复建议
```

调用：
```
> 使用 security-auditor agent 扫描 src/ 目录下所有 Java 文件
```
