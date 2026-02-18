// Blog posts data
const POSTS = [
  {
    id: 1,
    title: "深入理解 JavaScript 异步编程：从回调到 async/await",
    excerpt: "JavaScript 的异步编程模型是其最重要的特性之一。本文将从最基础的回调函数开始，逐步探讨 Promise、async/await 的原理与最佳实践，帮助你真正掌握异步编程的精髓。",
    tags: ["JavaScript", "前端"],
    date: "2026-02-15",
    readTime: "8 分钟",
    emoji: "⚡",
    featured: true,
    content: `
## 什么是异步编程？

在 JavaScript 中，代码默认是同步执行的——每行代码按顺序运行，前一行完成后才执行下一行。但当我们需要处理网络请求、文件读写或定时器时，同步执行会导致程序"卡住"，这就是异步编程要解决的问题。

## 1. 回调函数（Callback）

最早的异步解决方案是回调函数：

\`\`\`javascript
function fetchData(url, callback) {
  setTimeout(() => {
    const data = { name: "John", age: 30 };
    callback(null, data);
  }, 1000);
}

fetchData("https://api.example.com/user", (error, data) => {
  if (error) {
    console.error("请求失败:", error);
    return;
  }
  console.log("获取到数据:", data);
});
\`\`\`

**回调地狱的问题**：当多个异步操作需要串行时，代码会变得极难维护：

\`\`\`javascript
fetchUser(id, (err, user) => {
  fetchPosts(user.id, (err, posts) => {
    fetchComments(posts[0].id, (err, comments) => {
      // 代码向右无限延伸...
    });
  });
});
\`\`\`

## 2. Promise

Promise 是 ES6 引入的异步解决方案，它代表一个异步操作的最终结果：

\`\`\`javascript
function fetchData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        resolve({ name: "John", age: 30 });
      } else {
        reject(new Error("请求失败"));
      }
    }, 1000);
  });
}

// 链式调用
fetchData("https://api.example.com/user")
  .then(user => {
    console.log("用户:", user);
    return fetchPosts(user.id);
  })
  .then(posts => {
    console.log("文章:", posts);
  })
  .catch(error => {
    console.error("错误:", error);
  });
\`\`\`

Promise 的三种状态：
- **Pending（等待）**：初始状态
- **Fulfilled（已完成）**：操作成功
- **Rejected（已拒绝）**：操作失败

## 3. async/await

async/await 是 ES2017 引入的语法糖，让异步代码看起来像同步代码：

\`\`\`javascript
async function getUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);

    return { user, posts, comments };
  } catch (error) {
    console.error("发生错误:", error);
    throw error;
  }
}

// 并行执行多个异步操作
async function fetchAll() {
  const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts()
  ]);

  console.log({ users, products });
}
\`\`\`

## 4. 最佳实践

> 始终使用 try/catch 处理 async 函数中的错误，避免未处理的 Promise 拒绝。

| 场景 | 推荐方案 |
|------|---------|
| 单个异步操作 | async/await |
| 多个并行操作 | Promise.all |
| 竞态条件 | Promise.race |
| 顺序执行 | for...of + await |

## 总结

从回调函数到 async/await，JavaScript 的异步编程经历了显著的演进。每一步都是对前一步问题的解决：Promise 解决了回调地狱，async/await 让代码更易读。理解这些演进过程，有助于我们做出正确的技术选择。
    `
  },
  {
    id: 2,
    title: "CSS Grid 布局完全指南：从入门到实战",
    excerpt: "CSS Grid 是现代 Web 布局的革命性工具。本文通过丰富的示例，带你从基础概念到实际项目应用，全面掌握 Grid 布局的方方面面。",
    tags: ["CSS", "前端"],
    date: "2026-02-10",
    readTime: "10 分钟",
    emoji: "🎨",
    content: `
## CSS Grid 简介

CSS Grid 是一个二维布局系统，允许我们同时控制行和列。相比 Flexbox（一维），Grid 更适合构建整体页面布局。

## 基础概念

### 创建 Grid 容器

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto;
  gap: 20px;
}
\`\`\`

### fr 单位

fr（fractional）是 Grid 专属单位，代表剩余空间的分数：

\`\`\`css
/* 三列，比例为 1:2:1 */
grid-template-columns: 1fr 2fr 1fr;

/* 等价于 25% 50% 25% */
\`\`\`

## 实用技巧

### repeat() 函数

\`\`\`css
/* 12 列等宽布局 */
grid-template-columns: repeat(12, 1fr);

/* 响应式自动填充 */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
\`\`\`

### 跨列/跨行

\`\`\`css
.featured {
  grid-column: 1 / 3;   /* 跨 1-2 列 */
  grid-row: 1 / 3;      /* 跨 1-2 行 */
}

/* 简写 */
.item {
  grid-column: span 2;  /* 跨 2 列 */
}
\`\`\`

### Grid 模板区域

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main    main"
    "footer footer footer";
  grid-template-columns: 250px 1fr 1fr;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
\`\`\`

## 响应式 Grid

\`\`\`css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
\`\`\`

这段代码会自动创建尽可能多的列，每列最小 280px，剩余空间均分。

## 总结

CSS Grid 改变了我们构建 Web 布局的方式。配合 Flexbox 使用，可以优雅地解决几乎所有布局问题。
    `
  },
  {
    id: 3,
    title: "Python 数据分析实战：Pandas 核心技巧",
    excerpt: "Pandas 是 Python 数据分析的基石库。掌握这些核心技巧，你的数据处理效率将大幅提升。本文涵盖数据清洗、转换、聚合等实战场景。",
    tags: ["Python", "数据科学"],
    date: "2026-02-05",
    readTime: "12 分钟",
    emoji: "🐼",
    content: `
## 为什么选择 Pandas？

Pandas 提供了高性能、易用的数据结构和分析工具。其核心数据结构 DataFrame 就像一个强大的电子表格，支持复杂的数据操作。

## 数据加载与基本操作

\`\`\`python
import pandas as pd
import numpy as np

# 加载数据
df = pd.read_csv('data.csv', encoding='utf-8')

# 基本信息
print(df.shape)        # (行数, 列数)
print(df.info())       # 列类型和非空值数
print(df.describe())   # 统计摘要
print(df.head(5))      # 前5行
\`\`\`

## 数据清洗

\`\`\`python
# 处理缺失值
df.dropna()                        # 删除含空值的行
df.fillna(0)                       # 用0填充
df['age'].fillna(df['age'].mean()) # 用均值填充

# 删除重复行
df.drop_duplicates()
df.drop_duplicates(subset=['name', 'email'])

# 数据类型转换
df['date'] = pd.to_datetime(df['date'])
df['price'] = df['price'].astype(float)

# 字符串处理
df['name'] = df['name'].str.strip().str.title()
df['email'] = df['email'].str.lower()
\`\`\`

## 数据筛选与索引

\`\`\`python
# 条件筛选
adults = df[df['age'] >= 18]
active_users = df[(df['active'] == True) & (df['age'] > 21)]

# .loc 和 .iloc
df.loc[0:5, 'name':'age']    # 标签索引
df.iloc[0:5, 0:3]            # 位置索引

# query 方法（更易读）
result = df.query('age > 25 and salary > 50000')
\`\`\`

## 数据聚合与分组

\`\`\`python
# groupby 基本用法
summary = df.groupby('department')['salary'].agg(['mean', 'max', 'count'])

# 多列分组
df.groupby(['city', 'gender'])['income'].mean()

# 透视表
pivot = df.pivot_table(
    values='sales',
    index='region',
    columns='quarter',
    aggfunc='sum',
    fill_value=0
)
\`\`\`

## 实用技巧

> 使用 \`pd.options.display.max_columns = None\` 显示所有列，避免截断。

\`\`\`python
# 向量化操作（比 apply 快很多）
df['bmi'] = df['weight'] / (df['height'] / 100) ** 2

# apply 用于复杂转换
df['grade'] = df['score'].apply(lambda x: 'A' if x >= 90 else 'B' if x >= 80 else 'C')

# 日期特征提取
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day_of_week'] = df['date'].dt.dayofweek
\`\`\`

## 总结

Pandas 的强大在于其向量化操作和丰富的 API。避免使用 Python 循环处理数据，充分利用 Pandas 内置方法，性能提升往往可以达到 10-100 倍。
    `
  },
  {
    id: 4,
    title: "构建现代 REST API：Node.js + Express 最佳实践",
    excerpt: "本文分享构建生产级 REST API 的核心经验，包括项目结构、错误处理、认证授权、性能优化等关键主题，帮助你打造健壮的后端服务。",
    tags: ["Node.js", "后端"],
    date: "2026-01-28",
    readTime: "15 分钟",
    emoji: "🚀",
    content: `
## 项目结构

一个良好的项目结构是可维护性的基础：

\`\`\`
src/
├── config/          # 配置文件
│   ├── database.js
│   └── redis.js
├── controllers/     # 路由处理器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由定义
├── services/        # 业务逻辑
├── utils/           # 工具函数
└── app.js           # 应用入口
\`\`\`

## 错误处理

统一错误处理是 API 质量的关键：

\`\`\`javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      code: err.code
    }
  });
};
\`\`\`

## JWT 认证

\`\`\`javascript
const jwt = require('jsonwebtoken');

// 生成 Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 认证中间件
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token 无效' });
  }
};
\`\`\`

## 性能优化

\`\`\`javascript
// 分页查询
const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find().skip(skip).limit(limit).lean(),
    Post.countDocuments()
  ]);

  res.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};
\`\`\`

## 总结

构建高质量的 REST API 需要在结构、安全、性能等多个维度上做到位。遵循这些最佳实践，你的 API 将更加健壮、可维护。
    `
  },
  {
    id: 5,
    title: "理解 Git 工作流：团队协作的利器",
    excerpt: "Git 不仅是版本控制工具，更是团队协作的核心基础设施。本文介绍 Git Flow、GitHub Flow 等主流工作流，以及分支策略、代码审查的最佳实践。",
    tags: ["Git", "工程实践"],
    date: "2026-01-20",
    readTime: "7 分钟",
    emoji: "🌿",
    content: `
## 主流 Git 工作流

### GitHub Flow

GitHub Flow 简单直接，适合持续部署的团队：

\`\`\`bash
# 1. 从 main 创建功能分支
git checkout -b feature/user-auth

# 2. 提交变更
git add .
git commit -m "feat: add user authentication"

# 3. 推送并创建 PR
git push origin feature/user-auth

# 4. 代码审查通过后合并到 main
# 5. 部署 main 分支
\`\`\`

### Git Flow

Git Flow 适合有版本发布周期的项目：

- **main**：生产代码
- **develop**：开发主线
- **feature/***：功能分支
- **release/***：发布准备
- **hotfix/***：紧急修复

## 好的提交信息

遵循 Conventional Commits 规范：

\`\`\`
feat: 添加用户登录功能
fix: 修复分页计算错误
docs: 更新 API 文档
refactor: 重构用户服务层
perf: 优化数据库查询性能
test: 添加用户服务单元测试
\`\`\`

## 实用 Git 命令

\`\`\`bash
# 交互式暂存（只提交部分改动）
git add -p

# 修改最后一次提交
git commit --amend --no-edit

# 优雅的日志视图
git log --oneline --graph --all

# 暂存当前工作
git stash push -m "WIP: working on auth"
git stash pop

# 找出引入 Bug 的提交
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
\`\`\`

## 总结

选择合适的 Git 工作流，配合规范的提交信息，能够显著提升团队协作效率。从简单的 GitHub Flow 开始，随着项目复杂度增加再考虑更复杂的工作流。
    `
  },
  {
    id: 6,
    title: "Docker 容器化入门：从概念到实践",
    excerpt: "容器化技术已成为现代软件开发的标配。本文从 Docker 核心概念出发，通过实际案例演示如何将 Web 应用容器化，并使用 Docker Compose 管理多服务应用。",
    tags: ["Docker", "DevOps"],
    date: "2026-01-12",
    readTime: "11 分钟",
    emoji: "🐳",
    content: `
## Docker 核心概念

- **镜像（Image）**：只读模板，包含运行应用所需的一切
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：定义镜像构建步骤的文本文件
- **仓库（Registry）**：存储和分发镜像的服务

## 编写 Dockerfile

\`\`\`dockerfile
# Node.js 应用示例
FROM node:20-alpine

WORKDIR /app

# 先复制依赖文件（利用缓存层）
COPY package*.json ./
RUN npm ci --only=production

# 再复制源代码
COPY . .

# 创建非 root 用户
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

CMD ["node", "src/index.js"]
\`\`\`

## 常用 Docker 命令

\`\`\`bash
# 构建镜像
docker build -t myapp:1.0 .

# 运行容器
docker run -d -p 3000:3000 --name myapp myapp:1.0

# 查看日志
docker logs -f myapp

# 进入容器
docker exec -it myapp sh

# 清理资源
docker system prune -a
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
\`\`\`

## 总结

Docker 解决了"在我机器上能运行"的问题，提供了一致的开发、测试和生产环境。掌握 Docker 是现代开发者的必备技能。
    `
  },
  {
    id: 7,
    title: "2026 年前端技术趋势展望",
    excerpt: "随着 AI 辅助开发、Web Components 成熟和新型框架的涌现，2026 年的前端领域正在经历深刻变革。本文梳理最值得关注的技术趋势。",
    tags: ["前端", "趋势"],
    date: "2026-01-05",
    readTime: "6 分钟",
    emoji: "🔮",
    content: `
## 1. AI 辅助开发成为标配

2026 年，AI 辅助编程工具已从"新鲜事物"变为日常工具。代码补全、测试生成、代码审查都有 AI 的身影。

关键趋势：
- AI 驱动的代码重构和优化建议
- 自然语言生成 UI 组件
- 智能错误诊断和修复

## 2. Signals 响应式原语的崛起

Angular、Solid、Preact 和 Vue 都在拥抱 Signals 作为响应式原语：

\`\`\`javascript
import { signal, computed } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

// 更新
count.update(n => n + 1);
\`\`\`

## 3. Web Components 终于成熟

\`\`\`javascript
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = \`
      <button class="btn">
        <slot></slot>
      </button>
    \`;
  }
}

customElements.define('my-button', MyButton);
\`\`\`

## 4. 编译时框架

Svelte 5 和 Million.js 等框架证明：编译时优化可以带来显著的运行时性能提升，减少 JavaScript 体积。

## 5. 边缘计算与服务端组件

Server Components 和边缘函数让我们重新思考渲染边界，将计算移至更接近用户的位置。

## 总结

2026 年的前端开发更加智能化和高效化。保持学习，拥抱变化，同时也要避免"闪亮的新玩具"综合症——稳定、成熟的技术依然是大多数项目的最佳选择。
    `
  },
  {
    id: 8,
    title: "高效学习编程的方法论",
    excerpt: "许多人在学习编程时陷入"看了很多教程，但不会写代码"的困境。本文分享经过实践验证的学习方法，帮助你突破瓶颈，真正掌握编程技能。",
    tags: ["学习方法", "成长"],
    date: "2025-12-28",
    readTime: "9 分钟",
    emoji: "📚",
    content: `
## 被动学习的陷阱

很多初学者花大量时间看视频教程、阅读文档，却发现"看懂了但不会做"。这是因为**理解**和**掌握**是两件完全不同的事。

## 主动学习框架

### 1. 费曼学习法

用自己的语言向他人解释概念：
- 学习一个概念
- 向假想的初学者解释它
- 发现解释不清楚的地方
- 回去填补知识漏洞

### 2. 刻意练习

不是任意编码，而是有目的地练习：

- 专注于薄弱环节
- 寻求即时反馈
- 逐步增加难度
- 专注，而非娱乐

### 3. 项目驱动学习

> 用项目学习，而不是为了学习而学习。

选择项目的原则：
1. **对自己有意义**：解决你实际遇到的问题
2. **适度挑战**：在舒适区边缘
3. **可完成**：避免太大的项目导致放弃

### 4. 费时间调试

很多人害怕 Bug，其实调试是最宝贵的学习机会：

\`\`\`
Bug 出现时的正确姿态：
1. 不要急着谷歌或问 AI
2. 先独立思考 15-20 分钟
3. 阅读错误信息（它通常告诉你答案）
4. 使用 console.log/debugger 追踪
5. 然后再寻求帮助
\`\`\`

## 学习节奏

**每日习惯胜过偶尔冲刺**：

- 每天 1-2 小时的专注编码，胜过每周末的 8 小时马拉松
- 睡眠时大脑会整合学习内容
- 保持一致性，建立习惯

## 使用 AI 的正确方式

AI 工具改变了学习方式，但要避免过度依赖：

- ✓ 用 AI 解释概念、回答疑问
- ✓ 用 AI 审查你写的代码
- ✗ 直接让 AI 写所有代码（你不会学到任何东西）

## 总结

编程学习没有捷径，但有方法。主动编码、刻意练习、项目驱动——坚持这三点，你的成长速度会超出预期。
    `
  }
];
