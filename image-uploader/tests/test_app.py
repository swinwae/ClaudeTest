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
