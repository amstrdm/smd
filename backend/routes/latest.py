import os

from fastapi import APIRouter
from utils.db_utils import count_ready_links, get_latest_ready_links

router = APIRouter()


@router.get("/latest")
def get_latest(limit: int = 10, page: int = 1):

    total_items = count_ready_links()
    total_pages = (total_items + limit - 1) // limit

    paginated_videos = get_latest_ready_links(limit=limit, page=page)

    return {
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "total_items": total_items,
        "videos": paginated_videos,
    }
