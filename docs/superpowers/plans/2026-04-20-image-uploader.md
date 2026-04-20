# image-uploader 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Flask 图片上传服务，将图片上传到绿联云 WebDAV（/images/），元数据持久化 SQLite，前端列表展示图片预览、文件名、时间、路径，支持删除，部署到阿里云 ECS。

**Architecture:** Flask 作为唯一后端，使用 `requests` 库直接发送 HTTP PUT/GET/DELETE 请求操作 WebDAV；SQLite 存储图片元数据；图片预览通过 `/proxy/<id>` 路由中转（WebDAV 凭据不暴露前端）；前端单页 HTML + Vanilla JS，无框架无构建工具。

**Tech Stack:** Python 3.11+, Flask, requests, sqlite3（标准库）, python-dotenv, pytest, gunicorn

---

## 文件结构（新建）

```
image-uploader/
├── app.py                    # Flask 主程序，所有路由
├── config.py                 # 从环境变量读取配置
├── db.py                     # SQLite 初始化 + CRUD
├── webdav_client.py          # WebDAV 上传/拉取/删除封装
├── templates/
│   └── index.html            # 单页前端界面
├── tests/
│   ├── conftest.py           # 公共测试配置（设置环境变量）
│   ├── test_db.py            # db.py 单元测试
│   ├── test_webdav_client.py # webdav_client.py 单元测试
│   └── test_app.py           # Flask 路由集成测试
└── requirements.txt
```

`.gitignore` 追加：
```
image-uploader/.env
image-uploader/images.db
image-uploader/__pycache__/
image-uploader/tests/__pycache__/
image-uploader/.pytest_cache/
```

---

## Task 1: 项目骨架

**Files:**
- Create: `image-uploader/requirements.txt`
- Modify: `.gitignore`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p image-uploader/templates image-uploader/tests
touch image-uploader/tests/__init__.py
```

- [ ] **Step 2: 创建 requirements.txt**

```
flask==3.1.0
requests==2.32.3
python-dotenv==1.0.1
gunicorn==23.0.0
pytest==8.3.4
```

- [ ] **Step 3: 追加 .gitignore**

在项目根 `.gitignore` 末尾添加：

```
# image-uploader
image-uploader/.env
image-uploader/images.db
image-uploader/__pycache__/
image-uploader/tests/__pycache__/
image-uploader/.pytest_cache/
```

- [ ] **Step 4: 安装依赖**

```bash
cd image-uploader
pip install -r requirements.txt
```

预期：所有包安装成功，无报错。

- [ ] **Step 5: 提交骨架**

```bash
git add image-uploader/requirements.txt image-uploader/tests/__init__.py .gitignore
git commit -m "feat: 添加 image-uploader 项目骨架"
```

---

## Task 2: config.py — 环境变量配置

**Files:**
- Create: `image-uploader/config.py`
- Create: `image-uploader/.env`（本地开发用，不提交）

- [ ] **Step 1: 创建 config.py**

```python
# config.py — 从环境变量读取全部配置
import os
from dotenv import load_dotenv

load_dotenv()

WEBDAV_URL: str = os.environ["WEBDAV_URL"]          # 如 https://shiyiwanli.ugreenlink.com:5005/dav
WEBDAV_USERNAME: str = os.environ["WEBDAV_USERNAME"]
WEBDAV_PASSWORD: str = os.environ["WEBDAV_PASSWORD"]
FLASK_SECRET_KEY: str = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")
DB_PATH: str = os.environ.get("DB_PATH", "images.db")

ALLOWED_EXTENSIONS: set[str] = {"jpg", "jpeg", "png", "gif", "webp"}
WEBDAV_IMAGE_DIR: str = "/images"
```

- [ ] **Step 2: 创建本地 .env（不提交）**

```bash
cat > image-uploader/.env << 'EOF'
WEBDAV_URL=https://shiyiwanli.ugreenlink.com:5005/dav
WEBDAV_USERNAME=shiyiwanli
WEBDAV_PASSWORD=替换为真实密码
FLASK_SECRET_KEY=替换为随机字符串
DB_PATH=images.db
EOF
```

- [ ] **Step 3: 验证 config.py 可正常导入**

```bash
cd image-uploader
python -c "import config; print(config.WEBDAV_URL, config.DB_PATH)"
```

预期输出：打印 WebDAV URL 和 `images.db`，无报错。

- [ ] **Step 4: 提交（不包含 .env）**

```bash
git add image-uploader/config.py
git commit -m "feat: 添加 image-uploader config.py 环境变量配置"
```

---

## Task 3: db.py + 单元测试

**Files:**
- Create: `image-uploader/db.py`
- Create: `image-uploader/tests/conftest.py`
- Create: `image-uploader/tests/test_db.py`

- [ ] **Step 1: 创建 tests/conftest.py（在导入任何模块之前设置环境变量）**

```python
# tests/conftest.py
import os

