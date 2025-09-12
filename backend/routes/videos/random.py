from fastapi import APIRouter
from utils.db_utils import get_random_ready_links
from utils.logging_config import get_logger

router = APIRouter()
logger = get_logger("routes.videos.random")


@router.get("/random")
def get_random(limit: int = 10):
    logger.info(f"Received request for random videos - limit: {limit}")

    try:
        videos = get_random_ready_links(limit)
        logger.info(f"Successfully retrieved {len(videos)} random videos")
        return videos
    
    except Exception as e:
        logger.error(f"Error retrieving random videos - limit: {limit}, error: {e}")
        raise
