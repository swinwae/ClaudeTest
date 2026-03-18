---
title: 第一次对话
difficulty: 入门
readTime: 8
order: 2
tags: [对话, 入门, 工作流]
---

## 启动 Claude Code

在终端中输入 `claude` 进入交互模式：

```bash
cd /your/project
claude
```

> **提示**：始终在项目根目录启动 Claude Code，这样它能读取到项目的 CLAUDE.md 配置。

## 交互模式界面

启动后你会看到类似这样的界面：

```
╔════════════════════════════════════════╗
║          Claude Code v1.x.x           ║
╚════════════════════════════════════════╝

✓ 已加载项目配置：CLAUDE.md
✓ 当前目录：/your/project

>
```

## 你的第一个对话

### 让 Claude 读取文件

```
> 读取 README.md 并总结项目的主要功能
```

Claude 会自动调用 `Read` 工具读取文件，然后给出总结。

### 让 Claude 修改代码

```
> 在 src/utils.js 的末尾添加一个 formatDate 函数，将时间戳转换为 YYYY-MM-DD 格式
```

Claude 会读取文件、生成代码、使用 `Edit` 工具修改，并展示修改内容供你确认。

### 让 Claude 运行命令

```
> 运行项目的测试，看看有哪些失败
```

Claude 会通过 `Bash` 工具执行 `npm test` 或对应的测试命令。

## 权限模式

Claude Code 有三种权限模式，控制工具调用时是否需要你确认：

| 模式 | 说明 | 使用场景 |
|------|------|---------|
| **默认模式** | 危险操作需确认（删除文件、网络请求等） | 日常开发 |
| `--dangerously-skip-permissions` | 所有操作自动批准 | 信任的自动化场景 |
| 手动审批 | 每个工具调用都需要确认 | 学习阶段 |

## 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` | 中断当前操作 |
| `Ctrl+D` 或 `/exit` | 退出 Claude Code |
| `↑/↓` 方向键 | 浏览历史命令 |
| `/clear` | 清空对话上下文 |
| `/help` | 查看所有命令 |

## 单次执行模式

不需要进入交互模式时，可以用 `-p` 参数一次性执行：

```bash
claude -p "查看 src/ 目录下有哪些文件，列出它们的功能"
```

这在 CI/CD 或脚本中非常有用。

---exercise---
title: 与 Claude 进行第一次对话
difficulty: 入门
---
在你的任意一个项目目录中（或新建一个测试目录），完成以下任务：

1. 启动 Claude Code：`claude`
2. 让 Claude 列出当前目录的文件结构
3. 让 Claude 创建一个 `hello.md` 文件，内容包含今天的日期和一句话自我介绍
4. 退出 Claude Code（使用 `/exit` 或 `Ctrl+D`）
5. 验证 `hello.md` 文件已被创建

---hints---
- 在步骤 2 中，可以说"列出当前目录的所有文件和子目录"
- 在步骤 3 中，可以说"创建一个 hello.md 文件，写入今天的日期 2026-03-18 和一句话自我介绍"
- Claude 创建文件时会展示内容供你确认，按 Enter 确认

---solution---
```bash
# 新建测试目录
mkdir ~/claude-test && cd ~/claude-test

# 启动 Claude Code
claude

# 在对话中输入：
# > 列出当前目录的所有文件
# > 创建一个 hello.md 文件，内容包含今天的日期 2026-03-18 和一句话自我介绍
# > /exit

# 验证文件已创建
cat hello.md
```
