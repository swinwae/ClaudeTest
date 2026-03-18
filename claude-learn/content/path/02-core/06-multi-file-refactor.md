---
title: 多文件重构
difficulty: 中级
readTime: 14
order: 6
tags: [重构, 多文件, 代码质量, 架构改进]
---

## 什么时候需要多文件重构

以下信号说明需要多文件重构：

- **重复代码**：同一逻辑在 3+ 个文件中出现
- **God Class**：一个类承担了过多职责（500+ 行）
- **命名不一致**：同一概念在不同文件中叫法不同
- **层次违规**：Controller 直接操作数据库，或 Service 混入了 HTTP 逻辑
- **循环依赖**：A 依赖 B，B 依赖 A

## 重构前的准备：依赖分析

**绝对不要在没有全面了解的情况下开始改代码**。先做依赖分析：

```
> 我要重构 UserService.java（上帝类，600 行）。
  在开始修改前，先帮我分析：

  1. 这个类被哪些文件引用？（Grep 搜索 import 和实例化）
  2. 它依赖哪些其他类？
  3. 哪些方法被哪些调用者使用？（方法级别的调用分析）
  4. 有没有相关的测试文件？

  给我一份依赖图，再讨论重构方案
```

## 分析-计划-执行-验证四步法

### 步骤 1：分析

```
> 读取 UserService.java，识别它承担的所有职责，
  按业务领域分组（用户管理、权限控制、通知、统计...）
```

### 步骤 2：计划

```
> 基于分析，提出拆分方案：
  - 新类的名字和职责
  - 哪些方法移到哪个类
  - 接口还是实现类？
  - 不影响现有调用者的最小改动路径

  先给我方案，不要开始修改
```

### 步骤 3：执行（增量，每步验证）

```
> 开始执行。第一步：只提取 sendNotification 相关的 3 个方法到 NotificationService。
  修改 UserService 中对这些方法的调用，确保编译通过。

  [验证编译 + 测试]

> 第一步通过。第二步：提取权限检查相关方法...
```

### 步骤 4：验证

```
> 所有提取完成后，运行全量测试确认没有破坏现有功能。
  如果有测试失败，逐一分析原因
```

## 原子修改与增量验证

**黄金法则**：每次改动后，代码必须可编译、测试必须通过。

```
✅ 增量方式（推荐）：
- 添加新类 NotificationService（空实现）→ 编译通过
- 复制方法到 NotificationService → 编译通过
- 在 UserService 中改为调用 NotificationService → 编译通过
- 删除 UserService 中的原方法 → 编译通过，测试通过
- 继续下一个方法...

❌ 大爆炸方式（危险）：
- 一次性把 UserService 拆成 4 个类
- 修改所有调用者
- 祈祷能通过编译...
```

## 常见重构场景

### 重命名（影响范围大）

```
> 我要将 getUserInfo() 重命名为 fetchUserProfile()。
  先用 Grep 找出所有调用点（包括：Java 类、Thymeleaf 模板、测试文件、文档），
  列出完整的影响范围，然后逐个文件修改，每个文件修改后告诉我
```

### 提取公共模块

```
> 读取 UserController.java、OrderController.java、ProductController.java，
  找出三个文件中重复的分页逻辑，
  提取为 PaginationHelper 工具类，
  然后修改三个 Controller 使用这个工具类
```

### 移动到正确层次

```
> 读取 BlogController.java，找出所有直接操作 Repository 的地方
  （Controller 层不应该直接用 Repository），
  将这些逻辑移到 PostService，
  Controller 改为调用 Service 方法
```

## 实战：将 God Class 拆分为单一职责的类

```
> 读取 PostServiceImpl.java。
  这个类目前 400 行，我觉得它做了太多事情。
  分析它的职责，告诉我是否需要拆分，
  如果需要，给出拆分方案（拆成哪些类，各自职责）。

  不要直接开始修改，先让我评估方案的合理性
```

---exercise---
title: 提取公共模块消除重复代码
difficulty: 中级
---
在一个项目中找到（或制造）重复代码，然后完成以下重构：

1. 让 Claude 用 Grep 搜索项目中的重复模式（如相似的错误处理、日志记录、分页逻辑）
2. 让 Claude 分析重复的程度和影响文件数量
3. 制定提取方案（新类的名称和位置）
4. 增量执行：先创建新类 → 一个文件一个文件地修改 → 每步编译验证

---hints---
- 可以在 myblog 中搜索重复的 Thymeleaf 模板片段，或重复的 Service 方法模式
- 制造重复也是有效的练习：在 UserController 中复制一段 PostController 的分页逻辑，然后让 Claude 发现并消除它
- 每个文件改完都要说「现在检查修改是否正确，有没有编译错误？」

---solution---
示例（以 myblog 为例）：

```
> 用 Grep 在所有 Controller 文件中搜索分页相关代码（pageable、page、size 等关键词），
  分析有哪些重复模式

> 基于分析，提出一个 PaginationUtil 工具类的设计方案

> 先创建空的 PaginationUtil 类，确认编译通过

> 将 PostController 中的分页逻辑迁移到 PaginationUtil，
  修改 PostController 使用新工具类，确认编译和测试通过

> 完成后，检查还有哪些 Controller 也有类似的重复代码
```
