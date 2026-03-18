---
title: Prompt 工程速成指南
tags: [Prompt, 技巧, 效率]
description: 10 个立竿见影的 Prompt 技巧，让 Claude 输出更精准
---

## 技巧 1：三要素结构

每个 Prompt 应包含：**上下文 + 意图 + 约束**。

```
❌ 写一个缓存类
✅ 这是一个 Node.js 服务（Express + Redis），我需要一个内存缓存类，
   用于缓存数据库查询结果（TTL 5分钟），要求线程安全，
   不要引入新的 npm 包
```

## 技巧 2：先分析，再执行

对于不可逆或影响范围大的操作，先让 Claude 分析影响范围：

```
> 在修改 User 实体之前，先告诉我有哪些文件会受到影响，
  不要开始修改
```

## 技巧 3：引用具体文件

比模糊描述强 10 倍：

```
❌ 参考现有的认证代码
✅ 参考 SecurityConfig.java 第 45-80 行的过滤器链配置方式
```

## 技巧 4：迭代而非重写

出错时，告诉 Claude 哪里错了，而不是要求重写：

```
❌ 这不对，重新写
✅ 错误在于：你用了 null 检查，但这个项目统一用 Optional，
   请修改 findUser 方法的返回值处理
```

## 技巧 5：分步骤大任务

一次性生成 300 行代码很难控制质量：

```
步骤 1：先设计接口（不写实现）
步骤 2：实现核心逻辑
步骤 3：添加错误处理
步骤 4：写测试
```

## 技巧 6：指定输出格式

```
> 生成一份 Markdown 表格，列出所有 API 端点：
  | 方法 | 路径 | 说明 | 需要认证 |
```

## 技巧 7：用负面约束

明确说"不要做什么"：

```
> 实现分页功能，不要引入 PageHelper 插件，
  不要修改 Service 接口，只在 Controller 层处理分页参数
```

## 技巧 8：要求自我检查

```
> 生成代码后，检查一遍：有没有 null 指针风险？
  异常是否都被处理了？
```

## 技巧 9：粘贴错误信息而不是描述错误

```
❌ 有个空指针异常
✅ 出现以下错误，请分析原因：
   NullPointerException at PostService.java:142
   at com.myblog.service.PostServiceImpl.getPost(PostServiceImpl.java:142)
```

## 技巧 10：CLAUDE.md 固化常用约束

把你反复强调的约束写进 CLAUDE.md，避免每次重复说：

```markdown
## 编码约束
- 所有方法注释用中文
- 禁止直接 System.out.println，用 log.info
- Service 方法必须加 @Transactional 注解（只读方法加 readOnly=true）
```
