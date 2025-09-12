import os
import sqlite3
from utils.logging_config import get_logger

# Initialize logger for database operations
logger = get_logger("db_utils")

# --- Database Path Setup ---
# This ensures the path is correct no matter where the script is run from.
current_dir = os.path.dirname(os.path.abspath(__file__))  # utils/
parent_dir = os.path.dirname(current_dir)  # backend/
DB_FOLDER = os.path.join(parent_dir, "db")
DATABASE_PATH = os.path.join(DB_FOLDER, "videos.db")

logger.info(f"Database path configured: {DATABASE_PATH}")


def dict_factory(cursor, row):
    """
    Helper function to return database rows as dictionaries.
    This makes transitioning from TinyDB much easier as the data structure is the same.
    """
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


def get_db_connection():
    """Creates and returns a database connection."""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = dict_factory  # Return rows as dicts
        logger.debug("Database connection established successfully")
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to establish database connection: {e}")
        raise


# --- Database Functions ---


def add_link(url: str, preview_id: str):
    """Inserts a new link into the database with a 'queued' status."""
    logger.info(f"Adding new link to database - URL: {url}, Preview ID: {preview_id}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO videos (url, preview_id, status) VALUES (?, ?, ?)",
            (url, preview_id, "queued"),
        )
        conn.commit()
        logger.info(f"Successfully added link to database - Preview ID: {preview_id}")
    except sqlite3.Error as e:
        logger.error(f"Failed to add link to database - URL: {url}, Error: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def get_link_by_url(url: str):
    """Fetches a single record by its URL."""
    logger.debug(f"Querying database for URL: {url}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE url = ?", (url,))
        result = cursor.fetchone()
        if result:
            logger.debug(f"Found existing record for URL: {url}")
        else:
            logger.debug(f"No record found for URL: {url}")
        return result
    except sqlite3.Error as e:
        logger.error(f"Database error while querying URL {url}: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def get_link_by_preview_id(preview_id: str):
    """Fetches a single record by its preview_id."""
    logger.debug(f"Querying database for preview_id: {preview_id}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE preview_id = ?", (preview_id,))
        result = cursor.fetchone()
        if result:
            logger.debug(f"Found record for preview_id: {preview_id}")
        else:
            logger.debug(f"No record found for preview_id: {preview_id}")
        return result
    except sqlite3.Error as e:
        logger.error(f"Database error while querying preview_id {preview_id}: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def update_link_to_ready(
    preview_id: str, title: str, poster_url: str | None, preview_path: str | None
):
    """Updates a link's status to 'ready' and populates its data."""
    logger.info(f"Starting update_link_to_ready for preview_id: {preview_id}")
    logger.debug(f"Received data - Title: '{title}', Poster URL: {poster_url}, Preview Path: {preview_path}")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE videos 
            SET status = 'ready', title = ?, poster_url = ?, preview_path = ?
            WHERE preview_id = ?
            """,
            (title, poster_url, preview_path, preview_id),
        )
        conn.commit()
        logger.info(f"Successfully updated video status to 'ready' for preview_id: {preview_id}")

        cursor.execute("SELECT id from videos WHERE preview_id = ?", (preview_id,))
        result = cursor.fetchone()
        logger.debug(f"Fetched video record from DB. Result: {result}")

        if result and title:
            video_id = result["id"]
            logger.debug(f"Updating FTS for video_id: {video_id} with title: '{title}'")
            try:
                cursor.execute(
                    "REPLACE INTO videos_fts(rowid, title) VALUES(?, ?)",
                    (video_id, title),
                )
                conn.commit()
                logger.info(f"Successfully updated videos_fts table for video_id: {video_id}")
            except sqlite3.Error as e:
                logger.error(f"Failed to update FTS table for video_id {video_id}: {e}")
                raise
        else:
            logger.warning(f"Skipping FTS update - result: {result}, title: '{title}'")

    except sqlite3.Error as e:
        logger.error(f"Database error in update_link_to_ready for preview_id {preview_id}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in update_link_to_ready for preview_id {preview_id}: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")
        logger.info(f"Completed update_link_to_ready for preview_id: {preview_id}")


def update_link_to_failed(preview_id: str, error_msg: str):
    """Updates a link's status to 'failed' and records the error."""
    logger.warning(f"Updating link to failed status - preview_id: {preview_id}, error: {error_msg}")
    conn = get_db_connection()
    try:
        conn.execute(
            "UPDATE videos SET status = 'failed', error_message = ? WHERE preview_id = ?",
            (error_msg, preview_id),
        )
        conn.commit()
        logger.info(f"Successfully updated link to failed status for preview_id: {preview_id}")
    except sqlite3.Error as e:
        logger.error(f"Failed to update link to failed status for preview_id {preview_id}: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def get_random_ready_links(limit: int):
    """Fetches a given number of random links that are ready."""
    logger.debug(f"Fetching {limit} random ready links")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # ORDER BY RANDOM() is an efficient way to get random rows in SQLite
        cursor.execute(
            "SELECT * FROM videos WHERE status = 'ready' ORDER BY RANDOM() LIMIT ?",
            (limit,),
        )
        results = cursor.fetchall()
        logger.debug(f"Retrieved {len(results)} random ready links")
        return results
    except sqlite3.Error as e:
        logger.error(f"Database error while fetching random ready links: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def get_latest_ready_links(limit: int, page: int):
    """Fetches a paginated list of the latest links that are ready."""
    logger.debug(f"Fetching latest ready links - limit: {limit}, page: {page}")
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
        results = cursor.fetchall()
        logger.debug(f"Retrieved {len(results)} latest ready links for page {page}")
        return results
    except sqlite3.Error as e:
        logger.error(f"Database error while fetching latest ready links: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def count_ready_links():
    """Counts the total number of links with 'ready' status."""
    logger.debug("Counting ready links")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM videos WHERE status = 'ready'")
        # fetchone() will return a dict like {'COUNT(*)': 123}
        count_dict = cursor.fetchone()
        count = count_dict["COUNT(*)"] if count_dict else 0
        logger.debug(f"Found {count} ready links")
        return count
    except sqlite3.Error as e:
        logger.error(f"Database error while counting ready links: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def delete_link_by_preview_id(preview_id: str):
    """Deletes a record by its preview_id and returns the deleted record."""
    logger.info(f"Deleting link with preview_id: {preview_id}")
    # First, get the record so we know the preview_path for file deletion
    record_to_delete = get_link_by_preview_id(preview_id)
    if not record_to_delete:
        logger.warning(f"No record found for preview_id: {preview_id}")
        return None

    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM videos WHERE preview_id = ?", (preview_id,))
        conn.commit()
        logger.info(f"Successfully deleted record for preview_id: {preview_id}")
        return record_to_delete
    except sqlite3.Error as e:
        logger.error(f"Database error while deleting preview_id {preview_id}: {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")


def search_videos_by_title(query: str):
    """Performs a full text search on titles of the video table and returns the results"""
    logger.info(f"Searching videos by title with query: '{query}'")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT  v.id, v.title, v.url, v.poster_url, v.preview_path, v.preview_id
            FROM videos_fts f
            JOIN videos v ON v.id = f.rowid
            WHERE videos_fts MATCH ?
        """,
            (query,),
        )
        results = cursor.fetchall()
        logger.info(f"Search completed - found {len(results)} results for query: '{query}'")
        return results
    except sqlite3.Error as e:
        logger.error(f"Database error while searching videos with query '{query}': {e}")
        raise
    finally:
        conn.close()
        logger.debug("Database connection closed")
