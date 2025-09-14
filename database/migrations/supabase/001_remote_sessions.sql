-- Migration: Create remote_sessions table for web interface
-- Description: Tracks desktop app sessions for remote access
-- Created: 2024-01-01

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create remote_sessions table
CREATE TABLE IF NOT EXISTS remote_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  desktop_app_id TEXT UNIQUE NOT NULL,
  app_version TEXT,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  ip_address INET,
  port INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_remote_sessions_desktop_app_id ON remote_sessions(desktop_app_id);
CREATE INDEX IF NOT EXISTS idx_remote_sessions_is_online ON remote_sessions(is_online);
CREATE INDEX IF NOT EXISTS idx_remote_sessions_last_sync ON remote_sessions(last_sync);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_remote_sessions_updated_at 
  BEFORE UPDATE ON remote_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE remote_sessions IS 'Tracks desktop app sessions for remote web access';
COMMENT ON COLUMN remote_sessions.desktop_app_id IS 'Unique identifier for the desktop app instance';
COMMENT ON COLUMN remote_sessions.app_version IS 'Version of the desktop app';
COMMENT ON COLUMN remote_sessions.is_online IS 'Whether the desktop app is currently online';
COMMENT ON COLUMN remote_sessions.ip_address IS 'IP address of the desktop app';
COMMENT ON COLUMN remote_sessions.port IS 'Port number of the desktop app API server';
