---
title: Context 管理与 /compact
difficulty: 高级
readTime: 12
order: 5
tags: [Context, 上下文窗口, compact, 效率]
---

## 理解上下文窗口

Claude 的"上下文窗口"就像工作记忆——它能记住的内容是有限的。Claude Code 使用的模型大约有 200K tokens 的上下文容量。

当上下文接近满时：
- 早期的对话内容可能被截断
- 输出质量开始下降
- 长时间开发会话中，Claude 可能"忘记"之前的决定

一个粗略的估算：
- 1 行代码 ≈ 5-10 tokens
- 1 个中等文件（100 行）≈ 500-1000 tokens
- 读取 10 个文件 ≈ 10K tokens
- 2 小时对话 ≈ 30K-80K tokens

## 上下文膨胀的信号

以下迹象说明上下文已经接近瓶颈：

- Claude 开始对早期讨论过的设计决策感到困惑
- 重复生成已经讨论并否决过的方案
- 回答变得更加保守和简短
- 对已读过的文件"忘记"了关键内容

**预防胜于治疗**：在上下文达到 70-80% 前主动处理。

## /compact 命令详解

`/compact` 压缩当前对话历史，保留核心信息，丢弃冗余细节：

```
/compact
```

带自定义摘要指令（推荐）：

```
/compact 保留：当前正在重构的目标（将 UserService 拆分为三个类）、
已完成的步骤（NotificationService 已提取）、
下一步计划（提取 PermissionService）
```

### 什么会被保留

- 关键的技术决策和约定
- 当前任务的进度和下一步
- 重要的错误信息和解决方案

### 什么会被丢弃

- 中间过程的讨论
- 已被否决的方案
- 冗余的代码展示（代码在文件里，不需要在上下文中保留）

## 上下文预算管理策略

### 策略一：任务分段 + 定期 compact

```
长任务 = 多个小阶段

阶段 1：分析和规划（15 分钟）
  → /compact，保留：规划结论、文件影响范围

阶段 2：实现第一个模块（20 分钟）
  → /compact，保留：完成的模块列表、未完成的工作

阶段 3：继续实现...
```

### 策略二：关键信息持久化

不要依赖上下文记忆重要信息，而是写到文件里：

```
> 把我们刚才讨论的重构方案写到 REFACTOR_PLAN.md，
  后续对话可以直接读这个文件而不是重复讨论

> 把当前任务的进度更新到 TODO.md：
  - [x] 提取 NotificationService
  - [ ] 提取 PermissionService
  - [ ] 更新所有调用方
```

### 策略三：精准注入，按需读取

避免在对话开始时一次性读取所有文件：

```
❌ 低效
> 读取整个 src/ 目录下所有文件（50 个文件）

✅ 高效
> 当你需要了解某个类时，告诉我，我们再读那个文件

或

> 现在只读取 UserService.java 和 OrderService.java，
  其他文件我们按需加载
```

## @file 与精准上下文注入

在对话中精准引用文件：

```
> 参考 @src/config/SecurityConfig.java 的配置方式，
  帮我为 /api/payments/** 路由添加额外的权限检查
```

`@file` 语法（在支持的界面中）让 Claude 只加载你指定的文件，而不是让它自己决定读哪些文件。

## 实战：长时间开发会话的上下文管理

以 2 小时的重构任务为例：

```
开始：
> 读取 ProjectStructure.md（项目架构），
  然后读取需要重构的 GodService.java，
  制定重构计划并写到 REFACTOR_PLAN.md

45 分钟后，上下文约 40%：
> 读取 REFACTOR_PLAN.md，确认当前进度，
  继续下一个模块的提取

90 分钟后，上下文约 70%：
/compact 保留：REFACTOR_PLAN.md 中的未完成项目，当前处理的文件名

继续工作直到完成...
```

---exercise---
title: 上下文预算实验
difficulty: 高级
---
通过实验体验上下文膨胀和 /compact 的效果：

1. 在一个对话中，连续让 Claude 读取 5-8 个文件（每个至少 100 行）
2. 问一个关于**最早读取的**文件的具体问题，观察 Claude 的记忆准确度
3. 使用 `/compact` 压缩，然后让 Claude 重新回答同样的问题
4. 总结：compact 前后，Claude 的回答质量有何差异？

---hints---
- 可以在 myblog 项目中依次读取：Post.java、PostService.java、AdminController.java、PostRepository.java、SecurityConfig.java
- 最后问关于最早读的 Post.java 的具体细节问题（如「Post 实体有哪些字段？readTime 是如何计算的？」）
- compact 后重新问同样的问题，对比回答的准确性

---solution---
实验步骤：

```
> 读取 myblog/src/main/java/com/myblog/entity/Post.java

> 读取 PostService.java，并读取 PostServiceImpl.java

> 读取 AdminController.java

> 读取 SecurityConfig.java

> 读取 DataInitializer.java

> [测试记忆] Post 实体的 readTime 字段是如何计算的？
  recalculateReadTime() 方法的逻辑是什么？

[观察回答准确性]

/compact 保留：我们读过哪些文件，当前任务是测试上下文记忆

> [再次测试] Post 实体的 readTime 字段是如何计算的？
  recalculateReadTime() 方法的逻辑是什么？

[对比两次回答]
```
