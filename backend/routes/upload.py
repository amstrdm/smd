import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.db_utils import add_link, get_link_by_url
from utils.upload_link import process_link_task

router = APIRouter()


class LinkItem(BaseModel):
    url: str


@router.post("/upload")
def upload_link(link: LinkItem):
    link_already_in_db = get_link_by_url(link.url) is not None
    if link_already_in_db:
        raise HTTPException(status_code=409, detail="Link already in Database")

    preview_id = str(uuid.uuid4())
    # preview_id could be duplicated and be from another url this should be fixed with a proper UUID
    add_link(link.url, preview_id)

    process_link_task.delay(link.url, preview_id)
    return {"status": "queued", "preview_id": preview_id}
