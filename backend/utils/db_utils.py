import os
import sqlite3

# --- Database Path Setup ---
# This ensures the path is correct no matter where the script is run from.
current_dir = os.path.dirname(os.path.abspath(__file__))  # utils/
parent_dir = os.path.dirname(current_dir)  # backend/
DB_FOLDER = os.path.join(parent_dir, "db")
DATABASE_PATH = os.path.join(DB_FOLDER, "videos.db")


def dict_factory(cursor, row):
    """
    Helper function to return database rows as dictionaries.
    This makes transitioning from TinyDB much easier as the data structure is the same.
    """
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


def get_db_connection():
    """Creates and returns a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory  # Return rows as dicts
    return conn


# --- Database Functions ---


def add_link(url: str, preview_id: str):
    """Inserts a new link into the database with a 'queued' status."""
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO videos (url, preview_id, status) VALUES (?, ?, ?)",
            (url, preview_id, "queued"),
        )
        conn.commit()
    finally:
        conn.close()


def get_link_by_url(url: str):
    """Fetches a single record by its URL."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE url = ?", (url,))
        return cursor.fetchone()
    finally:
        conn.close()


def get_link_by_preview_id(preview_id: str):
    """Fetches a single record by its preview_id."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE preview_id = ?", (preview_id,))
        return cursor.fetchone()
    finally:
        conn.close()


def update_link_to_ready(
    preview_id: str, title: str, poster_url: str | None, preview_path: str | None
):
    """Updates a link's status to 'ready' and populates its data."""
    conn = get_db_connection()
    try:
        conn.execute(
            """
            UPDATE videos 
            SET status = 'ready', title = ?, poster_url = ?, preview_path = ?
            WHERE preview_id = ?
            """,
            (title, poster_url, preview_path, preview_id),
        )
        conn.commit()
    finally:
        conn.close()


def update_link_to_failed(preview_id: str, error_msg: str):
    """Updates a link's status to 'failed' and records the error."""
    conn = get_db_connection()
    try:
        conn.execute(
            "UPDATE videos SET status = 'failed', error_message = ? WHERE preview_id = ?",
            (error_msg, preview_id),
        )
        conn.commit()
    finally:
        conn.close()


def get_random_ready_links(limit: int):
    """Fetches a given number of random links that are ready."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # ORDER BY RANDOM() is an efficient way to get random rows in SQLite
        cursor.execute(
            "SELECT * FROM videos WHERE status = 'ready' ORDER BY RANDOM() LIMIT ?",
            (limit,),
        )
        return cursor.fetchall()
    finally:
        conn.close()


def get_latest_ready_links(limit: int, page: int):
    """Fetches a paginated list of the latest links that are ready."""
    conn = get_db_connection()
    # Calculate offset for pagination
    offset = (page - 1) * limit
    try:
        cursor = conn.cursor()
        # ORDER BY id DESC gets the newest entries first
        cursor.execute(
            "SELECT * FROM videos WHERE status = 'ready' ORDER BY id DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        return cursor.fetchall()
    finally:
        conn.close()


def count_ready_links():
    """Counts the total number of links with 'ready' status."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM videos WHERE status = 'ready'")
        # fetchone() will return a dict like {'COUNT(*)': 123}
        count_dict = cursor.fetchone()
        return count_dict["COUNT(*)"] if count_dict else 0
    finally:
        conn.close()
