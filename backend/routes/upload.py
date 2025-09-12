import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.db_utils import add_link, get_link_by_url
from utils.upload_link import process_link_task
from utils.logging_config import get_logger

router = APIRouter()
logger = get_logger("routes.upload")


class LinkItem(BaseModel):
    url: str


@router.post("/upload")
def upload_link(link: LinkItem):
    logger.info(f"Received upload request for URL: {link.url}")
    
    try:
        link_already_in_db = get_link_by_url(link.url) is not None
        if link_already_in_db:
            logger.warning(f"Upload rejected - URL already exists in database: {link.url}")
            raise HTTPException(status_code=409, detail="Link already in Database")

        preview_id = str(uuid.uuid4())
        logger.info(f"Generated preview_id: {preview_id} for URL: {link.url}")
        
        # preview_id could be duplicated and be from another url this should be fixed with a proper UUID
        add_link(link.url, preview_id)
        logger.info(f"Successfully added link to database - preview_id: {preview_id}")

        process_link_task.delay(link.url, preview_id)
        logger.info(f"Queued processing task for preview_id: {preview_id}")
        
        return {"status": "queued", "preview_id": preview_id}
    
    except HTTPException:
        # Re-raise HTTP exceptions as they are already handled
        raise
    except Exception as e:
        logger.error(f"Unexpected error during upload for URL {link.url}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during upload")
