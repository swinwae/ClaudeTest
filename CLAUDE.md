# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 代码规范

文档的注释和描述都尽量使用中文，包括本 CLAUDE.md 文档。

## 常用命令

```bash
# 开发模式启动（自动重建表、显示 SQL 日志）
cd myblog
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run

# 生产模式启动（需提前手动建表）
cd myblog
mvn spring-boot:run
```

启动后访问 `http://localhost:8080`。

## 前置条件

1. Java 17+、Maven 3.9+
2. MySQL 8.0+，创建数据库：
   ```sql
   CREATE DATABASE myblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 修改 `myblog/src/main/resources/application.yml` 中的数据库连接信息。

## 架构说明

**MyBlog** 是基于 Spring Boot 3.3 的博客系统，采用 Thymeleaf 服务端渲染，MySQL 持久化，Spring Security 保护管理后台。

### 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Spring Boot 3.3.5，Java 17 |
| 模板 | Thymeleaf 3.1 |
| 持久化 | Spring Data JPA + MySQL |
| 安全 | Spring Security + BCrypt |
| 样式/脚本 | 原生 CSS / Vanilla JS（无框架、无构建工具） |

### 项目结构

```
myblog/src/main/
├── java/com/myblog/
│   ├── MyBlogApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java       # Spring Security 路由规则与认证配置
│   │   ├── GradientHelper.java       # 渐变色 Bean，Thymeleaf 通过 @gradientHelper 调用
│   │   └── DataInitializer.java      # 首次启动自动创建管理员账号和示例文章
│   ├── entity/                       # Post、Tag、Category、AdminUser
│   ├── repository/                   # Spring Data JPA Repository 接口（含自定义 JPQL）
│   ├── service/                      # PostServiceImpl（CRUD + 分页 + 搜索）等
│   ├── controller/
│   │   ├── BlogController.java       # GET /、/post/{id}、/about
│   │   ├── AuthController.java       # GET /admin/login
│   │   └── AdminController.java      # /admin/** 全部管理操作
│   └── dto/
│       ├── PostForm.java             # 文章表单（含 fromPost() 静态工厂）
│       └── PageResult.java           # 分页结果包装
└── resources/
    ├── application.yml               # 生产配置（ddl-auto=validate）
    ├── application-dev.yml           # 开发配置（ddl-auto=update，SQL 日志开启）
    ├── db/schema.sql                 # 建表参考脚本（生产环境手动执行）
    ├── static/css/
    │   ├── style.css                 # 公开端样式（原版，不改动）
    │   └── admin.css                 # 管理后台专属样式
    ├── static/js/
    │   ├── post-render.js            # Markdown 渲染器 + 目录构建（前端渲染）
    │   └── theme.js                  # 深色/浅色主题切换（localStorage 持久化）
    └── templates/
        ├── layout/base.html          # 公开端布局片段（head/header/footer）
        ├── layout/admin-base.html    # 管理后台布局片段（侧边栏/顶部栏）
        ├── index.html                # 首页：文章列表 + 标签筛选 + 分页
        ├── post.html                 # 文章详情（Markdown 前端渲染）
        ├── about.html                # 关于页
        ├── error/404.html
        ├── error/500.html
        └── admin/
            ├── login.html
            ├── dashboard.html
            ├── posts/list.html       # 文章列表（状态筛选 + 搜索 + 分页）
            ├── posts/form.html       # 新建/编辑（含 Markdown 实时预览）
            ├── tags/list.html
            └── categories/list.html
```

### 数据流

- 文章的 `content` 字段存储 **Markdown 原文**，不做服务端转换。
- `post.html` 通过 `<div id="rawContent" style="display:none" th:text="${post.content}">` 将内容传给前端，`post-render.js` 负责渲染和目录生成。
- 管理后台编辑页复用同一渲染器实现实时预览。

### 认证与路由

```
公开访问：/、/post/**、/about、/css/**、/js/**
登录页面：/admin/login（permitAll）
受保护：  /admin/**（需登录）
登录处理：POST /admin/login → 成功跳转 /admin/dashboard
退出登录：POST /admin/logout → 跳转 /
```

默认管理员账号：`admin / changeme123`（首次启动自动创建，**请立即修改**）。

### 文章阅读时长计算

`Post.recalculateReadTime()`：按每分钟 200 字估算，最少 1 分钟，每次保存时自动调用。

### 渐变色逻辑

`GradientHelper.get(id)` 与前端 `getGradient(id)` 逻辑完全一致（8 种渐变循环）。
Thymeleaf 调用方式：`th:style="|background: linear-gradient(135deg, ${@gradientHelper.get(post.id)})|"`

### 标签处理

标签以逗号分隔字符串传入，`PostServiceImpl.applyForm()` 按名称查找已有标签或自动新建，避免重复。

中文标签名在 Java 正则中需显式加入 `\u4e00-\u9fa5` 范围，否则 `\w` 只匹配 ASCII，会产生空 slug 导致唯一键冲突。`Tag` 构造器和 `TagService.save()` 均已处理。

### 懒加载注意事项

配置 `spring.jpa.open-in-view: false`，JPA Session 在控制器方法返回后即关闭，Thymeleaf 渲染时**无法**触发懒加载。

- `Post.category`：已设为 `FetchType.EAGER`，可在模板中直接访问。
- `Post.tags`：已设为 `FetchType.EAGER`，可在模板中直接访问。
- `Tag.posts` / `Category.posts`：保持 LAZY（反向集合）。管理后台需要文章数时，使用 `TagRepository.findTagPostCounts()` / `CategoryRepository.findCategoryPostCounts()` 的 JPQL COUNT 查询，结果以 `Map<Long, Long>` 形式传入模板，在模板中通过 `${tagPostCounts[tag.id]}` 访问，**不要**直接调用 `tag.posts.size()`。
