---
title: 文件搜索与导航 — Glob 与 Grep
difficulty: 中级
readTime: 12
order: 1
tags: [Glob, Grep, 文件搜索, 代码导航]
---

## 为什么需要搜索工具？

在真实项目中，代码库往往有数百甚至数千个文件。当你需要修改一个功能时，光靠"猜"文件在哪里远远不够。Claude Code 提供两个专用搜索工具：

- **Glob** — 按**文件名模式**查找文件
- **Grep** — 按**内容正则表达式**搜索代码

两者相互补充，覆盖所有代码定位场景。

## Glob：按名字找文件

Glob 使用通配符模式匹配文件路径：

```
> 找出所有 .test.js 文件
（Glob: **/*.test.js）

> 找出 src/components/ 下所有 .tsx 文件
（Glob: src/components/**/*.tsx）

> 找出项目中所有配置文件
（Glob: **/*.{json,yaml,yml,toml}）
```

**常用通配符**：

| 通配符 | 含义 | 示例 |
|--------|------|------|
| `*` | 匹配当前目录下任意文件名 | `*.js` |
| `**` | 递归匹配所有子目录 | `**/*.ts` |
| `?` | 匹配单个字符 | `file?.js` |
| `{a,b}` | 匹配多个选项之一 | `*.{js,ts}` |

**实际提示示例**：

```
> 找出所有包含 "Controller" 的 Java 文件
> 找出 test/ 目录下所有测试文件
> 列出 src/ 里所有 index.ts 文件
```

## Grep：按内容搜代码

Grep 用正则表达式搜索文件内容，有三种输出模式：

### 模式一：files_with_matches（默认）

只返回匹配的文件路径，适合快速定位：

```
> 找出哪些文件引入了 axios
（Grep: import.*axios，输出文件列表）

> 哪些文件包含 TODO 注释？
```

### 模式二：content

返回匹配的具体代码行，适合查看上下文：

```
> 搜索所有 console.log 调用，显示前后 2 行
> 找出所有抛出 RuntimeException 的地方，显示上下文
```

### 模式三：count

统计每个文件的匹配次数，适合分析技术债务：

```
> 统计各文件中 any 类型使用的次数（TypeScript 项目）
> 统计每个文件的 TODO 数量
```

## 组合技：Glob + Grep 工作流

真正高效的用法是先用 Glob 缩小范围，再用 Grep 精确定位：

```
# 步骤 1：找到所有 Service 文件
> 用 Glob 找出 src/ 下所有以 Service.ts 结尾的文件

# 步骤 2：在这些文件中搜索
> 在这些文件中，Grep 搜索 "sendEmail" 调用
```

或者直接用 Grep 的 `glob` 参数限定范围：

```
> 在所有 .java 文件中搜索 @Transactional 注解
> 只在 test/ 目录的 TypeScript 文件中搜索 describe(
```

## 实战：在陌生项目中快速定位功能代码

加入新项目后，用搜索工具快速建立代码地图：

```
1. > 找出所有路由定义文件（Glob: **/*routes*.*、**/*router*.*）

2. > 搜索用户认证相关代码（Grep: login|authenticate|jwt|token）

3. > 找出数据库模型/实体文件（Glob: **/models/**、**/entity/**）

4. > 搜索环境变量的使用（Grep: process.env\.\w+）—— 快速了解所有配置项
```

这个流程通常只需 5 分钟，就能对一个陌生项目有基本了解。

---exercise---
title: 在开源项目中追踪一个函数的所有调用
difficulty: 中级
---
找一个中等规模的项目（或使用本学习站的 myblog 项目），完成以下任务：

1. 用 Glob 找出所有 Controller/控制器文件
2. 用 Grep 搜索某个特定方法（如 `findById` 或 `save`）的所有调用，显示上下文
3. 统计 `TODO` 和 `FIXME` 注释各有多少处（使用 count 模式）
4. 总结：这个项目的技术债主要集中在哪些文件？

---hints---
- 可以对 ClaudeTest/myblog 项目说：「找出所有 Repository 接口文件」
- 统计 TODO 时可以说：「用 Grep count 模式，统计每个 Java 文件中 TODO 注释的数量，按数量排序」
- 如果项目没有 TODO，可以搜索其他关键词如 `deprecated` 或 `HACK`

---solution---
示例对话（以 myblog 为例）：

```
> 用 Glob 找出 src/ 下所有 Java 文件中包含 "Repository" 的文件

> 在 Repository 文件中，Grep 搜索 findBy 开头的方法定义

> 用 Grep count 模式，统计 myblog 所有 Java 文件中 TODO 注释的数量

> 根据搜索结果，告诉我哪个文件有最多的自定义查询方法？
```
