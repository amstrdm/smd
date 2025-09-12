import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from utils.db_utils import get_link_by_preview_id
from utils.logging_config import get_logger

router = APIRouter()
logger = get_logger("routes.preview")

current_dir = os.path.dirname(os.path.abspath(__file__))
PREVIEW_DIR = os.path.join(current_dir, "preview_videos")

os.makedirs(PREVIEW_DIR, exist_ok=True)
logger.info(f"Preview directory initialized: {PREVIEW_DIR}")


@router.get("/preview/{preview_id}")
def get_preview(preview_id: str):
    """
    Serves a preview video file based on its unique ID
    """
    logger.info(f"Received preview request for preview_id: {preview_id}")

    try:
        record = get_link_by_preview_id(preview_id)

        if not record:
            logger.warning(f"Preview ID not found: {preview_id}")
            raise HTTPException(status_code=404, detail="Preview ID not found")

        logger.debug(f"Found record for preview_id {preview_id} with status: {record['status']}")

        if record["status"] == "queued":
            logger.info(f"Preview is queued for processing: {preview_id}")
            raise HTTPException(
                status_code=202, detail="Preview is in queue to be processed"
            )

        if record["status"] == "processing":
            logger.info(f"Preview is still being processed: {preview_id}")
            raise HTTPException(status_code=409, detail="Preview is still being processed")

        if record["status"] != "ready" or not record.get("preview_path"):
            logger.warning(f"Preview not available or failed - status: {record['status']}, path: {record.get('preview_path')}")
            raise HTTPException(
                status_code=404, detail="Preview not available or failed to generate"
            )

        file_path = os.path.join(PREVIEW_DIR, f"{ record["preview_path"] }.mp4")
        logger.debug(f"Looking for preview file at: {file_path}")

        if not os.path.exists(file_path):
            logger.error(f"Preview file missing on server: {file_path}")
            raise HTTPException(
                status_code=500, detail="Preview file is missing on the Server"
            )

        logger.info(f"Serving preview file for preview_id: {preview_id}")
        return FileResponse(
            path=file_path,
            media_type="video/mp4",
            filename=f"{preview_id}.mp4",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type, Range",
                "Access-Control-Expose-Headers": "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
            },
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions as they are already handled
        raise
    except Exception as e:
        logger.error(f"Unexpected error serving preview for preview_id {preview_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error serving preview")
