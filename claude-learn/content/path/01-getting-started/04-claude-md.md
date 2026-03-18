---
title: CLAUDE.md — 给 AI 的项目说明书
difficulty: 入门
readTime: 12
order: 4
tags: [CLAUDE.md, 配置, 上下文, 项目设置]
---

## 为什么需要 CLAUDE.md？

每次启动 Claude Code，它都需要了解你的项目背景：技术栈是什么？有哪些特殊规范？哪些命令常用？如果每次都口头说明，既重复又容易遗漏。

`CLAUDE.md` 是一个放在项目根目录的 Markdown 文件，Claude Code 启动时**自动加载**，作为持久的项目上下文。

## 什么应该放进 CLAUDE.md？

### ✅ 应该包含

**1. 常用命令**
```markdown
## 常用命令
\`\`\`bash
npm run dev    # 启动开发服务器（端口 3000）
npm test       # 运行单元测试
npm run build  # 生产构建
\`\`\`
```

**2. 架构概述**
```markdown
## 架构说明
- 前端：React 18 + TypeScript，状态管理用 Zustand
- 后端：Express + PostgreSQL，ORM 用 Prisma
- 认证：JWT，token 存在 httpOnly Cookie 中
```

**3. 重要约定和规范**
```markdown
## 代码规范
- 所有注释使用中文
- 禁止使用 var，统一用 const/let
- 数据库字段命名用 snake_case，JS 变量用 camelCase
```

**4. 特殊注意事项**
```markdown
## 注意事项
- `src/legacy/` 目录是遗留代码，不要修改
- 支付相关改动必须同时修改 PaymentService 和 AuditLog
- 测试时用 TEST 环境，不要连接生产数据库
```

### ❌ 不需要包含

- 可以从代码中读取的信息（如函数签名、类结构）
- Git 历史（Claude 可以自己查 `git log`）
- 过于细节的实现说明（放注释里更好）

## 多层级 CLAUDE.md

Claude Code 支持在子目录放置 CLAUDE.md，形成层级配置：

```
project/
├── CLAUDE.md                    # 项目级：整体架构
├── frontend/
│   └── CLAUDE.md                # 前端专用规范
└── backend/
    └── CLAUDE.md                # 后端专用规范
```

进入某目录时，Claude 会合并加载所有上级的 CLAUDE.md。

## 全局 CLAUDE.md

`~/.claude/CLAUDE.md` 适用于所有项目，可以放通用偏好：

```markdown
# 我的全局偏好

- 代码注释使用中文
- 回答简洁，不要重复已知内容
- 提交信息用中文写，遵循 Conventional Commits 格式
- 修改文件前先读取，不要凭空生成
```

## 一个完整的 CLAUDE.md 示例

```markdown
# CLAUDE.md

## 项目简介
电商后台管理系统，基于 Spring Boot 3.3 + Vue 3。

## 常用命令
\`\`\`bash
# 后端
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
# 前端
cd frontend && npm run dev
# 全量测试
./scripts/test-all.sh
\`\`\`

## 架构
- 后端：Spring Boot + JPA + MySQL 8
- 前端：Vue 3 + Pinia + Element Plus
- 认证：Spring Security + JWT
- 配置：application-dev.yml（开发）/ application-prod.yml（生产）

## 规范
- Java：驼峰命名，Service 层不直接操作 Repository
- Vue：组件名 PascalCase，props 用 TypeScript 类型定义
- API：RESTful，统一返回 Result<T> 包装类

## 禁区
- 不要修改 src/main/resources/db/schema.sql（生产数据库脚本）
- 管理员密码在 DataInitializer.java 中，修改前确认
```

---exercise---
title: 为你的项目创建 CLAUDE.md
difficulty: 入门
---
为你当前（或练习用的）项目创建 CLAUDE.md：

1. 在项目根目录创建 `CLAUDE.md` 文件
2. 至少包含以下三个部分：常用命令、技术栈说明、一条注意事项
3. 重新启动 Claude Code，验证它加载了 CLAUDE.md（可以问它"项目用的什么技术栈"）

---hints---
- 如果没有现成项目，用 `mkdir test-project && cd test-project` 创建一个测试目录
- 可以让 Claude 帮你生成初始 CLAUDE.md：`claude -p "帮我为这个 Node.js 项目生成一个 CLAUDE.md 模板"`
- 重启后问 Claude："根据 CLAUDE.md，这个项目用什么命令启动？"来验证加载成功

---solution---
一个最小可用的 CLAUDE.md：

```markdown
# CLAUDE.md

## 常用命令
\`\`\`bash
npm start       # 启动项目
npm test        # 运行测试
npm run build   # 构建
\`\`\`

## 技术栈
- 语言：Node.js 20 + TypeScript
- 框架：Express 4
- 数据库：PostgreSQL + Prisma ORM

## 注意事项
- 环境变量放在 .env 文件（不提交 git）
- 数据库迁移用 `npx prisma migrate dev`
```

验证加载：
```bash
claude
> 根据项目配置，我应该用什么命令启动服务？
# Claude 应该回答 npm start
```
