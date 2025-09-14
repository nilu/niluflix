# NiluFlix Backend API Server

## Overview

This is the Express.js API server for NiluFlix, built with TypeScript. It provides RESTful endpoints for movie and TV show management, download control, library access, and remote functionality.

## Architecture

### Core Components

- **Express Server** (`index.ts`) - Main application entry point with middleware setup
- **Middleware** - Request logging, error handling, and validation
- **Routes** - Organized API endpoints by feature
- **TypeScript Configuration** - Optimized for Node.js development

### Directory Structure

```
src/server/
├── index.ts                 # Main server entry point
├── middleware/
│   ├── logger.ts           # Request logging and utility functions
│   ├── errorHandler.ts     # Error handling and custom error types
│   └── validation.ts       # Request validation middleware
├── routes/
│   ├── health.ts           # Health check and system status
│   ├── movies.ts           # Movie-related endpoints
│   ├── tv.ts              # TV show and episode endpoints
│   ├── downloads.ts        # Download management
│   ├── library.ts          # Personal library management
│   └── remote.ts           # Remote access configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system information

### Movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/search/:query` - Search movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies/:id/download` - Start movie download
- `GET /api/movies/downloaded` - Get downloaded movies
- `GET /api/movies/:id/status` - Get download status
- `DELETE /api/movies/:id/download` - Cancel download

### TV Shows
- `GET /api/tv/popular` - Get popular TV shows
- `GET /api/tv/trending` - Get trending TV shows
- `GET /api/tv/search/:query` - Search TV shows
- `GET /api/tv/:id` - Get TV show details
- `GET /api/tv/:id/season/:seasonNumber` - Get season details
- `POST /api/tv/:id/download` - Start TV show download
- `POST /api/episodes/:id/download` - Download specific episode
- `GET /api/tv/:id/episodes` - Get all episodes
- `GET /api/tv/:id/status` - Get download status
- `GET /api/tv/downloaded` - Get downloaded TV shows

### Downloads
- `GET /api/downloads` - Get all downloads
- `GET /api/downloads/active` - Get active downloads
- `GET /api/downloads/history` - Get download history
- `GET /api/downloads/progress` - Get real-time progress
- `GET /api/downloads/:id` - Get specific download
- `GET /api/downloads/:id/progress` - Get download progress
- `PUT /api/downloads/:id/pause` - Pause download
- `PUT /api/downloads/:id/resume` - Resume download
- `DELETE /api/downloads/:id` - Cancel/remove download
- `POST /api/downloads/:id/retry` - Retry failed download
- `GET /api/downloads/stats` - Get statistics
- `POST /api/downloads/clear-completed` - Clear completed downloads

### Library
- `GET /api/library/movies` - Get movie library
- `GET /api/library/tv-shows` - Get TV show library
- `GET /api/library/recent` - Get recently added content
- `GET /api/library/stats` - Get library statistics
- `POST /api/library/sync` - Sync with file system
- `GET /api/library/sync-status` - Get sync status
- `GET /api/library/search` - Search library
- `GET /api/library/genres` - Get available genres
- `POST /api/library/cleanup` - Clean up library
- `GET /api/library/export` - Export library data

### Remote Access
- `GET /api/remote/status` - Check remote access status
- `POST /api/remote/enable` - Enable remote access
- `POST /api/remote/disable` - Disable remote access
- `GET /api/remote/link` - Get shareable web link
- `GET /api/remote/connections` - Get active connections
- `POST /api/remote/revoke-token` - Revoke access token
- `GET /api/remote/config` - Get configuration
- `PUT /api/remote/config` - Update configuration
- `GET /api/remote/logs` - Get activity logs
- `POST /api/remote/test-connection` - Test connection setup

## Features

### Security & CORS
- Helmet.js for security headers
- CORS configured for Electron app integration
- Request size limits (10MB)
- Content type validation

### Logging
- Request/response logging with timing
- Different log levels based on response status
- Structured log format with timestamps
- Utility functions for info, error, warning logs

### Error Handling
- Custom error classes with status codes
- Graceful error responses
- Development vs production error details
- Async error handling wrapper
- 404 and validation error handlers

### Validation
- Request field validation with custom rules
- Type checking (string, number, boolean, array, object)
- Length and range validation
- Pattern matching with regex
- Common validation rules for TMDB IDs, search queries, etc.

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Error description",
  "timestamp": "2025-09-14T17:50:27.134Z"
}
```

## Development

### Running the Server
```bash
# Development with auto-reload
npm run server:dev

# Direct TypeScript execution
npx ts-node --project src/server/tsconfig.json src/server/index.ts

# Build to JavaScript
npm run build:server
```

### Environment Variables
- `DESKTOP_APP_PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `TMDB_API_KEY` - TMDB API key for movie data
- `DATABASE_PATH` - SQLite database path

### Configuration
- TypeScript with ES2020 target
- CommonJS modules for Node.js compatibility
- ESModule interop for modern imports
- Strict mode disabled for rapid development

## Current Status

### ✅ Completed (Step 3 of TODO.md)
- [x] Express server with TypeScript
- [x] CORS configuration for Electron
- [x] Error handling middleware
- [x] Request logging and validation
- [x] All core API route structures
- [x] Health check endpoint
- [x] Consistent response format
- [x] Development environment setup

### 🔄 Next Steps (Step 4)
- [ ] TMDB API integration
- [ ] Torrent search integration
- [ ] Database model integration
- [ ] Actual endpoint implementations

## Testing

The server has been tested with:
- Health check endpoint returns proper JSON response
- Movies endpoint returns placeholder data
- TypeScript compilation works correctly
- Server starts and stops gracefully
- Request logging functions properly

## Notes

All endpoints currently return placeholder responses with "coming soon" messages. The actual implementations will be added in subsequent steps as external API integrations and database connections are established.

The server is designed to be the foundation for the complete NiluFlix application, with all necessary middleware and route structures in place for future feature development.
