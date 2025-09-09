# 🦔 Sonic Media Database (SMD)

<div align="center">

<img src="frontend/public/sonic.jpg" alt="Sonic Logo" width="200" height="200" />

**A retro-styled video collection management system with automatic preview generation**

[![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116.1-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

## FAQ

**Most of this Readme is pretty standard so here are some more personal statements**

### Why did you build this?

This might be one of the most useless projects for anyone but me ever. I store a bunch of videos from sites that aren't just youtube as links. Bookmarks don't give me an idea of what the videos are about after not having seen them in a while so they aren't ideal. I've been wanting to solve this for some time since it just bothered me and i wanted to be able to get a quick preview of my videos without having to click the links every single time so I did this. Will anyone but me probably ever use it? Probably not. But that's why I decided to make the design something I enjoyed and I like this retro aesthetic a lot. Plus Sonics just cool. Again: Are a bunch of Gifs on a website outdated and unappealing to most users? Yes. Do I like it? A lot.

### Your implementation of -*insert random feature*- really isn't ideal you know?

Yes. 

No seriously I'm aware most of this isn't ideal or my best work. I usually enjoy making stuff as optimal as possible and "over engineering" it but in this case I wrote most of this code at 4 AM just trying to get a working version done to see how it would look. This whole project was built in a couple of days and isn't supposed to be super efficient or anything. This is the first time I actually had some sort of fun doing Frontend Design so I put surprisingly much time into that. That being said if you scroll down to the end of this Readme you'll find a "lazy to do list". Im going to do the stuff in there eventually since I do enjoy optimization but in case there is stil stuff left on it feel free to fix it.

### What's up with the generation of the preview videos?

To this day I haven't been able to find a site that implemented the preview of videos exactly how I would like it so I took this chance to do it myself. The length of the preview video scales in a non linear way in regards to the length of the original video. Assuming each "excerpt" we combine for the preview video is one second long I came up with this formula to calculate the length of the preview video:

`N = round(BaseClips + ScalingFactor * sqrt(DurationInMinutes))*`

I'm very happy with this implementation it's great.

### What does the Sentence in the Footer mean?

Either you know or you don't. But realistically I'm the only one finding that joke funny.

### Why sonic?

Mimimimi, because he's fast and cool and blue thats why. 

![Sonic Fortnite Dancing](frontend/src/assets/fortnite-dance-sonic.gif)
## 🎮 Overview

Sonic Media Database is a modern web application that allows you to collect, organize, and browse video content from various platforms. The system automatically downloads videos, generates preview clips, and provides a beautiful retro-themed interface inspired by classic Sonic the Hedgehog games.

### ✨ Key Features

- 🎥 **Automatic Video Processing**: Upload video URLs and let the system handle downloading and processing
- 🎬 **Smart Preview Generation**: Creates dynamic preview clips based on video length using FFmpeg
- 🔍 **Advanced Search**: Full-text search across your video collection
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Retro Sonic Theme**: Beautiful pixelated UI with Sonic-inspired animations
- ⚡ **Real-time Processing**: Background task processing with Celery and Redis
- 🗄️ **SQLite Database**: Lightweight, file-based database for easy deployment
- 🌐 **Multi-platform Support**: Works with various video hosting platforms

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Background    │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   Tasks         │
│                 │    │                 │    │   (Celery)      │
│ • Video Grid    │    │ • REST API      │    │                 │
│ • Upload Form   │    │ • SQLite DB     │    │ • Video Download│
│ • Search        │    │ • File Storage  │    │ • Preview Gen   │
│ • Settings      │    │ • CORS Support  │    │ • Error Handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **FFmpeg** (for video processing)
- **Redis** (for background tasks)
- **Playwright** (for web scraping)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smd
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Install FFmpeg (if not already installed)
   # Windows: Download from https://ffmpeg.org/download.html
   # macOS: brew install ffmpeg
   # Ubuntu/Debian: sudo apt install ffmpeg
   
   # Install Playwright browsers
   playwright install
   
   # Setup database
   python setup_db.py
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   ```

4. **Start Redis Server**
   ```bash
   # Windows (if Redis is installed)
   redis-server
   
   # macOS (with Homebrew)
   brew services start redis
   
   # Ubuntu/Debian
   sudo systemctl start redis
   ```

5. **Start the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **Terminal 2 - Celery Worker:**
   ```bash
   cd backend
   celery -A utils.upload_link worker --loglevel=info
   ```
   
   **Terminal 3 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
smd/
├── backend/                    # FastAPI backend
│   ├── db/                     # SQLite database files
│   ├── routes/                 # API route handlers
│   │   ├── manage/            # Video management (delete)
│   │   ├── preview/           # Preview video serving
│   │   └── videos/            # Video listing (latest, random, search)
│   ├── utils/                 # Utility functions
│   │   ├── db_utils.py        # Database operations
│   │   └── upload_link.py     # Video processing tasks
│   ├── main.py                # FastAPI application
│   ├── setup_db.py            # Database initialization
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── VideoCard.tsx # Video display component
│   │   │   ├── VideoGrid.tsx # Video grid layout
│   │   │   └── VideoUpload.tsx # Upload form
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   └── pages/            # Page components
│   ├── public/               # Static assets
│   └── package.json          # Node.js dependencies
└── README.md                 # This file
```

## 🎯 Usage Guide

### Adding Videos

1. **Configure Server**: Click the settings icon and enter your backend URL (default: `http://localhost:8000`)
2. **Upload Video**: Click the "+" button to open the upload dialog
3. **Paste URL**: Enter any supported video URL (YouTube, Vimeo, direct video links, etc.)
4. **Wait for Processing**: The system will automatically download and process the video
5. **View Results**: Your video will appear in the collection once processing is complete

### Browsing Videos

- **Random View**: Discover videos randomly from your collection
- **Latest View**: Browse videos in chronological order with pagination
- **Search**: Use the search functionality to find specific videos by title

### Video Management

- **Delete Videos**: Click the delete button on any video card to remove it
- **View Previews**: Click on video cards to watch the generated preview clips
- **Full Video Access**: Click the external link to view the original video

## 🛠️ Configuration

### Backend Configuration

The backend can be configured through environment variables or by modifying the source code:

```python
# main.py - CORS origins
origins = [
    "http://localhost",
    "http://localhost:5173", 
    "https://yourdomain.com"  # Add your production domain
]

# utils/upload_link.py - Redis configuration
celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)
```

### Frontend Configuration

The frontend automatically detects the backend URL from localStorage. Users can configure this through the settings dialog.

### Video Processing Settings

Preview generation can be customized in `utils/upload_link.py`:

```python
def generate_preview_from_video(
    input_path: str,
    output_path: str,
    file_id: str,
    BaseClips: int = 5,        # Minimum number of clips
    ScalingFactor: float = 1.5, # Scaling factor for video length
    n_cap: int = 30,           # Maximum number of clips
):
```

## 🎨 Customization

### Adding New Themes

The application uses a Sonic-themed design system. To customize:

1. **Colors**: Modify `frontend/src/index.css` for color variables
2. **Components**: Update individual components in `frontend/src/components/`
3. **Assets**: Replace Sonic-themed images in `frontend/src/assets/`

### Supported Image Placements

For a complete visual experience, consider adding these images:

```
frontend/public/
├── sonic.png              # Main logo (already included)
├── sonic.jpg              # Alternative logo (already included)
└── favicon.ico            # Browser favicon

frontend/src/assets/
├── sonic-404.gif          # 404 error animation (already included)
├── sonic-breakdancing.gif # Success animation (already included)
├── sonic-confused.png     # No results state (already included)
├── sonic-error.gif        # Error state animation (already included)
├── fortnite-dance-sonic.gif # Additional animation (already included)
├── spinning-ring.gif      # Loading animation (already included)
└── static-ring.png        # Static loading state (already included)
```

### Recommended Image Specifications

- **Logo**: 200x200px, PNG format with transparent background
- **Animations**: 300x300px, GIF format, 2-3 second loops
- **Icons**: 64x64px, PNG format, pixelated style
- **Backgrounds**: 1920x1080px, JPG format, retro gaming aesthetic

## 🔧 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a new video URL |
| `GET` | `/api/videos/random` | Get random videos |
| `GET` | `/api/videos/latest` | Get latest videos (paginated) |
| `GET` | `/api/videos/search` | Search videos by title |
| `GET` | `/api/preview/{preview_id}` | Get preview video |
| `DELETE` | `/api/delete/{preview_id}` | Delete a video |

### Example API Usage

```bash
# Upload a video
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/video.mp4"}'

# Get random videos
curl "http://localhost:8000/api/videos/random?limit=5"

# Search videos
curl "http://localhost:8000/api/videos/search?query=sonic"
```

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   ```bash
   # Install production dependencies
   pip install gunicorn
   
   # Run with Gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   
   # Serve static files with nginx or similar
   ```

3. **Database Migration**
   ```bash
   # Run database setup on production
   python setup_db.py
   ```

### Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/0
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 🐛 Troubleshooting

### Common Issues

1. **"Could not connect to server"**
   - Check if backend is running on correct port
   - Verify CORS settings in `main.py`
   - Ensure Redis is running for background tasks

2. **"Video processing failed"**
   - Verify FFmpeg is installed and accessible
   - Check video URL accessibility
   - Review Celery worker logs

3. **"Database error"**
   - Ensure SQLite database file is writable
   - Run `python setup_db.py` to recreate database
   - Check file permissions

4. **"Playwright timeout"**
   - Install Playwright browsers: `playwright install`
   - Check internet connectivity
   - Verify target website accessibility

### Debug Mode

Enable debug logging:

```python
# backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Todo

### Index Page

- let user enter backend url and password into frontend
- configure backend so that you can configure it to actually have multiple databases. Essentially multiple content paths with databases and preview videos that are then exposed through different routes. That way a user can hit that specific route and will be able to interact with that specific database.
- add ability to edit an entry

## Lazy Todo

stuff that I'm aware of and should be done at some point but am too lazy to do rn

- using async for I/O bound tasks

  - Install httpx for async requests: pip install httpx.

  - Convert functions to async def and use await for network calls.

  - Use asyncio versions of libraries where possible (e.g., playwright.async_api).

- better error handling

  - wrap in try exept and update database status when something goes wrong

- status tracking

  - tracking video_download and processing status and display in frontend alongside failed uploads

- use triggers for keeping `videos_fts` and `videos` table in sync

  - currently we manually insert the values which is not a robust approach we should let the DB do this

---

<div align="center">

*Gotta go fast!* 🏃‍♂️💨

</div>
