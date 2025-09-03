from fastapi import APIRouter
from utils.db_utils import get_random_ready_links

router = APIRouter()


@router.get("/random")
def get_random(limit: int = 10):

    return get_random_ready_links(limit)