# 在导入 app/config 之前设置测试用环境变量
os.environ.setdefault("WEBDAV_URL", "https://example.com/dav")
os.environ.setdefault("WEBDAV_USERNAME", "testuser")
os.environ.setdefault("WEBDAV_PASSWORD", "testpass")
os.environ.setdefault("FLASK_SECRET_KEY", "test-secret")
os.environ.setdefault("DB_PATH", ":memory:")
```

- [ ] **Step 2: 编写 test_db.py（先写测试）**

```python
# tests/test_db.py
import pytest
import db


@pytest.fixture
def db_path(tmp_path):
    path = str(tmp_path / "test.db")
    db.init_db(path)
    return path


def test_init_db_creates_images_table(db_path):
    import sqlite3
    conn = sqlite3.connect(db_path)
    tables = [r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()]
    assert "images" in tables


def test_insert_image_returns_record(db_path):
    record = db.insert_image(db_path, "cat.jpg", "/images/cat.jpg", 1024)
    assert record["filename"] == "cat.jpg"
    assert record["webdav_path"] == "/images/cat.jpg"
    assert record["file_size"] == 1024
    assert isinstance(record["id"], int)
    assert record["uploaded_at"] is not None


def test_get_all_images_returns_list(db_path):
    db.insert_image(db_path, "a.jpg", "/images/a.jpg", 100)
    db.insert_image(db_path, "b.png", "/images/b.png", 200)
    images = db.get_all_images(db_path)
    assert len(images) == 2


def test_get_all_images_ordered_by_newest_first(db_path):
    db.insert_image(db_path, "first.jpg", "/images/first.jpg", 100)
    db.insert_image(db_path, "second.jpg", "/images/second.jpg", 200)
    images = db.get_all_images(db_path)
    assert images[0]["filename"] == "second.jpg"


def test_get_image_by_id_found(db_path):
    record = db.insert_image(db_path, "x.jpg", "/images/x.jpg", 512)
    fetched = db.get_image_by_id(db_path, record["id"])
    assert fetched["filename"] == "x.jpg"


def test_get_image_by_id_not_found(db_path):
    assert db.get_image_by_id(db_path, 9999) is None


def test_delete_image_removes_record(db_path):
    record = db.insert_image(db_path, "del.jpg", "/images/del.jpg", 256)
    assert db.delete_image(db_path, record["id"]) is True
    assert db.get_image_by_id(db_path, record["id"]) is None


def test_delete_nonexistent_returns_false(db_path):
    assert db.delete_image(db_path, 9999) is False
```

- [ ] **Step 3: 运行测试，确认全部失败（db 模块不存在）**

```bash
cd image-uploader
pytest tests/test_db.py -v
```

预期：`ModuleNotFoundError: No module named 'db'`

- [ ] **Step 4: 创建 db.py 使测试通过**

```python
# db.py — SQLite 初始化与 CRUD
import sqlite3
from datetime import datetime, timezone
from typing import Optional


