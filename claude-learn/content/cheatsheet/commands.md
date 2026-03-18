---
title: 常用命令速查
order: 2
---

## 工具调用说明

Claude Code 内部使用以下工具，了解它们让你写出更精准的 Prompt：

| 工具 | 用途 | Prompt 示例 |
|------|------|-------------|
| `Read` | 读取文件内容 | "读取 UserService.java" |
| `Edit` | 精确字符串替换 | "将函数名 X 改为 Y" |
| `Write` | 创建/覆写文件 | "创建 config.js 文件" |
| `Bash` | 执行 shell 命令 | "运行测试", "执行 git diff" |
| `Glob` | 文件名模式匹配 | "找出所有 *.test.ts 文件" |
| `Grep` | 内容正则搜索 | "搜索 console.log 调用" |
| `Agent` | 启动子代理 | "用 code-reviewer 审查" |

## Grep 输出模式

```bash
# files_with_matches（默认）：只返回文件路径
> 哪些文件包含 TODO 注释？

# content：返回匹配的代码行（含上下文）
> 搜索所有 @Transactional 注解，显示前后 2 行

# count：统计每文件的匹配数
> 统计每个 Java 文件的 TODO 数量，按数量排序
```

## Git 常用对话模板

```
# 生成 commit message
> 查看 git diff，生成 Conventional Commits 格式的中文 commit message

# 生成 PR 描述
> 用 git diff main...HEAD 查看所有变更，生成包含摘要和测试计划的 PR 描述

# 分析提交历史
> 查看最近 20 条 commit，总结这段时间的主要变更方向

# 解决冲突
> 读取冲突文件，解释两个版本的差异，建议合理的合并方式
```

## 启动参数速查

```bash
claude                                    # 交互模式
claude -p "任务"                          # 单次执行
claude --model claude-opus-4-6            # 指定模型
claude --allowedTools "Read,Grep,Glob"   # 限制工具权限
claude --output-format json               # JSON 输出
claude --dangerously-skip-permissions     # 跳过所有权限确认（CI 用）
claude --cwd /path/to/project             # 指定工作目录
```
