import os

from fastapi import APIRouter
from utils.db_utils import count_ready_links, get_latest_ready_links
from utils.logging_config import get_logger

router = APIRouter()
logger = get_logger("routes.videos.latest")


@router.get("/latest")
def get_latest(limit: int = 10, page: int = 1):
    logger.info(f"Received request for latest videos - limit: {limit}, page: {page}")

    try:
        total_items = count_ready_links()
        total_pages = (total_items + limit - 1) // limit
        logger.debug(f"Total items: {total_items}, total pages: {total_pages}")

        paginated_videos = get_latest_ready_links(limit=limit, page=page)
        logger.info(f"Successfully retrieved {len(paginated_videos)} videos for page {page}")

        return {
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "total_items": total_items,
            "videos": paginated_videos,
        }
    
    except Exception as e:
        logger.error(f"Error retrieving latest videos - limit: {limit}, page: {page}, error: {e}")
        raise