def _connect(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str) -> None:
    """初始化数据库，建表（幂等）"""
    with _connect(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS images (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                filename    TEXT    NOT NULL,
                webdav_path TEXT    NOT NULL,
                uploaded_at DATETIME NOT NULL,
                file_size   INTEGER NOT NULL
            )
        """)
        conn.commit()


def insert_image(db_path: str, filename: str, webdav_path: str, file_size: int) -> dict:
    """插入一条图片记录，返回完整记录 dict"""
    uploaded_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with _connect(db_path) as conn:
        cursor = conn.execute(
            "INSERT INTO images (filename, webdav_path, uploaded_at, file_size) VALUES (?, ?, ?, ?)",
            (filename, webdav_path, uploaded_at, file_size),
        )
        conn.commit()
        return get_image_by_id(db_path, cursor.lastrowid)


def get_all_images(db_path: str) -> list[dict]:
    """返回所有图片记录，按上传时间倒序"""
    with _connect(db_path) as conn:
        rows = conn.execute(
            "SELECT * FROM images ORDER BY uploaded_at DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def get_image_by_id(db_path: str, image_id: int) -> Optional[dict]:
    """按 id 查询图片记录，不存在返回 None"""
    with _connect(db_path) as conn:
        row = conn.execute(
            "SELECT * FROM images WHERE id = ?", (image_id,)
        ).fetchone()
        return dict(row) if row else None


def delete_image(db_path: str, image_id: int) -> bool:
    """删除图片记录，返回是否成功删除"""
    with _connect(db_path) as conn:
        cursor = conn.execute("DELETE FROM images WHERE id = ?", (image_id,))
        conn.commit()
        return cursor.rowcount > 0
```

- [ ] **Step 5: 运行测试，确认全部通过**

```bash
cd image-uploader
pytest tests/test_db.py -v
```

预期：8 个测试全部 PASSED。

- [ ] **Step 6: 提交**

```bash
git add image-uploader/db.py image-uploader/tests/conftest.py image-uploader/tests/test_db.py image-uploader/tests/__init__.py
git commit -m "feat: 添加 image-uploader db.py SQLite CRUD 及单元测试"
```

---

## Task 4: webdav_client.py + 单元测试

**Files:**
- Create: `image-uploader/webdav_client.py`
- Create: `image-uploader/tests/test_webdav_client.py`

- [ ] **Step 1: 编写 test_webdav_client.py（先写测试）**

```python
# tests/test_webdav_client.py
from unittest.mock import patch, MagicMock
import pytest
import webdav_client

URL = "https://example.com/dav"
USER = "user"
PASS = "pass"


def _mock_resp(content: bytes = b"", status: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.content = content
    resp.raise_for_status = MagicMock()
    return resp


def test_upload_sends_put_to_correct_url():
    with patch("webdav_client.requests.put", return_value=_mock_resp()) as mock_put:
        webdav_client.upload(URL, USER, PASS, "/images/cat.jpg", b"data")
        mock_put.assert_called_once()
        called_url = mock_put.call_args[0][0]
        assert called_url == "https://example.com/dav/images/cat.jpg"


def test_upload_sends_correct_body():
    with patch("webdav_client.requests.put", return_value=_mock_resp()) as mock_put:
        webdav_client.upload(URL, USER, PASS, "/images/cat.jpg", b"imagedata")
        assert mock_put.call_args[1]["data"] == b"imagedata"


def test_upload_raises_on_http_error():
    resp = _mock_resp()
    resp.raise_for_status.side_effect = Exception("HTTP 401 Unauthorized")
    with patch("webdav_client.requests.put", return_value=resp):
        with pytest.raises(Exception, match="401"):
            webdav_client.upload(URL, USER, PASS, "/images/cat.jpg", b"data")


def test_download_returns_content():
    with patch("webdav_client.requests.get", return_value=_mock_resp(b"imagedata")):
        result = webdav_client.download(URL, USER, PASS, "/images/cat.jpg")
        assert result == b"imagedata"


def test_download_sends_get_to_correct_url():
    with patch("webdav_client.requests.get", return_value=_mock_resp(b"x")) as mock_get:
        webdav_client.download(URL, USER, PASS, "/images/cat.jpg")
        assert mock_get.call_args[0][0] == "https://example.com/dav/images/cat.jpg"


def test_delete_sends_delete_to_correct_url():
    with patch("webdav_client.requests.delete", return_value=_mock_resp()) as mock_del:
        webdav_client.delete(URL, USER, PASS, "/images/cat.jpg")
        assert mock_del.call_args[0][0] == "https://example.com/dav/images/cat.jpg"


def test_delete_raises_on_http_error():
    resp = _mock_resp()
    resp.raise_for_status.side_effect = Exception("HTTP 404")
    with patch("webdav_client.requests.delete", return_value=resp):
        with pytest.raises(Exception, match="404"):
            webdav_client.delete(URL, USER, PASS, "/images/cat.jpg")
```

- [ ] **Step 2: 运行测试，确认全部失败**

```bash
cd image-uploader
pytest tests/test_webdav_client.py -v
```

预期：`ModuleNotFoundError: No module named 'webdav_client'`

- [ ] **Step 3: 创建 webdav_client.py**

```python
# webdav_client.py — WebDAV 操作封装（PUT / GET / DELETE）
import requests
from requests.auth import HTTPBasicAuth


def _auth(username: str, password: str) -> HTTPBasicAuth:
    return HTTPBasicAuth(username, password)


def _url(webdav_url: str, remote_path: str) -> str:
    """拼接 WebDAV 基础 URL 与远程路径"""
    return f"{webdav_url.rstrip('/')}{remote_path}"


def upload(webdav_url: str, username: str, password: str, remote_path: str, data: bytes) -> None:
    """将 data 上传到 WebDAV remote_path（HTTP PUT）"""
    resp = requests.put(
        _url(webdav_url, remote_path),
        data=data,
        auth=_auth(username, password),
        timeout=60,
    )
    resp.raise_for_status()


def download(webdav_url: str, username: str, password: str, remote_path: str) -> bytes:
    """从 WebDAV remote_path 下载文件内容（HTTP GET）"""
    resp = requests.get(
        _url(webdav_url, remote_path),
        auth=_auth(username, password),
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content


def delete(webdav_url: str, username: str, password: str, remote_path: str) -> None:
    """从 WebDAV 删除 remote_path 文件（HTTP DELETE）"""
    resp = requests.delete(
        _url(webdav_url, remote_path),
        auth=_auth(username, password),
        timeout=30,
    )
    resp.raise_for_status()
```

- [ ] **Step 4: 运行测试，确认全部通过**

```bash
cd image-uploader
pytest tests/test_webdav_client.py -v
```

预期：7 个测试全部 PASSED。

- [ ] **Step 5: 提交**

```bash
git add image-uploader/webdav_client.py image-uploader/tests/test_webdav_client.py
git commit -m "feat: 添加 image-uploader WebDAV 客户端及单元测试"
```

---

## Task 5: app.py + 路由测试

**Files:**
- Create: `image-uploader/app.py`
- Create: `image-uploader/tests/test_app.py`

- [ ] **Step 1: 编写 test_app.py（先写测试）**

```python
# tests/test_app.py
import os
from io import BytesIO
from unittest.mock import patch
import pytest

# conftest.py 已在导入前设置好环境变量
import db
import config
from app import app as flask_app


@pytest.fixture
def client(tmp_path):
    """每个测试用独立的临时 SQLite 数据库"""
    db_path = str(tmp_path / "test.db")
    db.init_db(db_path)
    flask_app.config["TESTING"] = True
    with patch.object(config, "DB_PATH", db_path):
        with flask_app.test_client() as c:
            yield c, db_path


def test_index_returns_200(client):
    c, _ = client
    resp = c.get("/")
    assert resp.status_code == 200
    assert b"image" in resp.data.lower()


def test_upload_no_file_returns_400(client):
    c, _ = client
    resp = c.post("/upload")
    assert resp.status_code == 400
    assert "未选择文件" in resp.get_json()["error"]


def test_upload_invalid_type_returns_400(client):
    c, _ = client
    data = {"file": (BytesIO(b"hello"), "readme.txt")}
    resp = c.post("/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == 400
    assert "不支持的文件类型" in resp.get_json()["error"]


def test_upload_success_returns_201(client):
    c, db_path = client
    with patch("webdav_client.upload"):
        data = {"file": (BytesIO(b"imgdata"), "cat.jpg")}
        resp = c.post("/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["filename"] == "cat.jpg"
    assert body["webdav_path"] == "/images/cat.jpg"
    assert body["file_size"] == 7


def test_upload_webdav_error_returns_500(client):
    c, _ = client
    with patch("webdav_client.upload", side_effect=Exception("连接超时")):
        data = {"file": (BytesIO(b"data"), "test.png")}
        resp = c.post("/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == 500
    assert "WebDAV" in resp.get_json()["error"]


def test_list_images_returns_all(client):
    c, db_path = client
    db.insert_image(db_path, "a.jpg", "/images/a.jpg", 100)
    db.insert_image(db_path, "b.png", "/images/b.png", 200)
    resp = c.get("/images")
    assert resp.status_code == 200
    body = resp.get_json()
    assert len(body) == 2


def test_proxy_not_found_returns_404(client):
    c, _ = client
    resp = c.get("/proxy/9999")
    assert resp.status_code == 404


def test_proxy_returns_image_bytes(client):
    c, db_path = client
    record = db.insert_image(db_path, "cat.jpg", "/images/cat.jpg", 7)
    with patch("webdav_client.download", return_value=b"imgdata"):
        resp = c.get(f"/proxy/{record['id']}")
    assert resp.status_code == 200
    assert resp.data == b"imgdata"
    assert "image/jpeg" in resp.content_type


def test_proxy_webdav_error_returns_502(client):
    c, db_path = client
    record = db.insert_image(db_path, "err.jpg", "/images/err.jpg", 10)
    with patch("webdav_client.download", side_effect=Exception("连接失败")):
        resp = c.get(f"/proxy/{record['id']}")
    assert resp.status_code == 502


def test_delete_image_success(client):
    c, db_path = client
    record = db.insert_image(db_path, "del.jpg", "/images/del.jpg", 256)
    with patch("webdav_client.delete"):
        resp = c.delete(f"/images/{record['id']}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True
    assert db.get_image_by_id(db_path, record["id"]) is None


def test_delete_nonexistent_returns_404(client):
    c, _ = client
    resp = c.delete("/images/9999")
    assert resp.status_code == 404
```

- [ ] **Step 2: 运行测试，确认失败（app.py 不存在）**

```bash
cd image-uploader
pytest tests/test_app.py -v
```

预期：`ModuleNotFoundError: No module named 'app'`

- [ ] **Step 3: 创建 app.py**

```python
# app.py — Flask 主程序
from flask import Flask, request, jsonify, render_template, Response, abort
import config
import db
import webdav_client

app = Flask(__name__)
app.secret_key = config.FLASK_SECRET_KEY

MIME_MAP: dict[str, str] = {
    "jpg":  "image/jpeg",
    "jpeg": "image/jpeg",
    "png":  "image/png",
    "gif":  "image/gif",
    "webp": "image/webp",
}


def _allowed(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "未选择文件"}), 400
    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "文件名为空"}), 400
    if not _allowed(file.filename):
        return jsonify({"error": "不支持的文件类型，仅允许 jpg/png/gif/webp"}), 400

    data = file.read()
    remote_path = f"{config.WEBDAV_IMAGE_DIR}/{file.filename}"

    try:
        webdav_client.upload(
            config.WEBDAV_URL, config.WEBDAV_USERNAME, config.WEBDAV_PASSWORD,
            remote_path, data,
        )
    except Exception as e:
        return jsonify({"error": f"上传到 WebDAV 失败: {e}"}), 500

    record = db.insert_image(config.DB_PATH, file.filename, remote_path, len(data))
    return jsonify(record), 201


@app.route("/images")
def list_images():
    return jsonify(db.get_all_images(config.DB_PATH))


@app.route("/proxy/<int:image_id>")
def proxy(image_id: int):
    record = db.get_image_by_id(config.DB_PATH, image_id)
    if not record:
        abort(404)
    try:
        data = webdav_client.download(
            config.WEBDAV_URL, config.WEBDAV_USERNAME, config.WEBDAV_PASSWORD,
            record["webdav_path"],
        )
    except Exception:
        abort(502)
    ext = record["filename"].rsplit(".", 1)[-1].lower()
    mime = MIME_MAP.get(ext, "application/octet-stream")
    return Response(data, mimetype=mime)


@app.route("/images/<int:image_id>", methods=["DELETE"])
def delete_image(image_id: int):
    record = db.get_image_by_id(config.DB_PATH, image_id)
    if not record:
        return jsonify({"error": "图片不存在"}), 404
    try:
        webdav_client.delete(
            config.WEBDAV_URL, config.WEBDAV_USERNAME, config.WEBDAV_PASSWORD,
            record["webdav_path"],
        )
    except Exception as e:
        return jsonify({"error": f"从 WebDAV 删除失败: {e}"}), 500
    db.delete_image(config.DB_PATH, image_id)
    return jsonify({"success": True})


if __name__ == "__main__":
    db.init_db(config.DB_PATH)
    app.run(debug=True, host="0.0.0.0", port=5050)
```

- [ ] **Step 4: 运行全部测试，确认通过**

```bash
cd image-uploader
pytest -v
```

预期：全部测试（test_db + test_webdav_client + test_app）PASSED，0 失败。

- [ ] **Step 5: 提交**

```bash
git add image-uploader/app.py image-uploader/tests/test_app.py
git commit -m "feat: 添加 image-uploader Flask 路由及集成测试"
```

---

## Task 6: templates/index.html — 前端界面

**Files:**
- Create: `image-uploader/templates/index.html`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>图片上传</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f0f2f8;
      --card-bg: #fff;
      --text: #1a1a2e;
      --sub: #6b7280;
      --border: #e5e7eb;
      --accent1: #667eea;
      --accent2: #764ba2;
    }
    [data-theme="dark"] {
      --bg: #0f0f1a;
      --card-bg: #1a1a2e;
      --text: #e5e7eb;
      --sub: #9ca3af;
      --border: #2d2d44;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      transition: background .3s, color .3s;
    }

    header {
      background: linear-gradient(135deg, var(--accent1), var(--accent2));
      color: #fff;
      padding: 1.2rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    header h1 { font-size: 1.4rem; font-weight: 700; }

    .theme-btn {
      background: rgba(255,255,255,.2);
      border: none;
      color: #fff;
      padding: .4rem .9rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: .85rem;
    }

    .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }

    /* 上传区域 */
    .upload-box {
      background: var(--card-bg);
      border: 2px dashed var(--accent1);
      border-radius: 16px;
      padding: 2.5rem;
      text-align: center;
      cursor: pointer;
      transition: border-color .2s, background .2s;
      margin-bottom: 1.5rem;
    }
    .upload-box.dragover {
      border-color: var(--accent2);
      background: rgba(102,126,234,.07);
    }
    .upload-box p { color: var(--sub); margin-bottom: 1rem; font-size: 1rem; }
    #fileInput { display: none; }

    .btn {
      display: inline-block;
      padding: .55rem 1.4rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: .9rem;
      font-weight: 600;
      transition: opacity .2s;
    }
    .btn:hover { opacity: .85; }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent1), var(--accent2));
      color: #fff;
      margin-left: .5rem;
    }
    .btn-ghost {
      background: var(--border);
      color: var(--text);
    }

    /* 进度条 */
    .progress-wrap { margin-bottom: 1rem; display: none; }
    .progress-bar {
      background: var(--border);
      border-radius: 20px;
      height: 8px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent1), var(--accent2));
      width: 0%;
      transition: width .2s;
      border-radius: 20px;
    }
    .progress-label { font-size: .8rem; color: var(--sub); margin-top: .4rem; }

    /* 列表标题 */
    .list-header {
      display: flex;
      align-items: baseline;
      gap: .8rem;
      margin-bottom: 1.2rem;
    }
    .list-header h2 { font-size: 1.15rem; }
    .list-header .count { color: var(--sub); font-size: .85rem; }

    /* 卡片网格 */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.2rem;
    }
    .card {
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
      transition: transform .2s, box-shadow .2s;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }

    .card-img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      cursor: zoom-in;
      background: var(--border);
      display: block;
    }
    .card-body { padding: .8rem; }
    .card-filename {
      font-size: .82rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: .3rem;
    }
    .card-meta { font-size: .72rem; color: var(--sub); margin-bottom: .2rem; }
    .card-path {
      font-size: .68rem;
      color: var(--sub);
      word-break: break-all;
      opacity: .75;
      margin-bottom: .6rem;
    }
    .btn-del {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      padding: .3rem .7rem;
      font-size: .75rem;
      cursor: pointer;
      width: 100%;
      transition: background .2s;
    }
    .btn-del:hover { background: #fecaca; }

    .empty { text-align: center; color: var(--sub); padding: 3rem 0; }

    /* Lightbox */
    .lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.85);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
    }
    .lightbox.active { display: flex; }
    .lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }

    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: #1a1a2e;
      color: #fff;
      padding: .7rem 1.2rem;
      border-radius: 8px;
      font-size: .85rem;
      opacity: 0;
      transition: opacity .3s;
      z-index: 999;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <header>
    <h1>📷 图片上传</h1>
    <button class="theme-btn" onclick="toggleTheme()">🌙 深色</button>
  </header>

  <div class="container">
    <!-- 上传区 -->
    <div class="upload-box" id="dropZone">
      <p>拖拽图片到此处，或点击选择文件</p>
      <input type="file" id="fileInput" accept="image/*" multiple>
      <button class="btn btn-ghost" onclick="document.getElementById('fileInput').click()">选择文件</button>
      <button class="btn btn-primary" onclick="uploadFiles()">上传</button>
    </div>

    <div class="progress-wrap" id="progressWrap">
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <div class="progress-label" id="progressLabel">上传中...</div>
    </div>

    <!-- 列表 -->
    <div class="list-header">
      <h2>图片列表</h2>
      <span class="count" id="countLabel"></span>
    </div>
    <div class="grid" id="grid"></div>
  </div>

  <!-- Lightbox -->
  <div class="lightbox" id="lightbox" onclick="closeLightbox()">
    <img id="lightboxImg" src="" alt="">
  </div>

  <div class="toast" id="toast"></div>

  <script>
    // ── 主题 ──────────────────────────────────────
    const root = document.documentElement;
    const themeBtn = document.querySelector('.theme-btn');
    let dark = localStorage.getItem('theme') === 'dark';
    applyTheme();

    function toggleTheme() {
      dark = !dark;
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      applyTheme();
    }
    function applyTheme() {
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      themeBtn.textContent = dark ? '☀️ 浅色' : '🌙 深色';
    }

    // ── 拖拽 ──────────────────────────────────────
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      fileInput.files = e.dataTransfer.files;
    });

    // ── 上传 ──────────────────────────────────────
    function uploadFiles() {
      const files = fileInput.files;
      if (!files.length) { showToast('请先选择图片'); return; }

      const progressWrap = document.getElementById('progressWrap');
      const progressFill = document.getElementById('progressFill');
      const progressLabel = document.getElementById('progressLabel');

      let done = 0;
      const total = files.length;
      progressWrap.style.display = 'block';

      const uploadOne = (file) => new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append('file', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload');
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            const pct = Math.round(((done + e.loaded / e.total) / total) * 100);
            progressFill.style.width = pct + '%';
            progressLabel.textContent = `上传中 ${pct}%（${done + 1}/${total}）`;
          }
        };
        xhr.onload = () => {
          if (xhr.status === 201) { done++; resolve(); }
          else {
            const msg = JSON.parse(xhr.responseText)?.error || '上传失败';
            reject(new Error(`${file.name}: ${msg}`));
          }
        };
        xhr.onerror = () => reject(new Error(`${file.name}: 网络错误`));
        xhr.send(fd);
      });

      (async () => {
        for (const file of files) {
          try { await uploadOne(file); }
          catch (err) { showToast(err.message); }
        }
        progressWrap.style.display = 'none';
        progressFill.style.width = '0%';
        fileInput.value = '';
        showToast(`成功上传 ${done}/${total} 张`);
        loadImages();
      })();
    }

    // ── 列表 ──────────────────────────────────────
    function loadImages() {
      fetch('/images')
        .then(r => r.json())
        .then(images => {
          const grid = document.getElementById('grid');
          const countLabel = document.getElementById('countLabel');
          countLabel.textContent = `共 ${images.length} 张`;
          if (!images.length) {
            grid.innerHTML = '<p class="empty">暂无图片，上传第一张吧 ✨</p>';
            return;
          }
          grid.innerHTML = images.map(img => `
            <div class="card" id="card-${img.id}">
              <img class="card-img" src="/proxy/${img.id}"
                   alt="${img.filename}"
                   onclick="openLightbox(${img.id})"
                   onerror="this.style.background='#e5e7eb'">
              <div class="card-body">
                <div class="card-filename" title="${img.filename}">${img.filename}</div>
                <div class="card-meta">📅 ${formatTime(img.uploaded_at)}</div>
                <div class="card-meta">📦 ${formatSize(img.file_size)}</div>
                <div class="card-path" title="${img.webdav_path}">${img.webdav_path}</div>
                <button class="btn-del" onclick="deleteImage(${img.id})">删除</button>
              </div>
            </div>
          `).join('');
        })
        .catch(() => showToast('加载图片列表失败'));
    }

    // ── 删除 ──────────────────────────────────────
    function deleteImage(id) {
      if (!confirm('确定要删除这张图片吗？此操作不可撤销。')) return;
      fetch(`/images/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            document.getElementById(`card-${id}`)?.remove();
            showToast('已删除');
            loadImages();
          } else {
            showToast(data.error || '删除失败');
          }
        })
        .catch(() => showToast('删除请求失败'));
    }

    // ── Lightbox ──────────────────────────────────
    function openLightbox(id) {
      document.getElementById('lightboxImg').src = `/proxy/${id}`;
      document.getElementById('lightbox').classList.add('active');
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
      document.getElementById('lightboxImg').src = '';
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    // ── 工具函数 ──────────────────────────────────
    function formatTime(iso) {
      if (!iso) return '';
      const d = new Date(iso.replace('Z', '+00:00'));
      return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    }
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    // ── 初始化 ────────────────────────────────────
    loadImages();
  </script>
</body>
</html>
```

- [ ] **Step 2: 本地启动验证页面可正常显示**

```bash
cd image-uploader
python app.py
```

在浏览器访问 `http://localhost:5050`，应看到上传界面（即使 WebDAV 未连接，界面应正常渲染）。

- [ ] **Step 3: 提交**

```bash
git add image-uploader/templates/index.html
git commit -m "feat: 添加 image-uploader 前端界面（上传+列表+预览+删除）"
```

---

## Task 7: 全量测试 + 部署配置

**Files:**
- 无新建文件，验证所有测试通过后推送并记录部署步骤

- [ ] **Step 1: 运行全量测试**

```bash
cd image-uploader
pytest -v
```

预期：全部测试 PASSED，0 失败，0 错误。

- [ ] **Step 2: 推送到 GitHub**

```bash
git push origin feature/image-uploader
```

- [ ] **Step 3: ECS 部署**

```bash
ssh ecs
cd /opt/ClaudeTest           # 或项目所在路径
git pull origin feature/image-uploader

cd image-uploader
pip install -r requirements.txt

# 首次部署：创建 .env
cat > .env << 'EOF'
WEBDAV_URL=https://shiyiwanli.ugreenlink.com:5005/dav
WEBDAV_USERNAME=shiyiwanli
WEBDAV_PASSWORD=真实密码
FLASK_SECRET_KEY=生成一个随机字符串
DB_PATH=/opt/image-uploader/images.db
EOF

# 初始化数据库
python -c "import config, db; db.init_db(config.DB_PATH)"

# 启动服务（后台）
gunicorn -w 2 -b 0.0.0.0:5050 app:app --daemon --pid /tmp/image-uploader.pid
```

- [ ] **Step 4: 验证 ECS 服务可访问**

```bash
curl http://<ECS公网IP>:5050/images
```

预期：返回 `[]`（空数组）。

- [ ] **Step 5: 合并并提交**

```bash
# 本地
git checkout main
git merge feature/image-uploader
git push origin main
git commit -m "feat: 完成 image-uploader 模块，支持 WebDAV 上传、SQLite 存储、图片列表"
```

---

## 自检清单

- [x] **spec 覆盖：** 上传（POST /upload）、列表（GET /images）、预览（GET /proxy/<id>）、删除（DELETE /images/<id>）、文件类型校验、SQLite 存储、WebDAV 中转、前端拖拽/进度/lightbox/删除确认 — 全部有对应任务
- [x] **无占位符：** 无 TBD / TODO
- [x] **类型一致性：** db.py 的 `insert_image` 返回 dict，app.py 的 `jsonify(record)` 直接使用，proxy 路由读 `record["webdav_path"]` / `record["filename"]` — 全部一致
- [x] **函数名一致性：** `webdav_client.upload/download/delete` 在 app.py 和测试中调用名称完全匹配
