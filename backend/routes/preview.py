import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from utils.db_utils import get_link_by_preview_id

router = APIRouter()

current_dir = os.path.dirname(os.path.abspath(__file__))
PREVIEW_DIR = os.path.join(current_dir, "preview_videos")

os.makedirs(PREVIEW_DIR, exist_ok=True)


@router.get("/preview/{preview_id}")
def get_preview(preview_id: str):
    """
    Serves a preview video file based on its unique ID
    """

    record = get_link_by_preview_id(preview_id)

    if not record:
        raise HTTPException(status_code=404, detail="Preview ID not found")

    if record["status"] == "queued":
        raise HTTPException(
            status_code=202, detail="Preview is in queue to be processed"
        )

    if record["status"] == "processing":
        raise HTTPException(status_code=409, detail="Preview is still being processed")

    if record["status"] != "ready" or not record.get("preview_path"):
        raise HTTPException(
            status_code=404, detail="Preview not available or failed to generate"
        )

    file_path = os.path.join(PREVIEW_DIR, f"{ record["preview_path"] }.mp4")

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=500, detail="Preview file is missing on the Server"
        )

    return FileResponse(
        path=file_path, media_type="video/mp4", filename=f"{preview_id}.mp4"
    )
