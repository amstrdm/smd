## Setup

`pip install -r requirements.txt`

`install ffmpeg`

`playwright install`

## Todo

### Index Page

- search

## Lazy Todo

stuff that I'm aware of and should be done at some point but am too lazy to do rn

- using async for I/O bound tasks

  - Install httpx for async requests: pip install httpx.

  - Convert your functions to async def and use await for network calls.

  - Use asyncio versions of libraries where possible (e.g., playwright.async_api).

- better error handling

  - wrap in try exept and update database status when something goes wrong

- status tracking

  - tracking video_download and processing status and display in frontend alongside failed uploads

- using UUIDs for unique ids
  - see comment in upload.py
