---
title: 代码生成最佳实践
difficulty: 中级
readTime: 15
order: 2
tags: [代码生成, Prompt, 上下文, 质量控制]
---

## 代码生成的常见陷阱

直接让 Claude "写一个登录功能"，往往得到的代码：

- 风格与项目不一致（缩进、命名、错误处理方式）
- 重造了项目已有的轮子
- 忽略了项目特有的架构约定

根本原因：**Claude 没有足够的上下文**。代码生成的质量，90% 取决于你提供的上下文质量。

## "先读后写"模式

最重要的代码生成原则：**让 Claude 先读相关代码，再生成新代码**。

```
❌ 差的方式：
> 帮我写一个 CategoryService，实现 CRUD 功能

✅ 好的方式：
> 先读取 PostService.java，理解现有的代码风格、错误处理方式和分层结构，
  然后按照完全相同的模式，为 Category 实体创建 CategoryService
```

一次典型的"先读后写"流程：

```
1. > 读取 UserController.java 和 UserService.java，
     告诉我这个项目的 Controller-Service 分层是怎么组织的

   Claude 分析：控制器只处理 HTTP，Service 包含业务逻辑，
   统一用 Result<T> 返回，异常用 @ControllerAdvice 处理...

2. > 好，按照完全相同的模式，为 Product 实体创建：
     ProductController（分页查询、单个获取、创建、更新、删除）
     ProductService（接口 + 实现）
```

## 用约束提升生成质量

模糊的需求 = 模糊的结果。用约束把需求变精确：

### 约束模板

```
功能：[你要实现什么]
风格：[参考哪些现有代码/风格要求]
约束：
  - 错误处理：[如何处理异常]
  - 命名规范：[变量/函数/类的命名方式]
  - 不能做：[哪些实现方式要避免]
输出格式：[需要哪些文件]
```

### 实际示例

```
> 为 Order 实体实现状态机

约束：
- 参考 Payment.java 的状态管理方式（枚举 + switch）
- 非法状态转换时抛出 IllegalStateException
- 每次状态变更写入 OrderHistory（参考 UserHistory.java）
- 不要用外部状态机库，保持零依赖
- 方法名用动词：confirm()、cancel()、ship()、complete()
```

## 增量生成 vs 一次性生成

**一次性生成大量代码**的问题：错误很难追踪，风格容易飘移，上下文容易超限。

**推荐：增量生成**，每步完成后验证：

```
步骤 1：> 先只生成 Category 实体类（含 JPA 注解），不要 Service 和 Controller

         [验证实体类正确]

步骤 2：> 好，现在生成 CategoryRepository，
           需要包含按 name 查询和统计文章数的方法

         [验证 Repository 接口]

步骤 3：> 生成 CategoryService 接口和实现，
           参考已有的 PostServiceImpl 风格

         [验证 Service]

步骤 4：> 最后生成 CategoryController，RESTful 风格，
           返回统一的 Result<T> 包装
```

增量生成的每一步都更小、更聚焦，出错概率更低，问题定位也更容易。

## 处理生成错误：迭代修正策略

生成的代码第一次不工作很正常。正确的修正方式：

```
1. 不要删掉代码重新生成 ——
   把错误信息直接粘给 Claude

> 运行后出现以下错误，请修复：
  [粘贴错误信息]

2. 如果同一错误重复出现，说明 Claude 缺少上下文 ——
   主动补充

> 这个错误是因为项目使用了自定义的 BaseEntity，
  它有 createdAt/updatedAt 字段且用了 @EntityListeners，
  请根据 BaseEntity.java 的定义修复

3. 避免说"不对，重写" —— 说清楚哪里不对

❌ > 这不是我想要的，重新写一遍
✅ > 错误处理方式不对，这个项目用 Optional 而不是 null 检查，
     请修改 findById 的实现
```

## 实战：为现有项目添加新功能模块

以 myblog 为例，添加文章"点赞"功能：

```
> 先读取 Post.java 和 PostRepository.java，
  了解文章实体和数据访问层的结构

> 再读取 PostService.java，了解 Service 层的模式

> 现在设计并实现文章点赞功能：
  - 新建 PostLike 实体（用户+文章的联合唯一键）
  - 扩展 PostRepository：统计点赞数
  - 在 PostService 添加 like/unlike 方法（幂等，重复点赞不报错）
  - 在 AdminController 不加（前台功能），
    提示我怎么在 BlogController 添加点赞 API

  参考项目现有的分层方式，不引入新的外部依赖
```

---exercise---
title: 按现有风格生成新模块
difficulty: 中级
---
在你的项目中（或 myblog），完成以下练习：

1. 让 Claude 先读取 2-3 个现有的类，总结项目的代码风格（命名规范、错误处理、分层方式）
2. 提出一个新功能需求，要求 Claude 按照完全相同的风格生成
3. 对比生成的代码与现有代码，找出 3 处风格一致的地方和 1-2 处需要调整的地方

---hints---
- 可以让 Claude 先"做一个风格分析报告"，列出项目的编码模式，再基于这个报告生成代码
- 如果使用 myblog，可以让 Claude 生成一个新的 "Page（静态页面）" 实体，类比 Post 的完整实现

---solution---
示例对话：

```
> 阅读 Post.java、PostService.java、PostController 中关于 POST 的部分，
  总结这个项目的代码风格规则（至少 5 条）

> 根据你总结的风格规则，为 "Announcement（公告）" 实体生成完整的 CRUD：
  实体类、Repository、Service 接口+实现、Controller

> 检查你生成的代码，哪些地方可能与现有风格不一致？主动指出并修正。
```
