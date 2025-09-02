import os
import random

from fastapi import APIRouter
from tinydb import TinyDB

router = APIRouter()


current_dir = os.path.dirname(os.path.abspath(__file__))
db_folder = os.path.join(os.path.dirname(current_dir), "db")
db_path = os.path.join(db_folder, "database.json")
db = TinyDB(db_path)


@router.get("/random")
def get_random(limit: int = 10):

    all_links = db.all()
    try:
        random_elements = random.sample(all_links, k=limit)
    except ValueError as e:
        if str(e) == "Sample larger than population or is negative":
            random_elements = all_links

    return random_elements
