# 图片上传模块设计文档

**日期：** 2026-04-20
**模块名：** image-uploader
**状态：** 已确认，待实现

---

## 背景与目标

新建一个独立模块，允许用户通过浏览器上传图片到绿联云 NAS（via WebDAV），并将图片元数据持久化到 SQLite，以列表形式展示所有已上传图片（含缩略预览、文件名、上传时间、WebDAV 路径）。

---

## 架构总览

```
浏览器
  │
  ├── POST /upload           （上传图片文件）
  ├── GET  /images           （获取图片列表 JSON）
  ├── GET  /proxy/<image_id>  （预览图片，Flask 中转）
  ├── DELETE /images/<image_id> （删除图片）
  │
Flask (ECS, port 5050)
  │
  ├── webdav_client.py       → PUT / GET / DELETE 文件到绿联云 WebDAV /images/
  ├── db.py (SQLite)         → 记录 id / filename / webdav_path / uploaded_at / file_size
  │
绿联云 WebDAV
  https://shiyiwanli.ugreenlink.com:5005/dav/images/
```

### 文件结构

```
image-uploader/
├── app.py           # Flask 主程序，路由定义
├── webdav_client.py # WebDAV 上传 / 拉取 / 删除封装
├── db.py            # SQLite 初始化 + CRUD
├── config.py        # WebDAV URL、凭据、DB 路径（从环境变量读取）
├── templates/
│   └── index.html   # 上传界面 + 图片列表（单页）
├── requirements.txt
└── images.db        # SQLite 数据库文件（gitignore）
```

---

## 数据模型

### SQLite 表：`images`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | 自增主键 |
| `filename` | TEXT NOT NULL | 原始文件名，如 `cat.jpg` |
| `webdav_path` | TEXT NOT NULL | 完整 WebDAV 相对路径，如 `/images/cat.jpg` |
| `uploaded_at` | DATETIME NOT NULL | 上传时间（UTC，ISO 8601 格式） |
| `file_size` | INTEGER NOT NULL | 文件大小（字节） |

---

## API 接口

| 方法 | 路径 | 说明 | 返回 |
|------|------|------|------|
| `GET` | `/` | 返回主页面 HTML | HTML |
| `POST` | `/upload` | 接收图片，上传 WebDAV，写 DB | JSON（图片记录） |
| `GET` | `/images` | 返回所有图片记录列表 | JSON 数组 |
| `GET` | `/proxy/<image_id>` | 从 WebDAV 拉取图片流，透传给浏览器 | 图片二进制流 |
| `DELETE` | `/images/<image_id>` | 删除 WebDAV 文件 + DB 记录 | JSON（成功/失败） |

### `/upload` 响应示例

```json
{
  "id": 3,
  "filename": "sunset.png",
  "webdav_path": "/images/sunset.png",
  "uploaded_at": "2026-04-20T10:30:00Z",
  "file_size": 204800
}
```

---

## 前端界面

单页布局，分上传区和列表区：

```
┌─────────────────────────────────────────┐
│  📷 图片上传                             │
│  ┌─────────────────────────────────┐    │
│  │  拖拽图片到此处，或点击选择文件    │    │
│  │         [选择文件] [上传]         │    │
│  └─────────────────────────────────┘    │
│  上传进度条（上传中显示）                 │
├─────────────────────────────────────────┤
│  图片列表（共 N 张）                     │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ 预览 │ │ 预览 │ │ 预览 │  ...       │
│  │ 文件名│ │ 文件名│ │ 文件名│           │
│  │ 时间 │ │ 时间 │ │ 时间 │           │
│  │ 路径 │ │ 路径 │ │ 路径 │           │
│  │ [删] │ │ [删] │ │ [删] │           │
│  └──────┘ └──────┘ └──────┘           │
└─────────────────────────────────────────┘
```

**交互细节：**
- 支持拖拽上传，也可点击选择文件
- 上传中显示进度条，完成后自动刷新列表
- 图片卡片点击预览图可放大查看（lightbox 效果）
- 删除前弹出确认对话框
- 视觉风格：现代渐变风（紫蓝色调），支持深色/浅色主题切换

---

## 配置 & 部署

### 环境变量（`.env`，不提交 git）

```env
WEBDAV_URL=https://shiyiwanli.ugreenlink.com:5005/dav
WEBDAV_USERNAME=shiyiwanli
WEBDAV_PASSWORD=你的密码
FLASK_SECRET_KEY=随机字符串
DB_PATH=/opt/image-uploader/images.db
```

### 依赖

```
flask
requests
gunicorn
python-dotenv
```

WebDAV 上传使用 `requests` 库直接发送 HTTP PUT 请求，无需额外 WebDAV 客户端库，减少依赖。

### 启动方式

```bash
# 本地开发
python app.py

# 生产（ECS）
gunicorn -w 2 -b 0.0.0.0:5050 app:app
```

### 部署流程

遵循 deploy-rules：本地 feature 分支开发 → push 到 GitHub → ssh ecs 拉取 → systemd restart image-uploader

### gitignore 新增项

```
image-uploader/.env
image-uploader/images.db
image-uploader/__pycache__/
```

---

## 安全说明

- WebDAV 凭据仅在 ECS 服务器端通过环境变量读取，前端 JS 不可见
- ECS 防火墙需开放 5050 端口
- 图片预览通过 `/proxy/<id>` 路由中转，不暴露 WebDAV 直链或凭据
- 上传文件类型在服务端校验（仅允许 jpg / png / gif / webp）
