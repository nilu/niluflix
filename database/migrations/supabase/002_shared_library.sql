-- Migration: Create shared_library table for web interface
-- Description: Stores library metadata for remote sharing (no actual files)
-- Created: 2024-01-01

-- Create shared_library table
CREATE TABLE IF NOT EXISTS shared_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  desktop_app_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'tv_show')),
  title TEXT NOT NULL,
  poster_path TEXT,
  download_status TEXT DEFAULT 'not_downloaded' CHECK (download_status IN ('not_downloaded', 'downloading', 'downloaded', 'failed')),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_shared_library_desktop_app_id 
    FOREIGN KEY (desktop_app_id) 
    REFERENCES remote_sessions(desktop_app_id) 
    ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_library_desktop_app_id ON shared_library(desktop_app_id);
CREATE INDEX IF NOT EXISTS idx_shared_library_tmdb_id ON shared_library(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_shared_library_content_type ON shared_library(content_type);
CREATE INDEX IF NOT EXISTS idx_shared_library_download_status ON shared_library(download_status);
CREATE INDEX IF NOT EXISTS idx_shared_library_created_at ON shared_library(created_at);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_library_unique_content 
  ON shared_library(desktop_app_id, tmdb_id, content_type);

-- Create updated_at trigger
CREATE TRIGGER update_shared_library_updated_at 
  BEFORE UPDATE ON shared_library 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE shared_library IS 'Shared library metadata for remote access (no actual files stored)';
COMMENT ON COLUMN shared_library.desktop_app_id IS 'Reference to the desktop app that owns this content';
COMMENT ON COLUMN shared_library.tmdb_id IS 'TMDB ID for the content';
COMMENT ON COLUMN shared_library.content_type IS 'Type of content: movie or tv_show';
COMMENT ON COLUMN shared_library.title IS 'Title of the content';
COMMENT ON COLUMN shared_library.poster_path IS 'Path to the poster image';
COMMENT ON COLUMN shared_library.download_status IS 'Current download status';
COMMENT ON COLUMN shared_library.file_size IS 'Size of the downloaded file in bytes';
