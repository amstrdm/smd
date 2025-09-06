from fastapi import APIRouter
from utils.db_utils import search_videos_by_title

router = APIRouter()


@router.get("/search")
def search_videos(query: str):
    return search_videos_by_title(query)
