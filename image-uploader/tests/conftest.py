import os

# 在导入 app/config 之前设置测试用环境变量
os.environ.setdefault("WEBDAV_URL", "https://example.com/dav")
os.environ.setdefault("WEBDAV_USERNAME", "testuser")
os.environ.setdefault("WEBDAV_PASSWORD", "testpass")
os.environ.setdefault("FLASK_SECRET_KEY", "test-secret")
os.environ.setdefault("DB_PATH", ":memory:")
