import os

from fastapi import APIRouter, HTTPException
from utils.db_utils import delete_link_by_preview_id

router = APIRouter()


@router.delete("/delete/{preview_id}", status_code=200)
def delete_item(preview_id: str):
    """
    Deletes an item from the database and its associated preview file from disk.
    """
    deleted_record = delete_link_by_preview_id(preview_id)

    if not deleted_record:
        raise HTTPException(status_code=404, detail="Item not found")

    # After deleting the DB record, try to delete the video file
    preview_file_name = deleted_record.get("preview_path")
    if preview_file_name:
        file_path = os.path.join("routes", "preview_videos", f"{preview_file_name}.mp4")
        if os.path.exists(file_path):
            os.remove(file_path)
            return {
                "status": "success",
                "detail": f"Record and preview file for '{preview_id}' were deleted.",
            }
        else:
            return {
                "status": "success",
                "detail": f"Record for '{preview_id}' was deleted, but its preview file was not found.",
            }

    return {
        "status": "success",
        "detail": f"Record for '{preview_id}' was deleted. No preview file was associated with it.",
    }
