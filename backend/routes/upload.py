import math
import os
import re
import time
from pathlib import PurePosixPath
from urllib.parse import urljoin, urlparse

import ffmpeg
import requests
from bs4 import BeautifulSoup
from bs4.element import Tag
from fastapi import APIRouter, BackgroundTasks, HTTPException
from playwright.sync_api import TimeoutError, sync_playwright
from pydantic import BaseModel
from tinydb import Query, TinyDB

router = APIRouter()

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

db_folder = os.path.join(parent_dir, "db")
os.makedirs(db_folder, exist_ok=True)
db_path = os.path.join(db_folder, "database.json")
db = TinyDB(db_path)


class LinkItem(BaseModel):
    url: str


def get_url_identifier(url):
    # Parse the URL to remove query parameters and fragments
    parsed = urlparse(url)
    # Get the path part and extract the last segment
    last_segment = PurePosixPath(parsed.path).name
    # Remove the extension if there is one
    identifier = last_segment.split(".")[0]
    return identifier


def get_poster_url_from_video(soup: BeautifulSoup):
    poster_url = None
    video_tag = soup.find("video")
    if isinstance(video_tag, Tag):
        poster_url = video_tag.get("poster")

    if poster_url is None:
        meta_tag = soup.find("meta", attrs={"itemprop": "thumbnailUrl"})
        if isinstance(meta_tag, Tag):
            poster_url = meta_tag.get("content")

    return poster_url


def get_video_src_with_playwright(url: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        try:
            page.wait_for_selector("video", timeout=10000, state="attached")
            video_element = page.query_selector("video")
        except TimeoutError:
            video_element = None

        if video_element:
            src = video_element.get_attribute("src")
            browser.close()
            return src
        else:
            browser.close()
            return None


def fetch_page_with_playwright(url: str):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, timeout=30000)
        html = page.content()
        browser.close()
        return BeautifulSoup(html, features="html.parser")


def download_video(soup: BeautifulSoup, url: str, headers: dict):
    video_src = None
    video_tag = soup.find("video")

    if isinstance(video_tag, Tag):
        video_src = video_tag.get("src")
        if not video_src:
            source_tag = video_tag.find("source")
            if not source_tag:
                parent = video_tag.parent
                if parent:
                    source_tag = parent.find("source")
            if isinstance(source_tag, Tag):
                video_src = source_tag.get("src")

    print(video_src)
    if not video_src:
        video_src = get_video_src_with_playwright(url)
        print("SRC:", video_src)
    if not video_src:
        print("Couldn't find video source")
        return None

    if not isinstance(video_src, str):
        print("Okay genuinely what kind of fucking video are you looking at")
        return None

    if video_src.startswith("//"):
        video_src = "https:" + video_src

    with requests.get(video_src, headers=headers, stream=True) as r:
        r.raise_for_status()
        tmp_path = os.path.join(current_dir, "tmp")
        os.makedirs(tmp_path, exist_ok=True)
        save_path = os.path.join(tmp_path, get_url_identifier(video_src))

        total_size = int(r.headers.get("Content-Length", 0))
        downloaded = 0
        with open(save_path, "wb") as f:
            print(f"Downloading and saving video to {save_path}")
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                percent = downloaded / total_size * 100
                print(f"Downloaded: {percent:.2f}%", end="")

    print(f"Download complete for {save_path}")

    return save_path


def generate_preview_from_video(
    input_path: str,
    output_path: str,
    file_id: str,
    BaseClips: int = 5,
    ScalingFactor: float = 1.5,
    n_cap: int = 30,
):
    """
    Generates a preview for a given video and saves it.

    **Also deletes the original downloaded file after generating the preview**

    We want the length of the preview to scale in a non linear fashion to the length of the original video.

    To do this we chain one second excerpts from the video to each other and increase the number of excerpts based on the length of the video.

    The number of excerpts is calculated via this formula:

    **N = round(BaseClips + ScalingFactor * sqrt(DurationInMinutes))**

    Where:
    - BaseClips is the minimum amount of clips and set to 5 by default.
    - ScalingFactor is set to 1.5 by default
    - N is capped at 30
    """

    try:
        print(f"Processing {input_path} to create preview...")
        # Get video duration
        probe = ffmpeg.probe(input_path)
        duration = float(probe["format"]["duration"])

        # Use formula to calculate number of clips
        duration_min = duration / 60
        num_clips = math.floor(BaseClips + ScalingFactor * math.sqrt(duration_min))

        num_clips = min(num_clips, n_cap)
        print(f"Video Duration: {duration:.2f}s. Generating {num_clips} clips.")

        interval = duration / num_clips
        clips = []
        for i in range(num_clips):
            start_time = (i + 0.5) * interval
            clip = ffmpeg.input(input_path, ss=start_time, t=1).filter(
                "setpts", "PTS-STARTPTS"
            )  # Resets Timestamp for concatenation
            clips.append(clip)
        # Concatenate Clips
        (
            ffmpeg.concat(*clips, v=1, a=0)
            .output(output_path, movflags="faststart")
            .run(overwrite_output=True, quiet=True)
        )
        print(f"Preview saved succesfully to {output_path}")
        return file_id
    except ffmpeg.Error as e:
        print(f"FFmpeg Error: {e.stderr.decode()}")
        return None
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
            print(f"Cleaned up temporary video at {input_path}")


@router.post("/upload")
def upload_link(link: LinkItem, background_tasks: BackgroundTasks):
    link_already_in_db = db.get(Query().url == link.url) is not None
    if link_already_in_db:
        raise HTTPException(status_code=409, detail="Link already in Database")

    # preview_id could be duplicated and be from another url this should be fixed with a proper UUID
    preview_id = get_url_identifier(link.url)
    db.insert(
        {
            "url": link.url,
            "title": None,
            "poster_url": None,
            "preview_path": None,
            "preview_id": preview_id,
            "status": "processing",
        }
    )
    background_tasks.add_task(process_link, link.url, preview_id)
    return {"status": "processing", "preview_id": preview_id}


def process_link(url: str, preview_id: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, features="html.parser")
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            soup = fetch_page_with_playwright(url)

    if soup.title and soup.title.string:
        # clean up title
        domain_match = re.search(r"(?:https?://)?(?:www\.)?([^/]+)", url)
        if not domain_match:
            title = soup.title.string
        else:
            base_domain = domain_match.group(1)
            pattern_to_remove = re.escape(base_domain)
            title = re.sub(
                pattern_to_remove, "", soup.title.string, flags=re.IGNORECASE
            )
    else:
        title = "N/A"

    poster_url = get_poster_url_from_video(soup)

    save_path = download_video(soup, url, headers=headers)

    preview_path = None
    if save_path:
        base_preview_path = os.path.join(current_dir, "preview_videos")
        os.makedirs(base_preview_path, exist_ok=True)

        file_id = get_url_identifier(url)
        preview_save_path = os.path.join(base_preview_path, file_id + ".mp4")
        preview_path = generate_preview_from_video(
            save_path, preview_save_path, file_id
        )

    db.update(
        {
            "title": title,
            "poster_url": poster_url,
            "preview_path": preview_path,
            "status": "ready",
        },
        Query().preview_id == preview_id,
    )
    print("Updated DB")
