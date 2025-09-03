from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import latest, preview, random, upload

app = FastAPI()

origins = ["http://localhost", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(preview.router, prefix="/api")

# Routes that return video elements
app.include_router(random.router, prefix="/api/videos")
app.include_router(latest.router, prefix="/api/videos")
