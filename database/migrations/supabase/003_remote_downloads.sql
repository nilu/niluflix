-- Migration: Create remote_downloads table for web interface
-- Description: Handles remote download commands from web interface
-- Created: 2024-01-01

-- Create remote_downloads table
CREATE TABLE IF NOT EXISTS remote_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  desktop_app_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'tv_show', 'episode')),
  command_type TEXT NOT NULL CHECK (command_type IN ('download', 'cancel', 'pause', 'resume')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Foreign key constraint
  CONSTRAINT fk_remote_downloads_desktop_app_id 
    FOREIGN KEY (desktop_app_id) 
    REFERENCES remote_sessions(desktop_app_id) 
    ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_remote_downloads_desktop_app_id ON remote_downloads(desktop_app_id);
CREATE INDEX IF NOT EXISTS idx_remote_downloads_status ON remote_downloads(status);
CREATE INDEX IF NOT EXISTS idx_remote_downloads_created_at ON remote_downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_remote_downloads_priority ON remote_downloads(priority DESC);

-- Create index for processing queue
CREATE INDEX IF NOT EXISTS idx_remote_downloads_processing_queue 
  ON remote_downloads(desktop_app_id, status, priority DESC, created_at) 
  WHERE status IN ('pending', 'processing');

-- Add comments
COMMENT ON TABLE remote_downloads IS 'Remote download commands from web interface to desktop app';
COMMENT ON COLUMN remote_downloads.desktop_app_id IS 'Reference to the desktop app that should process this command';
COMMENT ON COLUMN remote_downloads.tmdb_id IS 'TMDB ID of the content to download';
COMMENT ON COLUMN remote_downloads.content_type IS 'Type of content: movie, tv_show, or episode';
COMMENT ON COLUMN remote_downloads.command_type IS 'Type of command: download, cancel, pause, or resume';
COMMENT ON COLUMN remote_downloads.status IS 'Current status of the command';
COMMENT ON COLUMN remote_downloads.priority IS 'Priority level (higher number = higher priority)';
COMMENT ON COLUMN remote_downloads.error_message IS 'Error message if command failed';
