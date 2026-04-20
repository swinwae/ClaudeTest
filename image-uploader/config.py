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
