# NiluFlix 🎬

A beautiful streaming platform interface that secretly powers your personal media collection through torrenting. **One-click desktop app** + **optional web interface** for remote control. Download, install, and use like Netflix - no technical knowledge required!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![App](https://img.shields.io/badge/app-Electron-brightgreen.svg)
![Download](https://img.shields.io/badge/download-NiluFlix.dmg-blue.svg)

## 📥 **Quick Install (Grandma-Friendly)**

1. **Download**: [NiluFlix.dmg](https://github.com/yourusername/niluflix/releases/latest)
2. **Install**: Double-click and drag to Applications
3. **Run**: Double-click NiluFlix app
4. **Done**: Netflix interface opens automatically!

**That's it!** No terminal, no configuration, no technical setup needed.

---

## 🌐 **Optional: Remote Web Access**

Want to control your downloads from anywhere? **One-click remote access:**

1. **Click "Enable Remote Access"** in the desktop app
2. **Get your web link** (app generates it automatically)
3. **Access from anywhere**: `niluflix.vercel.app` → connects to your Mac
4. **Control remotely**: View library, start downloads, check progress

**Use cases:** Queue downloads from work, check progress from phone, share library with friends!

## 🚀 Features

### 🎭 Streaming Platform Interface
- **Netflix-style UI**: Browse latest and most popular movies & TV shows
- **Rich Media Display**: High-quality posters, trailers, descriptions, ratings
- **Smart Download Status**: Visual indicators for downloaded content
- **Episode Management**: Track individual episodes and seasons
- **Personal Library**: "My Shows" sidebar for downloaded content

### 📺 Content Management
- **Movies**: Download status tags, one-click download
- **TV Shows**: 
  - Season/episode level download tracking
  - Bulk season downloads
  - Individual episode selection
  - Progress indicators per episode

### 🔍 Discovery & Organization
- **Home Feed**: Latest releases and trending content
- **Search**: Find any movie or show instantly
- **Categories**: Browse by genre, year, rating
- **Personal Library**: Quick access to downloaded content

### 🌐 Remote Access (Optional)
- **Web Interface**: Control from any device with a browser
- **Remote Downloads**: Queue downloads from work/phone
- **Progress Monitoring**: Check download status anywhere
- **Library Sharing**: Share your collection with friends
- **One-Click Setup**: App handles all technical configuration

## 🛠 Technology Stack

### Desktop Application (Self-Contained)
- **Electron** (M1 Mac optimized) - One-click .dmg installer
- **electron-builder** for packaging and distribution
- **Zero-configuration** - works immediately after install
- **Auto-setup** - creates folders, configures everything automatically

### Frontend (Bundled in App)
- **React 18** with TypeScript
- **Tailwind CSS** for Netflix-style UI
- **Framer Motion** for smooth animations
- **React Query** for data fetching

### Backend (Bundled in App)
- **Node.js** with Express (auto-starts with app)
- **SQLite** for local database
- **Prisma** ORM for database management

### Torrenting (Auto-Configured)
- **Transmission** or **qBittorrent** (auto-detected and installed)
- **torrent-search-api** for finding torrents
- **Smart quality selection** (1080p → 720p → 4K)
- **Auto-seeders detection** (picks torrents with most seeders)

### External APIs
- **TMDB API** (The Movie Database) - Free tier: 1000 requests/day
- **OpenSubtitles API** for subtitle support

### Web Interface (Optional)
- **Vercel** for free frontend hosting
- **Dynamic DNS** (auto-configured) for home network access
- **Same React frontend** deployed as web app
- **Connects to desktop app API** running on your Mac

## 🏗 Architecture (Hybrid: Desktop + Optional Web)

### **Core: Desktop App (Self-Contained)**
```
┌─────────────────────────────────────────────────────────────┐
│                    NiluFlix.app                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │   Electron UI   │◄──►│  Express API    │◄──►│ SQLite   │ │
│  │   (React App)   │    │ (Auto-starts)   │    │    DB    │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│           │                       │                    │    │
│           │                       │                    │    │
│           ▼                       ▼                    ▼    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │   Torrent       │    │   TMDB API      │    │   File   │ │
│  │   Client        │    │   Integration   │    │  System  │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ~/Movies/NiluFlix/
                    (Auto-created folder)
```

### **Optional: Remote Web Access**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Your Mac      │    │  Local Files    │
│   (Web UI)      │◄──►│  NiluFlix.app   │◄──►│  & Torrents     │
│                 │    │   API Server    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   Access from           Desktop interface        Downloads to
   anywhere!             for local control       ~/Movies/NiluFlix/
```

**Desktop app works standalone - web interface is optional remote control!**

## 📊 Database Schema

```sql
-- Movies table
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date TEXT,
  runtime INTEGER,
  vote_average REAL,
  genres TEXT, -- JSON array
  download_status TEXT DEFAULT 'not_downloaded', -- 'not_downloaded', 'downloading', 'downloaded'
  file_path TEXT,
  file_size INTEGER,
  download_progress REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TV Shows table
CREATE TABLE tv_shows (
  id INTEGER PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
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
CREATE TABLE episodes (
  id INTEGER PRIMARY KEY,
  tv_show_id INTEGER,
  tmdb_episode_id INTEGER,
  season_number INTEGER,
  episode_number INTEGER,
  name TEXT,
  overview TEXT,
  air_date TEXT,
  runtime INTEGER,
  vote_average REAL,
  download_status TEXT DEFAULT 'not_downloaded',
  file_path TEXT,
  file_size INTEGER,
  download_progress REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tv_show_id) REFERENCES tv_shows(id)
);

-- Download queue table
CREATE TABLE download_queue (
  id INTEGER PRIMARY KEY,
  content_type TEXT, -- 'movie' or 'episode'
  content_id INTEGER,
  torrent_magnet TEXT,
  torrent_name TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued', -- 'queued', 'downloading', 'completed', 'failed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 Local File Structure

```
~/Movies/NiluFlix/
├── Movies/
│   ├── The Dark Knight (2008)/
│   │   ├── The Dark Knight (2008) [1080p].mkv
│   │   ├── metadata.json
│   │   └── subtitles/
│   └── Inception (2010)/
│       ├── Inception (2010) [4K].mkv
│       └── metadata.json
└── TV Shows/
    ├── Breaking Bad/
    │   ├── Season 01/
    │   │   ├── Breaking Bad S01E01.mkv
    │   │   ├── Breaking Bad S01E02.mkv
    │   │   └── ...
    │   ├── Season 02/
    │   └── metadata.json
    └── Game of Thrones/
        ├── Season 01/
        └── metadata.json
```

## 🚀 Installation Options

### Option 1: **End Users (Recommended)** - Zero Configuration

**For Grandma and Everyone Else:**

1. **Download**: [NiluFlix.dmg](https://github.com/yourusername/niluflix/releases/latest) 
2. **Install**: Double-click `.dmg` → drag to Applications folder
3. **Run**: Double-click NiluFlix app in Applications
4. **Enjoy**: Netflix interface opens automatically!

**What happens automatically:**
- ✅ Creates `~/Movies/NiluFlix/` folder
- ✅ Detects/installs torrent client (Transmission)
- ✅ Configures all settings with smart defaults
- ✅ Starts backend server
- ✅ Opens beautiful web interface

**No terminal, no configuration, no technical knowledge needed!**

---

### Option 2: **Remote Web Access** (Optional)

Want to control your downloads from anywhere? **Deploy the web interface:**

#### Quick Setup
```bash
# 1. Enable remote access in desktop app
Click "Enable Remote Access" → App configures everything

# 2. Deploy web interface (optional)
git clone https://github.com/yourusername/niluflix-web.git
cd niluflix-web
vercel --prod

# 3. Access remotely
# Desktop: localhost:3000 (local)
# Web: niluflix.vercel.app → connects to your Mac
```

#### What You Get
- **Same beautiful interface** as desktop app
- **Remote control**: Start downloads from anywhere
- **Progress monitoring**: Check status from phone
- **Library access**: Browse your collection remotely

---

### Option 3: **Developers** - Build from Source

**Prerequisites:** Node.js 16+, npm, Git

#### Quick Development Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/niluflix.git
cd niluflix
npm run setup  # Installs dependencies for all components

# Start development
npm run dev    # Starts both backend and Electron app
```

#### Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/yourusername/niluflix.git
cd niluflix

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env
# Edit .env with your TMDB API key

# 4. Database setup
npm run db:setup

# 5. Start development
npm run dev
```

#### Build Desktop App
```bash
# Build for macOS (M1 optimized)
npm run build:mac

# Build for all platforms
npm run build:all

# Creates NiluFlix.dmg in dist/ folder
```

## 🎯 Usage (Simple as Netflix!)

### First Launch (Automatic Setup)
1. **Double-click** NiluFlix app
2. **Wait 10 seconds** (first-time auto-configuration)
3. **Netflix interface opens** - you're ready to go!
4. **Start browsing** movies and shows immediately

*Everything is configured automatically - no settings needed!*

### Daily Usage

#### **At Home (Desktop App):**
1. **Open NiluFlix** (double-click or from dock)
2. **Browse content** like Netflix/Prime Video
3. **Click "Download"** on any movie/show
4. **Watch download progress** in real-time
5. **Stream content** when ready

#### **Away from Home (Web Interface):**
1. **Go to** `niluflix.vercel.app` on any device
2. **Browse your library** remotely
3. **Queue downloads** for when you get home
4. **Check progress** of active downloads
5. **Share library** with friends (optional)

### Download Management
- **Movies**: One-click download → finds best torrent → downloads automatically
- **TV Shows**: 
  - **Download Season**: Get entire season with one click
  - **Individual Episodes**: Select specific episodes
  - **Progress Tracking**: See download status per episode
  - **Auto-organize**: Files sorted into proper folders

### Smart Features (All Automatic)
- **Quality Selection**: Prioritizes 1080p → 720p → 4K based on availability
- **Seeder Optimization**: Always picks torrents with most seeders
- **File Organization**: Creates proper folder structure automatically
- **Subtitle Support**: Downloads subtitles when available

## 🔧 Configuration (Optional)

*Everything works with smart defaults, but you can customize if needed.*

### GUI Settings Panel (In-App)
- **Download Quality**: 720p, 1080p, 4K preferences
- **Download Location**: Choose your storage directory (default: `~/Movies/NiluFlix/`)
- **Concurrent Downloads**: Limit simultaneous downloads (default: 3)
- **Bandwidth Limits**: Set upload/download limits (default: unlimited)
- **Auto-download**: New episodes of followed shows
- **Remote Access**: One-click enable for phone/other devices
- **Web Interface**: Deploy/manage remote web access
- **Sharing**: Control who can access your library remotely

### Default Smart Settings
```javascript
// These work great out of the box:
{
  downloadPath: "~/Movies/NiluFlix/",
  maxDownloads: 3,
  preferredQuality: "1080p",
  fallbackQualities: ["720p", "4K"],
  minSeeders: 5,
  autoSubtitles: true,
  autoOrganize: true
}
```

### Advanced Configuration (Developers Only)
*For developers who want to customize beyond the GUI:*
```javascript
// config/app.config.js
module.exports = {
  torrent: {
    maxConnections: 200,
    maxDownloads: 3,
    uploadLimit: 1024, // KB/s
    downloadLimit: 0, // Unlimited
  },
  quality: {
    preferred: ['1080p', '720p', '4K'],
    minSeeders: 5,
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
  tmdb: {
    language: 'en-US',
    region: 'US',
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  }
};
```

## 🛡 Privacy & Security

### Built-in Protection
- **No logging**: Zero user activity logs
- **Local-only**: All data stored locally on your machine
- **VPN recommended**: Use with VPN for additional privacy
- **Encrypted storage**: Sensitive data encrypted at rest

### Recommended Setup
1. **VPN**: Use a no-logs VPN service
2. **DNS**: Configure secure DNS (1.1.1.1 or 8.8.8.8)
3. **Firewall**: Enable macOS firewall
4. **Updates**: Keep the app updated for security patches

## 🤝 Contributing

### Development Setup
```bash
# Fork the repository
git clone https://github.com/yourusername/niluflix.git
cd niluflix

# Install dependencies
npm install

# Start development environment
npm run dev
```

### Project Structure
```
niluflix/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   ├── server/         # Express backend
│   └── shared/         # Shared utilities
├── database/
│   ├── migrations/     # Database migrations
│   └── seeds/          # Test data
├── config/             # Configuration files
├── scripts/            # Build and utility scripts
├── build/              # Electron builder config
│   ├── icon.icns       # macOS app icon
│   └── installer.js    # Custom installer logic
└── dist/               # Built app outputs
    └── NiluFlix.dmg    # Final distributable
```

### Package.json Scripts
```json
{
  "scripts": {
    "setup": "npm install && npm run db:setup",
    "dev": "concurrently \"npm run server:dev\" \"npm run electron:dev\"",
    "build:mac": "electron-builder --mac",
    "build:all": "electron-builder --mac --win --linux",
    "dist": "npm run build && electron-builder"
  }
}
```

### Contributing Guidelines
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- **ESLint + Prettier** for consistent formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

## 📝 API Documentation

### Internal API Endpoints

#### Movies
```
GET    /api/movies/popular          # Get popular movies
GET    /api/movies/search/:query    # Search movies
GET    /api/movies/:id              # Get movie details
POST   /api/movies/:id/download     # Start movie download
GET    /api/movies/downloaded       # Get downloaded movies
```

#### TV Shows
```
GET    /api/tv/popular              # Get popular TV shows
GET    /api/tv/search/:query        # Search TV shows
GET    /api/tv/:id                  # Get show details
GET    /api/tv/:id/season/:num      # Get season details
POST   /api/tv/:id/download         # Download entire show
POST   /api/episodes/:id/download   # Download specific episode
```

#### Downloads
```
GET    /api/downloads               # Get active downloads
DELETE /api/downloads/:id           # Cancel download
GET    /api/downloads/history       # Download history
```

#### Remote Access
```
GET    /api/remote/status           # Check if remote access enabled
POST   /api/remote/enable           # Enable remote access
GET    /api/remote/link             # Get shareable web link
POST   /api/remote/disable          # Disable remote access
```

### Web Interface API Usage

```javascript
// Web interface connects to desktop app API
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://yourname.ddns.net:3001'  // Your home network
  : 'http://localhost:3001';          // Local development

// Remote control functions
const queueDownload = async (movieId) => {
  await fetch(`${API_BASE}/api/movies/${movieId}/download`, {
    method: 'POST'
  });
};

const getLibrary = async () => {
  const response = await fetch(`${API_BASE}/api/movies/downloaded`);
  return response.json();
};
```

## 🚨 Legal Disclaimer

This software is for **educational purposes only**. Users are responsible for:
- Complying with local copyright laws
- Only downloading content they legally own
- Using appropriate VPN/privacy protection
- Understanding the legal implications in their jurisdiction

The developers assume no responsibility for how this software is used.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎬 Distribution Options

### For End Users
- **Desktop App**: Direct download of `.dmg` file
- **Web Interface**: Deploy to Vercel (free) for remote access
- **GitHub Releases**: Automatic builds on every release (free hosting)
- **Homebrew Cask**: `brew install --cask niluflix` (coming soon)

### For Developers
- **Source Code**: Full source available on GitHub
- **Development Mode**: `npm run dev` for live development
- **Custom Builds**: Modify and build your own version
- **Web Interface**: Separate repo for web frontend deployment

## 🚀 Roadmap

### v1.0 - Core Features
- ✅ Netflix-style interface
- ✅ Movie/TV show torrenting
- ✅ Smart quality selection
- ✅ One-click desktop app

### v1.1 - Enhanced Remote Access
- ✅ Web interface for remote control
- ✅ One-click remote access setup
- 🔄 Mobile app (iOS/Android)
- 🔄 Authentication for web interface
- 🔄 Multi-user support

### v1.2 - Advanced Features
- 🔄 Auto-subtitle downloads
- 🔄 Watch party mode
- 🔄 IMDB ratings integration
- 🔄 Custom torrent sources

## 🙏 Acknowledgments

- **TMDB** for the comprehensive movie database API
- **Transmission/qBittorrent** for reliable torrenting
- **Electron** for making desktop apps with web tech
- **React** ecosystem for the beautiful UI
- **The open-source community** for inspiration and tools

---

**⚠️ Remember to use responsibly and in compliance with your local laws.**

*Built with ❤️ for the community. Star ⭐ this repo if you find it useful!*
