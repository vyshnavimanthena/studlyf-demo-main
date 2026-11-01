"""Load submission file field bytes for download endpoints."""
import base64
import os
from pathlib import Path
from typing import Any, Optional, Tuple


_MIME_EXT_MAP = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/json": "json",
    "application/zip": "zip",
}


def _mime_to_ext(mime: str) -> str:
    """Derive a file extension from a MIME type."""
    m = mime.lower().strip()
    if m in _MIME_EXT_MAP:
        return _MIME_EXT_MAP[m]
    if m.startswith("image/"):
        return m.split("/")[-1]
    if m.startswith("video/"):
        return m.split("/")[-1]
    if m.startswith("audio/"):
        return m.split("/")[-1]
    if "presentation" in m or "powerpoint" in m:
        return "pptx"
    if "word" in m or "document" in m:
        return "docx"
    if "spreadsheet" in m or "excel" in m or "sheet" in m:
        return "xlsx"
    if "pdf" in m:
        return "pdf"
    return "bin"


def load_submission_field_file(value: Any, field_id: str = "file") -> Tuple[Optional[bytes], str, str]:
    """Return (raw_bytes, mime_type, filename) for a submission data field value."""
    mime = "application/octet-stream"
    filename = f"{field_id}.bin"
    raw: Optional[bytes] = None

    if isinstance(value, str) and value.startswith("data:"):
        header, _, encoded = value.partition(",")
        mime = header[5:].split(";")[0] if header.startswith("data:") else mime
        try:
            raw = base64.b64decode(encoded)
        except Exception:
            return None, mime, filename
        ext = _mime_to_ext(mime)
        filename = f"{field_id}.{ext}"
    elif isinstance(value, dict) and value.get("_stored_file"):
        meta = value
        mime = str(meta.get("mime") or meta.get("mime_type") or meta.get("content_type") or mime)
        raw_filename = meta.get("filename")
        if raw_filename:
            filename = str(raw_filename)
        elif mime:
            ext = _mime_to_ext(mime)
            filename = f"{field_id}.{ext}"
        storage_key = meta.get("storage_key") or meta.get("path")
        if storage_key:
            upload_root = Path(os.getenv("UPLOAD_DIR", "uploads"))
            file_path = upload_root / str(storage_key).lstrip("/")
            if file_path.is_file():
                raw = file_path.read_bytes()
        if raw is None and meta.get("data_uri"):
            data_uri = str(meta["data_uri"])
            if data_uri.startswith("data:"):
                header, _, encoded = data_uri.partition(",")
                mime = header[5:].split(";")[0] if header.startswith("data:") else mime
                try:
                    raw = base64.b64decode(encoded)
                except Exception:
                    raw = None

    return raw, mime, filename
