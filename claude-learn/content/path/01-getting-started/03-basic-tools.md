---
title: 核心工具：Read、Edit、Bash
difficulty: 入门
readTime: 10
order: 3
tags: [工具, Read, Edit, Bash, 文件操作]
---

## Claude Code 的工具系统

Claude Code 通过调用**工具（Tools）**来与你的文件系统和终端交互。理解核心工具，能让你更精准地表达需求，也能更好地理解 Claude 在做什么。

## Read — 读取文件

`Read` 工具读取指定文件的内容，支持指定行号范围：

```
> 读取 src/index.js 的第 50-100 行
```

**何时自动触发**：
- 你提到具体文件名时
- Claude 需要了解现有代码才能修改时
- 你说"看看 xxx 文件里是怎么写的"时

**技巧**：如果你想让 Claude 先理解代码再修改，可以明确说：

```
> 先读取 UserService.java，理解现有逻辑，然后告诉我如何添加邮箱验证功能
```

## Edit — 修改文件

`Edit` 工具对文件做**精确字符串替换**（不是整体重写），这让改动最小化、易于审查。

**修改前，Claude 必须先读取文件**，这是为了确保替换的字符串确实存在。

**你的提示示例**：
```
> 将 calculateTotal 函数中的税率从 0.1 改为 0.13
```

**Write 工具**（创建新文件）：
```
> 创建 src/config.js 文件，导出数据库连接配置对象
```

## Bash — 执行命令

`Bash` 工具在终端执行 Shell 命令：

```
> 运行 npm test，看看测试是否通过
> 查找所有包含 "TODO" 注释的文件
> 运行 git log --oneline -10 查看最近提交
```

**常用场景**：

```bash
# 运行测试
> 运行项目的单元测试，如果有失败，解释原因

# 查找代码
> 搜索所有调用了 sendEmail 函数的地方

# Git 操作
> 查看哪些文件被修改了，用 git status

# 安装依赖
> 安装 lodash 并添加到 package.json
```

## Glob — 文件搜索

`Glob` 工具通过通配符模式查找文件：

```
> 找出所有 .test.js 文件
> 找出 src/components/ 下所有 .tsx 文件
```

## Grep — 内容搜索

`Grep` 工具在文件内容中搜索正则表达式：

```
> 搜索代码中所有 console.log 调用
> 找出哪些文件里引入了 axios
```

## 工具的权限提示

当 Claude 要调用某些工具时，你会看到确认提示：

```
⚠️  Claude 想要执行：
    Bash: rm -rf dist/

[y] 允许  [n] 拒绝  [a] 始终允许此命令
```

- `y`：本次允许
- `n`：拒绝，Claude 会寻找替代方案
- `a`：将此命令加入白名单，后续不再询问

---exercise---
title: 用三种核心工具完成一个小任务
difficulty: 入门
---
在一个测试目录中，用 Claude Code 完成以下完整流程：

1. 让 Claude 创建一个 `calc.js` 文件，包含 `add`、`subtract`、`multiply` 三个函数
2. 让 Claude 读取 `calc.js`，然后在文件末尾添加 `divide` 函数（需要处理除以零的情况）
3. 让 Claude 执行 `node -e "const c = require('./calc'); console.log(c.add(3,4))"` 验证代码可运行

---hints---
- 步骤 1：说"创建 calc.js，包含 add、subtract、multiply 三个导出函数"
- 步骤 2：说"读取 calc.js，然后添加一个 divide 函数，除数为零时返回 null"
- 步骤 3：说"运行命令验证 add 函数的输出是 7"

---solution---
对话示例：

```
> 创建 calc.js 文件，包含 add、subtract、multiply 三个导出函数，使用 module.exports 导出

> 读取 calc.js，然后在末尾添加 divide 函数：两数相除，如果除数为零则返回 null，同样导出

> 执行命令：node -e "const c = require('./calc'); console.log('add:', c.add(3,4)); console.log('divide by zero:', c.divide(5,0))"
```

预期输出：
```
add: 7
divide by zero: null
```
