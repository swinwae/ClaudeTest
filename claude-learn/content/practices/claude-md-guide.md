---
title: CLAUDE.md 最佳实践指南
tags: [CLAUDE.md, 配置, 团队协作]
description: 如何写出高质量的 CLAUDE.md，让 AI 助手更高效地协助你的团队
---

## 为什么 CLAUDE.md 很重要？

一个好的 CLAUDE.md 可以将 Claude Code 的效率提升 3-5 倍。它相当于把项目的"老鸟"知识固化下来，让 AI 每次对话都在正确的上下文中工作。

## 核心原则

### 原则一：写"不显然"的信息

CLAUDE.md 应该包含那些**不能从代码本身推断出来**的信息。

```markdown
# ❌ 没用（可以从代码读到）
- 用 Spring Boot 框架
- 有 UserController 类

# ✅ 有价值（上下文知识）
- 用 SPRING_PROFILES_ACTIVE=dev 启动开发环境（SQL 日志会开启）
- 修改 Post 实体后必须同步更新 PostForm DTO，否则表单提交会丢数据
- Tag 支持中文，slug 生成需要正则加 \u4e00-\u9fa5 范围
```

### 原则二：常用命令要精确

```markdown
# ❌ 太模糊
运行项目

# ✅ 精确可执行
\`\`\`bash
# 开发模式（自动重建表、显示 SQL、端口 8080）
cd myblog && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run

# 生产模式（需先手动建表）
cd myblog && mvn spring-boot:run
\`\`\`
```

### 原则三：标注"禁区"

```markdown
## 禁止修改的文件
- `src/legacy/payment/` — 遗留支付代码，动它会导致线上故障
- `db/schema.sql` — 生产数据库参考脚本，不是开发用的

## 特殊注意
- `Tag` 和 `Category` 的 `posts` 集合是 LAZY 加载，
  模板中不要用 `tag.posts.size()`，要用 Repository 的 COUNT 查询
```

### 原则四：分层组织

对于大型项目，按模块拆分：

```
project/
├── CLAUDE.md              # 项目概览、快速开始
├── backend/CLAUDE.md      # 后端特定规范
├── frontend/CLAUDE.md     # 前端特定规范
└── infra/CLAUDE.md        # 基础设施说明
```

## 完整模板

```markdown
# CLAUDE.md

本文件为 Claude Code 在此仓库工作时提供指引。

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 开发模式
npm run dev    # http://localhost:3000

# 运行测试
npm test

# 生产构建
npm run build
\`\`\`

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + TypeScript + Tailwind |
| 状态 | Zustand |
| 后端 | Node.js + Express |
| 数据库 | PostgreSQL + Prisma ORM |
| 测试 | Vitest + Testing Library |

## 项目结构

\`\`\`
src/
├── components/   # React 组件（按功能分目录）
├── pages/        # Next.js 页面路由
├── services/     # API 调用封装
├── store/        # Zustand 状态
└── utils/        # 工具函数
\`\`\`

## 编码规范

- 所有注释和 commit message 使用中文
- 组件用 PascalCase，文件名与组件同名
- API 路径统一加 /api/v1 前缀
- 禁止在组件中直接 fetch，必须通过 services/ 层

## 已知陷阱

- **Prisma 迁移**：改 schema 后必须运行 `npx prisma migrate dev`，不要用 `db push`
- **环境变量**：`.env.local` 优先级高于 `.env`，本地开发用 `.env.local`
- **图片资源**：放 `public/` 不放 `src/assets/`（构建时不会被处理）

## 不要动的文件

- `src/lib/analytics.ts` — 第三方数据分析集成，改动需要产品确认
- `prisma/migrations/` — 已提交的迁移文件不要手动修改
```

## 让 Claude 帮你生成 CLAUDE.md

如果项目已有代码，可以让 Claude 自动生成初始版本：

```
> 分析当前项目的代码结构、package.json 和现有配置文件，
  帮我生成一个高质量的 CLAUDE.md，
  重点包含：常用命令、技术栈、架构概述和已知陷阱
```

然后根据你的实际情况补充修改。
