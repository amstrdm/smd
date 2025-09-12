import os

from fastapi import APIRouter, HTTPException
from utils.db_utils import delete_link_by_preview_id
from utils.logging_config import get_logger

router = APIRouter()
logger = get_logger("routes.manage.delete")


@router.delete("/delete/{preview_id}", status_code=200)
def delete_item(preview_id: str):
    """
    Deletes an item from the database and its associated preview file from disk.
    """
    logger.info(f"Received delete request for preview_id: {preview_id}")

    try:
        deleted_record = delete_link_by_preview_id(preview_id)

        if not deleted_record:
            logger.warning(f"Delete failed - no record found for preview_id: {preview_id}")
            raise HTTPException(status_code=404, detail="Item not found")

        # After deleting the DB record, try to delete the video file
        preview_file_name = deleted_record.get("preview_path")
        if preview_file_name:
            file_path = os.path.join("routes", "preview_videos", f"{preview_file_name}.mp4")
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Successfully deleted preview file: {file_path}")
                return {
                    "status": "success",
                    "detail": f"Record and preview file for '{preview_id}' were deleted.",
                }
            else:
                logger.warning(f"Preview file not found on disk: {file_path}")
                return {
                    "status": "success",
                    "detail": f"Record for '{preview_id}' was deleted, but its preview file was not found.",
                }

        logger.info(f"Successfully deleted record for preview_id: {preview_id} (no preview file)")
        return {
            "status": "success",
            "detail": f"Record for '{preview_id}' was deleted. No preview file was associated with it.",
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions as they are already handled
        raise
    except Exception as e:
        logger.error(f"Unexpected error during delete for preview_id {preview_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during deletion")
