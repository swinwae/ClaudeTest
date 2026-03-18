---
title: Git 工作流集成
difficulty: 中级
readTime: 12
order: 3
tags: [Git, 版本控制, Commit, PR]
---

## Claude Code 中的 Git 操作

Claude Code 可以通过 Bash 工具直接执行任何 git 命令。这意味着从创建分支到提交 PR，整个 Git 工作流都可以在对话中完成。

常见的 Git 操作示例：

```
> 查看哪些文件被修改了
> 创建一个 feat/user-auth 分支
> 暂存所有修改并提交，生成一个符合 Conventional Commits 的 commit message
> 查看最近 10 条 commit 历史
> 将这个分支推送到远程
```

## 智能 Commit Message 生成

这是 Claude Code 最实用的 Git 功能之一——根据实际的代码变更自动生成 commit message。

**标准流程**：

```
1. 完成代码修改后

2. > 查看 git diff，然后生成一个符合 Conventional Commits 格式的 commit message

   Claude 会：
   - 读取 git diff 内容
   - 分析变更的类型（feat/fix/refactor/docs...）
   - 用中文写出简洁准确的描述

3. > 确认这个 message 合适，然后创建 commit
```

**Conventional Commits 格式**：

```
<type>: <description>

[optional body]
```

| type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `refactor` | 重构（不改变功能） |
| `docs` | 文档变更 |
| `test` | 测试相关 |
| `chore` | 构建、依赖等杂项 |
| `perf` | 性能优化 |

## 分支管理策略

在 CLAUDE.md 或 Rules 中定义分支命名规范，Claude 会自动遵守：

```markdown
## Git 规范
- 功能分支：feat/<功能名>
- 修复分支：fix/<问题描述>
- 分支名用英文小写+连字符
- 不直接向 main 提交
```

之后只需说：

```
> 我要开始开发文章置顶功能，帮我创建合适的分支
（Claude 会自动创建 feat/article-sticky 分支）
```

## Pull Request 创建与描述生成

让 Claude 基于完整的 diff 生成 PR 描述：

```
> 查看这个分支相对 main 的所有变更（git diff main...HEAD），
  生成一份 PR 描述，包括：
  - 一句话标题（< 70 字）
  - 变更摘要（3-5 条要点）
  - 测试计划（以 checklist 形式）
```

**关键：用 `git diff main...HEAD`**，而不是只看最后一次 commit——PR 通常包含多次提交。

如果使用 GitHub CLI：

```
> 使用 gh pr create 创建 PR，标题和 body 用刚才生成的内容
```

## 冲突解决辅助

合并冲突时，让 Claude 帮你理解并解决：

```
> git merge 后出现了冲突，读取冲突文件，
  解释两个版本的区别，然后建议合理的合并方式

> 解释这个冲突：
  <<<<<<< HEAD
  [你的版本]
  =======
  [对方的版本]
  >>>>>>> feature/xxx

  应该保留哪个版本，还是合并？
```

## 实战：完整的功能开发 Git 流程

```bash
# 开始新功能
> 创建 feat/article-tags 分支并切换到它

# ... 开发过程 ...

# 分阶段提交
> 查看 git diff，为 Tag 实体和 Repository 的修改生成 commit

> 查看剩余的未提交修改，为 Service 和 Controller 的变更生成另一个 commit

# 推送并创建 PR
> 推送分支到远程，然后生成 PR 描述
> 使用 gh pr create 创建 PR
```

---exercise---
title: 从功能开发到 PR 的完整 Git 流程
difficulty: 中级
---
在任意一个 git 项目中，完成一次完整的功能开发 Git 流程：

1. 让 Claude 创建一个命名规范的功能分支
2. 进行一个小的代码修改（添加或修改任意功能）
3. 让 Claude 基于 `git diff` 生成 Conventional Commits 格式的 commit message，确认后提交
4. 让 Claude 生成一份完整的 PR 描述（标题 + 摘要 + 测试计划）

---hints---
- 如果没有合适的项目，可以在 claude-learn 目录里添加一篇课程内容，然后走一遍 Git 流程
- 生成 commit message 时，可以说「先读 git diff，然后用中文 Conventional Commits 格式生成 commit message，不要直接提交，先让我确认」
- PR 描述生成：「用 git diff main...HEAD 查看所有变更，生成一份 Markdown 格式的 PR 描述」

---solution---
```bash
# 在 Claude Code 中的对话：

> 基于当前分支，创建一个 feat/add-lesson-core 功能分支

> [做一些修改，比如添加一个课程文件]

> 查看 git status 和 git diff，然后生成符合 Conventional Commits 规范的中文 commit message

> commit message 合适，帮我执行 git add 和 git commit

> 用 git diff main...HEAD 查看这个分支的所有变更，生成一份 PR 描述：
  包括变更标题（< 70 字）、3 条变更摘要、5 条测试 checklist
```
