# TV Show Download Implementation

## Overview
This document outlines the implementation of TV show download functionality in NiluFlix, highlighting the key differences from movie downloads.

## Key Differences: TV Shows vs Movies

### 1. Database Schema

#### Movies
```sql
-- Single table
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title TEXT,
  download_status TEXT DEFAULT 'not_downloaded',
  file_path TEXT,
  -- ... other fields
);
```

#### TV Shows
```sql
-- Two related tables
CREATE TABLE tv_shows (
  id INTEGER PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  name TEXT,
  number_of_seasons INTEGER,
  number_of_episodes INTEGER,
  -- ... other fields
);

CREATE TABLE episodes (
  id INTEGER PRIMARY KEY,
  tv_show_id INTEGER REFERENCES tv_shows(id),
  season_number INTEGER,
  episode_number INTEGER,
  download_status TEXT DEFAULT 'not_downloaded',
  file_path TEXT,
  -- ... other fields
);
```

### 2. Download Content Structure

#### Movies
```typescript
DownloadContent = {
  id: number,
  tmdbId: number,
  title: string,
  type: 'movie',
  year?: number,
  // ... other fields
}
```

#### TV Shows
```typescript
DownloadContent = {
  id: number,
  tmdbId: number,
  title: string,
  type: 'episode',
  seasonNumber: number,
  episodeNumber: number,
  tvShowName: string,
  // ... other fields
}
```

### 3. API Endpoints

#### Movies
- `POST /api/movies/:id/download` - Download entire movie
- `GET /api/movies/downloaded` - Get downloaded movies

#### TV Shows
- `POST /api/tv/:id/download` - Download entire TV show (all seasons)
- `POST /api/tv/:id/download?seasons=[1,2]` - Download specific seasons
- `POST /api/episodes/:id/download` - Download specific episode (format: tvId_seasonNumber_episodeNumber)
- `GET /api/tv/downloaded` - Get downloaded TV shows

### 4. File Organization

#### Movies
```
~/Movies/NiluFlix/Movies/
├── Movie Name (Year)/
│   ├── Movie Name (Year).mkv
│   ├── subtitles/
│   └── metadata.json
```

#### TV Shows
```
~/Movies/NiluFlix/TV Shows/
├── Show Name/
│   ├── Season 01/
│   │   ├── Show Name S01E01 Episode Title.mkv
│   │   ├── Show Name S01E02 Episode Title.mkv
│   │   └── subtitles/
│   ├── Season 02/
│   │   └── ...
│   └── metadata.json
```

### 5. Download Status Tracking

#### Movies
- Single status per movie: `not_downloaded`, `downloading`, `downloaded`, `failed`
- Progress tracked at movie level

#### TV Shows
- Status per episode: `not_downloaded`, `downloading`, `downloaded`, `failed`
- Aggregated show status: `not_downloaded`, `partially_downloaded`, `downloaded`
- Progress tracked at episode level, aggregated for show

### 6. Download Process

#### Movies
1. User clicks download on movie
2. Single download job created
3. Torrent search for movie
4. Download single file
5. Organize to Movies folder
6. Update movie status to downloaded

#### TV Shows
1. User clicks download on TV show
2. Multiple download jobs created (one per episode)
3. Torrent search for each episode
4. Download multiple files in parallel
5. Organize to TV Shows/Show Name/Season XX/ folders
6. Update episode statuses to downloaded

## Implementation Details

### Database Integration
- TV shows are stored in `tv_shows` table
- Episodes are stored in `episodes` table with foreign key to `tv_shows`
- Download status tracked per episode
- Library sync handles both movies and TV shows

### Download Manager Integration
- `DownloadContent.type` can be `'movie'` or `'episode'`
- Episode downloads include `seasonNumber`, `episodeNumber`, `tvShowName`
- Multiple jobs can run in parallel for different episodes

### File Organizer Integration
- TV shows organized into `TV Shows/Show Name/Season XX/` structure
- Episode files named: `Show Name S01E01 Episode Title.mkv`
- Metadata files created for each show

### API Response Structure

#### TV Show Download Response
```json
{
  "success": true,
  "message": "TV show download queued: 'Breaking Bad' (62 episodes)",
  "data": {
    "tvShowId": 1396,
    "tvShow": {
      "id": 1396,
      "name": "Breaking Bad",
      "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"
    },
    "seasons": [1, 2, 3, 4, 5],
    "totalEpisodes": 62,
    "downloadJobs": [
      {
        "jobId": "job_1234567890_abc123",
        "season": 1,
        "episode": 1,
        "title": "Pilot",
        "status": "queued"
      }
    ],
    "steps": [
      {
        "id": "tv_show_details",
        "title": "Getting TV show details",
        "status": "completed"
      },
      {
        "id": "torrent_search",
        "title": "Searching for torrents",
        "status": "active"
      }
    ],
    "currentStep": "torrent_search",
    "progress": 0
  }
}
```

#### Episode Download Response
```json
{
  "success": true,
  "message": "Episode download queued: 'Breaking Bad' S01E01",
  "data": {
    "jobId": "job_1234567890_abc123",
    "episode": {
      "id": "1396_1_1",
      "tvShowId": 1396,
      "season": 1,
      "episode": 1,
      "title": "Pilot"
    },
    "tvShow": {
      "id": 1396,
      "name": "Breaking Bad"
    },
    "steps": [
      {
        "id": "episode_details",
        "title": "Getting episode details",
        "status": "completed"
      },
      {
        "id": "torrent_search",
        "title": "Searching for torrents",
        "status": "active"
      }
    ],
    "currentStep": "torrent_search",
    "progress": 0
  }
}
```

## Testing

Run the test script to verify implementation:
```bash
node test-tv-download.js
```

This will test:
1. Popular TV shows endpoint
2. TV show search
3. TV show details
4. Season details
5. TV show download (entire series)
6. Episode download (specific episode)
7. Downloaded TV shows endpoint

## Next Steps

1. **Database Integration**: Implement TV show and episode record creation in database
2. **Frontend Integration**: Update frontend to handle TV show downloads
3. **Download Status Modal**: Extend modal to show TV show download progress
4. **Library Sync**: Ensure TV shows are properly synced from file system
5. **File Organization**: Test file organization for TV shows
6. **Error Handling**: Add comprehensive error handling for TV show downloads

## Files Modified

- `src/server/routes/tv.ts` - Updated TV show download endpoints
- `src/server/services/librarySyncService.ts` - Added TV show support
- `test-tv-download.js` - Test script for TV show functionality
- `TV_SHOW_IMPLEMENTATION.md` - This documentation

## Database Schema Updates

The existing Prisma schema already includes the necessary tables:
- `TVShow` model for TV show metadata
- `Episode` model for episode metadata with foreign key to TVShow
- Proper relationships and constraints

No database migrations are needed as the schema is already in place.
