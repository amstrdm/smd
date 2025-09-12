from fastapi import APIRouter
from utils.db_utils import search_videos_by_title
from utils.logging_config import get_logger

router = APIRouter()
logger = get_logger("routes.videos.search")


@router.get("/search")
def search_videos(query: str):
    logger.info(f"Received search request with query: '{query}'")

    try:
        results = search_videos_by_title(query)
        logger.info(f"Search completed - found {len(results)} results for query: '{query}'")
        return results
    
    except Exception as e:
        logger.error(f"Error during search with query '{query}': {e}")
        raise
