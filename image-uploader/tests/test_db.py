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
