---
source: Official docs / webfetch
library: Consumet
package: consumet-api
topic: streaming-apis
fetched: 2026-07-10T11:00:00Z
official_docs: https://docs.consumet.org/
---

# Free/Public Anime Streaming APIs

Consumet provides several scrapers/providers returning direct streaming links (HLS/M3U8, mp4) or embed servers.

## 1. Consumet API (Instance: `https://api.consumet.org`)

### Provider: Animepahe
- **Endpoint**: `GET /anime/animepahe/watch?episodeId={episodeId}`
- **Query Params**:
  - `episodeId` (string, required): The ID of the episode.
- **Response**:
  ```json
  {
    "headers": {
      "Referer": "string",
      "User-Agent": "string"
    },
    "sources": [
      {
        "url": "string", // HLS/M3U8 or mp4 link
        "quality": "string",
        "isM3U8": true
      }
    ]
  }
  ```

### Provider: HiAnime (Zoro)
- **Endpoint**: `GET /anime/hianime/watch/{episodeId}`
- **Path Params**:
  - `episodeId` (string, required): e.g. `one-piece-100?ep=1234`
- **Query Params**:
  - `server` (string, optional): e.g. `vidstreaming`, `vidcloud`
  - `category` (string, optional): `sub` or `dub`
- **Response**:
  ```json
  {
    "headers": {
      "Referer": "string",
      "User-Agent": "string"
    },
    "sources": [
      {
        "url": "string", // Direct HLS/M3U8 link
        "quality": "string",
        "isM3U8": true
      }
    ],
    "download": "string"
  }
  ```

### Provider: Anilist Co-ordinated (Meta)
- **Endpoint**: `GET /meta/anilist/watch/{episodeId}`
- **Path Params**:
  - `episodeId` (string, required): e.g. `spy-x-family-episode-1`
- **Response**: Returns same format containing source URLs and fallback servers.
