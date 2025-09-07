## Setup

`pip install -r requirements.txt`

`install ffmpeg`

`playwright install`

## Todo

### Index Page

- search
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
