from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from routes import latest, preview, random, upload

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

app.include_router(upload.router, prefix="/api")
app.include_router(preview.router, prefix="/api")

# Routes that return video elements
app.include_router(random.router, prefix="/api/videos")
app.include_router(latest.router, prefix="/api/videos")
