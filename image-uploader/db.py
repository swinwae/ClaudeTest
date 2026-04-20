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
    uploaded_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
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
            "SELECT * FROM images ORDER BY uploaded_at DESC, id DESC"
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
