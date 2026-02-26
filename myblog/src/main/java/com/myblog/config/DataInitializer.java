package com.myblog.config;

import com.myblog.dto.PostForm;
import com.myblog.entity.AdminUser;
import com.myblog.repository.AdminUserRepository;
import com.myblog.repository.PostRepository;
import com.myblog.service.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 应用启动时执行的初始化逻辑：
 * 1. 若无管理员账号，创建默认 admin / changeme123
 * 2. 若无文章，导入 8 篇示例文章（与原静态博客内容一致）
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminUserRepository adminUserRepository;
    private final PostRepository postRepository;
    private final PostService postService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminUserRepository adminUserRepository,
                           PostRepository postRepository,
                           PostService postService,
                           PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.postRepository = postRepository;
        this.postService = postService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        initAdmin();
        initSamplePosts();
    }

    /** 首次启动创建默认管理员账号 */
    private void initAdmin() {
        if (!adminUserRepository.existsByUsername("admin")) {
            String encoded = passwordEncoder.encode("changeme123");
            adminUserRepository.save(new AdminUser("admin", encoded, "管理员"));
            log.warn("===================================================");
            log.warn("已创建默认管理员账号：admin / changeme123");
            log.warn("请登录后立即修改密码！");
            log.warn("===================================================");
        }
    }

    /** 数据库为空时导入示例文章 */
    private void initSamplePosts() {
        if (postRepository.count() > 0) {
            return;
        }
        log.info("数据库无文章，开始导入示例数据...");

        savePost("深入理解 JavaScript 异步编程：从回调到 async/await",
                "JavaScript 的异步编程模型是其最重要的特性之一。本文将从最基础的回调函数开始，逐步探讨 Promise、async/await 的原理与最佳实践，帮助你真正掌握异步编程的精髓。",
                "JavaScript,前端", "⚡",
                """
## 什么是异步编程？

在 JavaScript 中，代码默认是同步执行的——每行代码按顺序运行，前一行完成后才执行下一行。但当我们需要处理网络请求、文件读写或定时器时，同步执行会导致程序"卡住"，这就是异步编程要解决的问题。

## 1. 回调函数（Callback）

最早的异步解决方案是回调函数：

```javascript
function fetchData(url, callback) {
  setTimeout(() => {
    const data = { name: "John", age: 30 };
    callback(null, data);
  }, 1000);
}
```

**回调地狱的问题**：当多个异步操作需要串行时，代码会变得极难维护。

## 2. Promise

Promise 是 ES6 引入的异步解决方案，它代表一个异步操作的最终结果：

```javascript
fetchData("https://api.example.com/user")
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(error => console.error(error));
```

Promise 的三种状态：
- **Pending（等待）**：初始状态
- **Fulfilled（已完成）**：操作成功
- **Rejected（已拒绝）**：操作失败

## 3. async/await

async/await 是 ES2017 引入的语法糖，让异步代码看起来像同步代码：

```javascript
async function getUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error("发生错误:", error);
    throw error;
  }
}
```

## 4. 最佳实践

> 始终使用 try/catch 处理 async 函数中的错误，避免未处理的 Promise 拒绝。

| 场景 | 推荐方案 |
|------|---------|
| 单个异步操作 | async/await |
| 多个并行操作 | Promise.all |
| 竞态条件 | Promise.race |
| 顺序执行 | for...of + await |

## 总结

从回调函数到 async/await，JavaScript 的异步编程经历了显著的演进。理解这些演进过程，有助于我们做出正确的技术选择。
""");

        savePost("CSS Grid 布局完全指南：从入门到实战",
                "CSS Grid 是现代 Web 布局的革命性工具。本文通过丰富的示例，带你从基础概念到实际项目应用，全面掌握 Grid 布局的方方面面。",
                "CSS,前端", "🎨",
                """
## CSS Grid 简介

CSS Grid 是一个二维布局系统，允许我们同时控制行和列。相比 Flexbox（一维），Grid 更适合构建整体页面布局。

## 基础概念

### 创建 Grid 容器

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
}
```

### fr 单位

fr（fractional）是 Grid 专属单位，代表剩余空间的分数：

```css
/* 三列，比例为 1:2:1 */
grid-template-columns: 1fr 2fr 1fr;
```

## 实用技巧

### repeat() 函数

```css
/* 响应式自动填充 */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

### Grid 模板区域

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
```

## 总结

CSS Grid 改变了我们构建 Web 布局的方式。配合 Flexbox 使用，可以优雅地解决几乎所有布局问题。
""");

        savePost("Python 数据分析实战：Pandas 核心技巧",
                "Pandas 是 Python 数据分析的基石库。掌握这些核心技巧，你的数据处理效率将大幅提升。本文涵盖数据清洗、转换、聚合等实战场景。",
                "Python,数据科学", "🐼",
                """
## 为什么选择 Pandas？

Pandas 提供了高性能、易用的数据结构和分析工具。其核心数据结构 DataFrame 就像一个强大的电子表格，支持复杂的数据操作。

## 数据加载与基本操作

```python
import pandas as pd

df = pd.read_csv('data.csv', encoding='utf-8')
print(df.shape)      # (行数, 列数)
print(df.describe()) # 统计摘要
```

## 数据清洗

```python
# 处理缺失值
df.dropna()
df.fillna(0)
df['age'].fillna(df['age'].mean())

# 删除重复行
df.drop_duplicates()
```

## 数据聚合与分组

```python
# groupby 基本用法
summary = df.groupby('department')['salary'].agg(['mean', 'max', 'count'])

# 透视表
pivot = df.pivot_table(
    values='sales',
    index='region',
    columns='quarter',
    aggfunc='sum'
)
```

## 总结

避免使用 Python 循环处理数据，充分利用 Pandas 内置方法，性能提升往往可以达到 10-100 倍。
""");

        savePost("构建现代 REST API：Node.js + Express 最佳实践",
                "本文分享构建生产级 REST API 的核心经验，包括项目结构、错误处理、认证授权、性能优化等关键主题。",
                "Node.js,后端", "🚀",
                """
## 项目结构

```
src/
├── controllers/     # 路由处理器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由定义
└── services/        # 业务逻辑
```

## 错误处理

统一错误处理是 API 质量的关键：

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: { message: err.message }
  });
};
```

## JWT 认证

```javascript
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未授权' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch {
    res.status(401).json({ error: 'Token 无效' });
  }
};
```

## 总结

构建高质量的 REST API 需要在结构、安全、性能等多个维度上做到位。
""");

        savePost("理解 Git 工作流：团队协作的利器",
                "Git 不仅是版本控制工具，更是团队协作的核心基础设施。本文介绍 Git Flow、GitHub Flow 等主流工作流以及最佳实践。",
                "Git,工程实践", "🌿",
                """
## 主流 Git 工作流

### GitHub Flow

GitHub Flow 简单直接，适合持续部署的团队：

```bash
# 1. 从 main 创建功能分支
git checkout -b feature/user-auth

# 2. 提交变更
git commit -m "feat: add user authentication"

# 3. 推送并创建 PR
git push origin feature/user-auth
```

### Git Flow

适合有版本发布周期的项目：

- **main**：生产代码
- **develop**：开发主线
- **feature/***：功能分支
- **hotfix/***：紧急修复

## 好的提交信息

遵循 Conventional Commits 规范：

```
feat: 添加用户登录功能
fix: 修复分页计算错误
docs: 更新 API 文档
refactor: 重构用户服务层
```

## 总结

选择合适的 Git 工作流，配合规范的提交信息，能够显著提升团队协作效率。
""");

        savePost("Docker 容器化入门：从概念到实践",
                "容器化技术已成为现代软件开发的标配。本文从 Docker 核心概念出发，演示如何将 Web 应用容器化。",
                "Docker,DevOps", "🐳",
                """
## Docker 核心概念

- **镜像（Image）**：只读模板，包含运行应用所需的一切
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：定义镜像构建步骤的文本文件

## 编写 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "src/index.js"]
```

## Docker Compose

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mydb
    volumes:
      - db_data:/var/lib/postgresql/data
```

## 总结

Docker 解决了"在我机器上能运行"的问题，提供了一致的开发、测试和生产环境。
""");

        savePost("2026 年前端技术趋势展望",
                "随着 AI 辅助开发、Web Components 成熟和新型框架的涌现，2026 年的前端领域正在经历深刻变革。",
                "前端,趋势", "🔮",
                """
## 1. AI 辅助开发成为标配

2026 年，AI 辅助编程工具已从"新鲜事物"变为日常工具。代码补全、测试生成、代码审查都有 AI 的身影。

## 2. Signals 响应式原语的崛起

Angular、Solid、Preact 和 Vue 都在拥抱 Signals：

```javascript
import { signal, computed } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);
count.update(n => n + 1);
```

## 3. Web Components 终于成熟

```javascript
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button><slot></slot></button>`;
  }
}
customElements.define('my-button', MyButton);
```

## 4. 编译时框架

Svelte 5 和 Million.js 等框架证明：编译时优化可以带来显著的运行时性能提升。

## 总结

保持学习，拥抱变化，同时避免"闪亮的新玩具"综合症——稳定成熟的技术依然是大多数项目的最佳选择。
""");

        savePost("高效学习编程的方法论",
                "许多人在学习编程时陷入看了很多教程，但不会写代码的困境。本文分享经过实践验证的学习方法。",
                "学习方法,成长", "📚",
                """
## 被动学习的陷阱

很多初学者花大量时间看视频教程，却发现"看懂了但不会做"。这是因为**理解**和**掌握**是两件完全不同的事。

## 主动学习框架

### 1. 费曼学习法

- 学习一个概念
- 向假想的初学者解释它
- 发现解释不清楚的地方
- 回去填补知识漏洞

### 2. 刻意练习

- 专注于薄弱环节
- 寻求即时反馈
- 逐步增加难度

### 3. 项目驱动学习

> 用项目学习，而不是为了学习而学习。

选择项目的原则：
1. **对自己有意义**：解决你实际遇到的问题
2. **适度挑战**：在舒适区边缘
3. **可完成**：避免太大的项目导致放弃

## 使用 AI 的正确方式

- ✓ 用 AI 解释概念、回答疑问
- ✓ 用 AI 审查你写的代码
- ✗ 直接让 AI 写所有代码（你不会学到任何东西）

## 总结

编程学习没有捷径，但有方法。主动编码、刻意练习、项目驱动——坚持这三点，你的成长速度会超出预期。
""");

        log.info("示例文章导入完成，共 8 篇。");
    }

    private void savePost(String title, String excerpt, String tags, String emoji, String content) {
        PostForm form = new PostForm();
        form.setTitle(title);
        form.setExcerpt(excerpt);
        form.setTagNames(tags);
        form.setEmoji(emoji);
        form.setContent(content.trim());
        form.setStatus("PUBLISHED");
        postService.save(form);
    }
}
