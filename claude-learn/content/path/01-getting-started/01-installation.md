---
title: 安装与配置
difficulty: 入门
readTime: 5
order: 1
tags: [安装, 配置, 入门]
---

## 什么是 Claude Code？

Claude Code 是 Anthropic 推出的 AI 编程助手命令行工具（CLI），可以直接在终端中与 Claude 对话，帮助你读写文件、执行命令、调试代码，完成各种软件工程任务。

与网页版 Claude 相比，Claude Code 的核心优势在于：

- **直接操作本地文件** — 读取、编辑、创建代码文件，无需复制粘贴
- **执行 Shell 命令** — 运行测试、构建项目、管理 Git
- **理解项目上下文** — 通过 CLAUDE.md 告知项目背景，让 AI 更精准
- **工具链集成** — 支持 MCP（Model Context Protocol）扩展能力

## 系统要求

- **Node.js** 18+ （推荐 20+）
- **操作系统**：macOS、Linux、Windows（WSL2）
- **网络**：需要访问 Anthropic API

## 安装步骤

### 1. 安装 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

如果遇到权限问题：

```bash
# macOS / Linux
sudo npm install -g @anthropic-ai/claude-code

# 或者使用 nvm 管理 Node.js（推荐，无需 sudo）
nvm use 20
npm install -g @anthropic-ai/claude-code
```

### 2. 验证安装

```bash
claude --version
```

输出示例：`@anthropic-ai/claude-code@1.x.x`

### 3. 首次登录

```bash
claude
```

首次运行会引导你完成 API Key 配置。你需要前往 [console.anthropic.com](https://console.anthropic.com) 创建 API Key。

## 配置文件位置

Claude Code 的配置存储在 `~/.claude/` 目录下：

```
~/.claude/
├── settings.json        # 全局设置（模型、权限、主题等）
├── settings.local.json  # 本地覆盖设置（不提交 git）
└── CLAUDE.md            # 全局用户偏好（适用于所有项目）
```

项目级配置放在项目根目录的 `CLAUDE.md` 文件中（第 4 课详细介绍）。

---exercise---
title: 安装 Claude Code 并查看帮助
difficulty: 入门
---
完成以下任务：

1. 安装 Claude Code CLI
2. 运行 `claude --version` 确认安装成功
3. 运行 `claude --help` 查看所有可用选项
4. 进入 `~/.claude/` 目录，查看有哪些文件

---hints---
- 用 `npm install -g @anthropic-ai/claude-code` 安装
- `ls -la ~/.claude/` 查看配置目录内容
- 初次运行 `claude` 会提示配置 API Key

---solution---
```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 验证版本
claude --version
# 输出：@anthropic-ai/claude-code@1.x.x

# 查看帮助
claude --help

# 查看配置目录
ls -la ~/.claude/
```
