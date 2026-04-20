# webdav_client.py — WebDAV 操作封装（PUT / GET / DELETE）
import requests
from requests.auth import HTTPBasicAuth


def _auth(username: str, password: str) -> HTTPBasicAuth:
    # 便于将来切换为 Digest Auth 或 token 认证
    return HTTPBasicAuth(username, password)


def _url(webdav_url: str, remote_path: str) -> str:
    """拼接 WebDAV 基础 URL 与远程路径，remote_path 须以 / 开头"""
    if not remote_path.startswith("/"):
        raise ValueError(f"remote_path 必须以 '/' 开头，收到：{remote_path!r}")
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
