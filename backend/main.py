from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import latest, manage, preview, random, search, upload

app = FastAPI()

origins = ["http://localhost", "http://localhost:5173", "https://sonicmd.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(manage.router, prefix="/api")

# Routes that return video elements
app.include_router(preview.router, prefix="/api")

app.include_router(random.router, prefix="/api/videos")
app.include_router(latest.router, prefix="/api/videos")
app.include_router(search.router, prefix="/api/videos")
