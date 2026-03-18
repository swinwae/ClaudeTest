---
title: Rules 配置体系
difficulty: 高级
readTime: 10
order: 4
tags: [Rules, 配置, 规范, 团队协作]
---

## Rules vs CLAUDE.md：何时用哪个

两者都是给 Claude 的指令，但定位不同：

| | CLAUDE.md | Rules |
|--|-----------|-------|
| 定位 | 项目说明书（What） | 行为规范（How） |
| 内容 | 项目结构、常用命令、架构概述 | 编码规范、安全要求、工作流程 |
| 组织 | 单个文件 | 按主题拆分，多个文件 |
| 条件触发 | 始终加载 | 可按文件类型条件触发 |
| 更新频率 | 项目结构变化时更新 | 规范迭代时更新 |

**最佳实践**：CLAUDE.md 写"这个项目是什么"，Rules 写"怎么做事"。

## Rules 文件结构与存放位置

```
.claude/rules/
├── git-workflow.md          # Git 提交和分支规范
├── coding-style.md          # 代码风格
├── security.md              # 安全要求
├── java-patterns.md         # Java 特定规范（条件触发：*.java）
└── test-conventions.md      # 测试规范（条件触发：*.test.*）
```

每个 Rules 文件的格式：

```markdown
---
description: 这个 Rule 的简短说明
globs: ["*.java", "*.kt"]    # 可选：只在这些文件类型时触发
alwaysApply: false            # 可选：true 则始终加载
---

规则内容（Markdown 格式）...
```

## 三级优先级体系

```
1. 用户级（~/.claude/rules/）      ← 最低优先级
2. 项目级（.claude/rules/）        ← 覆盖用户级
3. CLAUDE.md 中的直接指令          ← 最高优先级
```

实际使用中：用户级放个人偏好，项目级放团队规范，CLAUDE.md 放临时强调。

## 条件触发规则（按文件类型）

Rules 文件中的 `globs` 字段让规则只在特定文件类型时生效：

```markdown
---
description: React 组件开发规范
globs: ["*.tsx", "*.jsx"]
---

## React 组件规范

- 使用函数式组件 + Hooks，不使用 class 组件
- Props 类型用 TypeScript interface 定义，不用 type alias
- 组件文件名与组件名相同（PascalCase）
- 避免在 JSX 中直接写复杂逻辑，提取为独立变量或函数
- 副作用只在 useEffect 中，依赖数组必须完整
```

这样这个规则只在 Claude 编辑 React 文件时加载，不会影响其他文件类型的编辑。

## 团队 Rules 设计策略

### 常见 Rules 文件集

**git-workflow.md**（通用）：
```markdown
---
description: Git 提交和分支管理规范
alwaysApply: true
---

## Git 规范

- Commit message 使用 Conventional Commits 格式，中文描述
- 功能分支命名：feat/功能名，修复分支：fix/问题描述
- 不直接向 main/master 提交
- PR 描述必须包含：变更摘要、影响范围、测试计划

提交前检查：
1. 运行测试确认通过
2. 无硬编码的密钥或密码
```

**security.md**（通用）：
```markdown
---
description: 安全编码规范
alwaysApply: true
---

## 安全要求

**禁止**：
- 明文存储密码（必须使用 BCrypt 或 Argon2）
- 在代码中硬编码 API Key、数据库密码
- 直接将用户输入拼接到 SQL 查询
- 在错误响应中返回栈跟踪信息

**必须**：
- 用户输入必须在进入业务逻辑前验证
- 所有外部 API 调用必须有超时设置
- 敏感操作必须记录审计日志
```

**java-patterns.md**（Java 项目）：
```markdown
---
description: Java/Spring Boot 编码规范
globs: ["*.java"]
---

## Java 规范

- Service 层必须定义接口，实现类加 Impl 后缀
- Controller 不直接操作 Repository，必须通过 Service
- 所有 public 方法加 Javadoc 注释（中文）
- 异常处理：业务异常用自定义 Exception，通过 @ControllerAdvice 统一处理
- JPA 懒加载：反向集合（oneToMany）保持 LAZY，需要时用 JPQL COUNT
```

## 实战：为项目搭建完整的 Rules 体系

```
> 分析 .claude/rules/ 目录中现有的规则文件，
  检查它们是否覆盖了以下维度：
  - Git 工作流
  - 代码风格
  - 安全要求
  - 测试规范

  告诉我哪些维度缺失，帮我创建缺失的 Rules 文件
```

---exercise---
title: 构建多语言项目的 Rules 体系
difficulty: 高级
---
为一个包含 Java 后端和 JavaScript 前端的全栈项目，创建分文件的 Rules 体系：

1. `git-workflow.md` — Git 提交规范（始终生效）
2. `java-style.md` — Java 代码规范（只在 .java 文件时触发）
3. `js-style.md` — JavaScript/TypeScript 规范（.js/.ts 时触发）
4. `security.md` — 安全要求（始终生效）

测试：让 Claude 修改一个 `.java` 文件，确认 `java-style.md` 规则被应用；修改 `.ts` 文件，确认 `js-style.md` 规则被应用。

---hints---
- 创建目录：`mkdir -p .claude/rules`
- 用 `globs: ["*.java"]` 设置条件触发
- 验证方法：让 Claude 修改文件时，观察它是否提到了 Rules 中的规范

---solution---
文件创建示例：

`.claude/rules/java-style.md`：
```markdown
---
description: Java 编码规范（Spring Boot 项目）
globs: ["*.java"]
---

- 类和方法的 Javadoc 用中文
- Service 必须有接口，实现类加 Impl 后缀
- 禁止在 Controller 中直接使用 Repository
- 方法参数超过 3 个时考虑封装为 DTO
- 统一用 Optional 而不是 null 检查
```

`.claude/rules/js-style.md`：
```markdown
---
description: JavaScript/TypeScript 编码规范
globs: ["*.js", "*.ts", "*.jsx", "*.tsx"]
---

- 使用 const/let，禁止 var
- 异步操作统一用 async/await，不用 .then() 链
- 所有函数参数和返回值加 TypeScript 类型注解
- 组件文件用 PascalCase，工具函数用 camelCase
```
