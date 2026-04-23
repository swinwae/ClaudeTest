# config.py — 从环境变量读取全部配置
import os
import pathlib
from dotenv import load_dotenv

load_dotenv(dotenv_path=pathlib.Path(__file__).parent / ".env", override=True)

WEBDAV_URL: str = os.environ["WEBDAV_URL"]          # 如 https://shiyiwanli.ugreenlink.com:5005/dav
WEBDAV_USERNAME: str = os.environ["WEBDAV_USERNAME"]
WEBDAV_PASSWORD: str = os.environ["WEBDAV_PASSWORD"]
FLASK_SECRET_KEY: str = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")  # 生产环境必须通过环境变量设置，否则 Session 存在安全风险
DB_PATH: str = os.environ.get(
    "DB_PATH",
    str(pathlib.Path(__file__).parent / "images.db")
)

ALLOWED_EXTENSIONS: set[str] = {"jpg", "jpeg", "png", "gif", "webp"}
WEBDAV_IMAGE_DIR: str = "/home/images"
BASE_URL: str = os.environ.get("BASE_URL", "").rstrip("/")
