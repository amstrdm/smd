import os
import sqlite3

# Define the path to the db folder
db_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db")
os.makedirs(db_folder, exist_ok=True)
DATABASE_PATH = os.path.join(db_folder, "videos.db")


def setup_database():
    """
    Creates the SQLite database and the 'videos' table if they don't exist.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # SQL statement to create a table
        # We add UNIQUE constraints to prevent duplicates at the database level
        # and an error_message column for better debugging.
        create_table_query = """
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL,
            title TEXT,
            poster_url TEXT,
            preview_path TEXT,
            preview_id TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT
        );
        """
        cursor.execute(create_table_query)
        conn.commit()
        print("Database and 'videos' table created successfully.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    setup_database()
