# app.py — Flask 主程序
from flask import Flask, request, jsonify, render_template, Response, abort
import uuid
import config
import db
import webdav_client

app = Flask(__name__)
app.secret_key = config.FLASK_SECRET_KEY

# 启动时自动初始化数据库
db.init_db(config.DB_PATH)

MIME_MAP: dict = {
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
    return render_template("index.html", base_url=config.BASE_URL)


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
    safe_name = f"{uuid.uuid4().hex}_{file.filename}"
    remote_path = f"{config.WEBDAV_IMAGE_DIR}/{safe_name}"

    try:
        webdav_client.upload(
            config.WEBDAV_URL, config.WEBDAV_USERNAME, config.WEBDAV_PASSWORD,
            remote_path, data,
        )
    except Exception as e:
        return jsonify({"error": f"上传到 WebDAV 失败: {e}"}), 500

    record = db.insert_image(config.DB_PATH, safe_name, remote_path, len(data))
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
    return "", 204


if __name__ == "__main__":
    db.init_db(config.DB_PATH)
    app.run(debug=True, host="0.0.0.0", port=5050)
