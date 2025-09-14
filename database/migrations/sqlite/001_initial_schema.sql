-- Migration: Initial SQLite schema for desktop app
-- Description: Creates all core tables for the desktop application
-- Created: 2024-01-01

-- =============================================================================
-- CORE CONTENT TABLES
-- =============================================================================

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date TEXT,
  runtime INTEGER,
  vote_average REAL,
  genres TEXT, -- JSON array
  download_status TEXT DEFAULT 'not_downloaded' CHECK (download_status IN ('not_downloaded', 'downloading', 'downloaded', 'failed')),
  file_path TEXT,
  file_size INTEGER,
  download_progress REAL DEFAULT 0,
  magnet_link TEXT,
  torrent_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TV Shows table
CREATE TABLE IF NOT EXISTS tv_shows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  first_air_date TEXT,
  last_air_date TEXT,
  number_of_seasons INTEGER,
  number_of_episodes INTEGER,
  vote_average REAL,
  genres TEXT, -- JSON array
  status TEXT, -- 'Ended', 'Returning Series', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tv_show_id INTEGER NOT NULL,
  tmdb_episode_id INTEGER,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  air_date TEXT,
  runtime INTEGER,
  vote_average REAL,
  download_status TEXT DEFAULT 'not_downloaded' CHECK (download_status IN ('not_downloaded', 'downloading', 'downloaded', 'failed')),
  file_path TEXT,
  file_size INTEGER,
  download_progress REAL DEFAULT 0,
  magnet_link TEXT,
  torrent_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tv_show_id) REFERENCES tv_shows(id) ON DELETE CASCADE
);

-- =============================================================================
-- DOWNLOAD MANAGEMENT TABLES
-- =============================================================================

-- Download queue table
CREATE TABLE IF NOT EXISTS download_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
  content_id INTEGER NOT NULL,
  torrent_magnet TEXT NOT NULL,
  torrent_name TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'downloading', 'completed', 'failed', 'paused')),
  progress REAL DEFAULT 0,
  download_speed INTEGER DEFAULT 0,
  eta INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);

-- Download history table
CREATE TABLE IF NOT EXISTS download_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
  content_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  file_size INTEGER,
  download_time INTEGER, -- in seconds
  quality TEXT,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- =============================================================================
-- SETTINGS & CONFIGURATION
-- =============================================================================

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Movies indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_download_status ON movies(download_status);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);

-- TV Shows indexes
CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id ON tv_shows(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_name ON tv_shows(name);
CREATE INDEX IF NOT EXISTS idx_tv_shows_first_air_date ON tv_shows(first_air_date);

-- Episodes indexes
CREATE INDEX IF NOT EXISTS idx_episodes_tv_show_id ON episodes(tv_show_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_episode ON episodes(season_number, episode_number);
CREATE INDEX IF NOT EXISTS idx_episodes_download_status ON episodes(download_status);

-- Download queue indexes
CREATE INDEX IF NOT EXISTS idx_download_queue_status ON download_queue(status);
CREATE INDEX IF NOT EXISTS idx_download_queue_priority ON download_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_download_queue_created_at ON download_queue(created_at);

-- Download history indexes
CREATE INDEX IF NOT EXISTS idx_download_history_content_type ON download_history(content_type);
CREATE INDEX IF NOT EXISTS idx_download_history_status ON download_history(status);
CREATE INDEX IF NOT EXISTS idx_download_history_created_at ON download_history(created_at);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Trigger for movies updated_at
CREATE TRIGGER IF NOT EXISTS update_movies_updated_at 
  AFTER UPDATE ON movies
  FOR EACH ROW
  BEGIN
    UPDATE movies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger for tv_shows updated_at
CREATE TRIGGER IF NOT EXISTS update_tv_shows_updated_at 
  AFTER UPDATE ON tv_shows
  FOR EACH ROW
  BEGIN
    UPDATE tv_shows SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger for episodes updated_at
CREATE TRIGGER IF NOT EXISTS update_episodes_updated_at 
  AFTER UPDATE ON episodes
  FOR EACH ROW
  BEGIN
    UPDATE episodes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger for settings updated_at
CREATE TRIGGER IF NOT EXISTS update_settings_updated_at 
  AFTER UPDATE ON settings
  FOR EACH ROW
  BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
  END;
