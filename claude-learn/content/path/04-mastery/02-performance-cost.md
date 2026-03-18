---
title: 性能优化与成本控制
difficulty: 高级
readTime: 12
order: 2
tags: [性能, 成本, Token, 模型选择]
---

## Token 消耗模型

Claude Code 的成本由两部分构成：

```
总成本 = 输入 tokens × 输入价格 + 输出 tokens × 输出价格
```

**输入 tokens** 包括：
- 对话历史（随对话增长）
- 你发送的文本
- 工具调用的结果（读取的文件内容、命令输出）

**输出 tokens** 包括：
- Claude 的回复文字
- 生成的代码

一般来说，**输入 tokens >> 输出 tokens**，因此控制读取文件的范围是最有效的成本优化手段。

## 模型选择决策树

```
任务是否需要深度推理或复杂架构决策？
  YES → Opus 4.6
  NO  ↓

任务是否需要高质量代码生成？
  YES → Sonnet 4.6
  NO  ↓

任务是否简单重复（批量格式化/注释/分类）？
  YES → Haiku 4.5（成本降低 3-5 倍）
  NO  → Sonnet 4.6（默认选择）
```

**各模型适用场景**：

| 模型 | 适用场景 |
|------|---------|
| Opus 4.6 | 系统架构设计、复杂算法、高风险决策 |
| Sonnet 4.6 | 日常编码、代码审查、重构、测试 |
| Haiku 4.5 | 代码格式化、注释生成、简单问答、日志分析 |

## Extended Thinking 调优

Extended Thinking 让 Claude 在回答前进行内部推理（最多 32K tokens）。

**开启时机**（默认开启）：
- 复杂的系统设计
- 多步骤的算法问题
- 需要权衡多个方案的决策

**可关闭时机**（节省 token）：
- 简单的代码修改
- 文档更新
- 格式化和重命名

切换方式：
- `Option+T`（macOS）/ `Alt+T`（Windows/Linux）
- 或在 `~/.claude/settings.json` 中设置 `alwaysThinkingEnabled: false`

## 上下文窗口使用率监控

用 `/cost` 查看当前会话的 token 消耗：

```
/cost
```

输出示例：
```
当前会话：
  输入：45,231 tokens（22.6%）
  输出：8,192 tokens
  预计剩余容量：~155K tokens
  本次会话费用：约 $0.12
```

当使用率超过 60-70% 时，考虑 `/compact` 压缩。

## 批量操作优化策略

**不要逐个操作**，批量处理可以节省大量 token：

```
❌ 逐个操作（50 次对话）：
> 为 calculateTotal 函数添加注释
> 为 formatDate 函数添加注释
> 为 validateEmail 函数添加注释
... （重复 50 次）

✅ 批量操作（1 次对话）：
> 用 Grep 找出 src/utils/ 目录下所有没有 JSDoc 注释的函数，
  为这些函数批量添加简洁的中文 JSDoc 注释
```

**批量重命名**：

```
✅ 高效
> 用 Grep 找出所有使用 getUserInfo 的地方，
  统一替换为 fetchUserProfile
  （一次性找到所有位置，逐文件替换）
```

## 实战：成本优化对比

同一个任务，两种执行方式的成本对比：

**任务**：为 20 个 API 端点生成接口文档

**方式 A（低效）**：
```
> 读取所有 Controller 文件（10 个文件），然后读取所有 DTO 文件（20 个文件）...
（上下文消耗：~15K tokens 仅用于文件读取）
```

**方式 B（高效）**：
```
> 用 Grep 在 Controller 文件中找出所有 @GetMapping/@PostMapping 注解，
  只读取带有这些注解的方法，生成端点文档
（上下文消耗：~3K tokens，节省 80%）
```

---exercise---
title: 模型选择实验
difficulty: 高级
---
针对以下 3 种不同复杂度的任务，分别选择合适的模型（Haiku/Sonnet/Opus）并执行，记录结果：

**任务 1（简单）**：为 `validateEmail(email)` 函数生成一个简短的注释
**任务 2（中等）**：实现一个带有错误处理和重试机制的 HTTP 请求封装函数
**任务 3（复杂）**：设计一个支持水平扩展的用户会话管理系统架构

对每个任务：
1. 预测应该用哪个模型
2. 执行并记录输出质量（主观评分 1-10）
3. 与用不同模型的结果对比（至少选一个任务对比两种模型）

---hints---
- 切换模型：`/model claude-haiku-4-5-20251001`（Haiku）、`/model claude-sonnet-4-6`（Sonnet）
- 用 `/cost` 在每个任务后查看 token 消耗
- 评估维度：准确性、完整性、代码质量、是否需要补充

---solution---
模型选择参考：

- 任务 1：Haiku（简单注释，用昂贵模型是浪费）
- 任务 2：Sonnet（标准编码任务）
- 任务 3：Opus（架构设计，需要深度推理）

切换命令：
```
/model claude-haiku-4-5-20251001
> 为 validateEmail(email) 函数写一行 JSDoc 注释

/model claude-sonnet-4-6
> 实现带重试机制的 HTTP 请求封装

/model claude-opus-4-6
> 设计可水平扩展的用户会话管理系统架构
```

对比实验：用 Haiku 做任务 3，观察架构方案的深度和完整性差异。
