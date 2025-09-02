import os

from fastapi import APIRouter
from tinydb import TinyDB

router = APIRouter()

current_dir = os.path.dirname(os.path.abspath(__file__))
db_folder = os.path.join(os.path.dirname(current_dir), "db")
db_path = os.path.join(db_folder, "database.json")
db = TinyDB(db_path)


@router.get("/latest")
def get_latest(limit: int = 10, page: int = 1):
    all_items = db.all()
    all_items.reverse()

    total_items = len(all_items)
    total_pages = (total_items + limit - 1) // limit

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_videos = all_items[start_idx:end_idx]

    return {
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "total_items": total_items,
        "videos": paginated_videos,
    }
