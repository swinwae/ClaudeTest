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


def test_upload_calls_put_to_correct_url():
    with patch.object(webdav_client._session, "put", return_value=_mock_resp()) as mock_put:
        webdav_client.upload(URL, USER, PASS, "/images/cat.jpg", b"data")
        mock_put.assert_called_once()
        called_url = mock_put.call_args[0][0]
        assert called_url == "https://example.com/dav/images/cat.jpg"


def test_upload_sends_correct_body():
    with patch.object(webdav_client._session, "put", return_value=_mock_resp()) as mock_put:
        webdav_client.upload(URL, USER, PASS, "/images/cat.jpg", b"imagedata")
        assert mock_put.call_args[1]["data"] == b"imagedata"


def test_upload_raises_on_http_error():
    resp = _mock_resp()
    resp.raise_for_status.side_effect = Exception("HTTP 401 Unauthorized")
    with patch.object(webdav_client._session, "put", return_value=resp):
        with pytest.raises(Exception, match="401"):
            webdav_client.upload(URL, USER, PASS, "/images/cat.jpg", b"data")


def test_download_returns_content():
    with patch.object(webdav_client._session, "get", return_value=_mock_resp(b"imagedata")):
        result = webdav_client.download(URL, USER, PASS, "/images/cat.jpg")
        assert result == b"imagedata"


def test_download_sends_get_to_correct_url():
    with patch.object(webdav_client._session, "get", return_value=_mock_resp(b"x")) as mock_get:
        webdav_client.download(URL, USER, PASS, "/images/cat.jpg")
        assert mock_get.call_args[0][0] == "https://example.com/dav/images/cat.jpg"


def test_delete_sends_delete_to_correct_url():
    with patch.object(webdav_client._session, "delete", return_value=_mock_resp()) as mock_del:
        webdav_client.delete(URL, USER, PASS, "/images/cat.jpg")
        assert mock_del.call_args[0][0] == "https://example.com/dav/images/cat.jpg"


def test_delete_raises_on_http_error():
    resp = _mock_resp()
    resp.raise_for_status.side_effect = Exception("HTTP 404")
    with patch.object(webdav_client._session, "delete", return_value=resp):
        with pytest.raises(Exception, match="404"):
            webdav_client.delete(URL, USER, PASS, "/images/cat.jpg")
