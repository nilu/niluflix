# NiluFlix Architecture Document 🏗️

## Overview

NiluFlix is a hybrid desktop-first streaming platform that combines a Netflix-style interface with intelligent torrenting capabilities. The architecture consists of a self-contained Electron desktop application with optional remote web access for multi-device control.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                         │
├─────────────────────┬───────────────────┬───────────────────────┤
│   Desktop App       │   Web Interface   │   Mobile App          │
│   (Primary)         │   (Optional)      │   (Future)           │
│                     │                   │                       │
│   ┌─────────────┐   │   ┌───────────┐   │   ┌─────────────┐     │
│   │  Electron   │   │   │  Vercel   │   │   │ React Native│     │
│   │  + React    │   │   │  + React  │   │   │   App       │     │
│   └─────────────┘   │   └───────────┘   │   └─────────────┘     │
└─────────────────────┴───────────────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CORE SERVICES                             │
├─────────────────────┬───────────────────┬───────────────────────┤
│   Desktop API       │   Data Layer      │   External APIs       │
│   (Express)         │                   │                       │
│                     │                   │                       │
│   ┌─────────────┐   │   ┌───────────┐   │   ┌─────────────┐     │
│   │ REST API    │◄──┼──►│  SQLite   │   │   │    TMDB     │     │
│   │ Endpoints   │   │   │ (Primary) │   │   │     API     │     │
│   └─────────────┘   │   └───────────┘   │   └─────────────┘     │
│                     │                   │                       │
│   ┌─────────────┐   │   ┌───────────┐   │   ┌─────────────┐     │
│   │ WebSocket   │   │   │ Supabase  │   │   │ Torrent     │     │
│   │ (Real-time) │   │   │ (Web DB)  │   │   │ Search API  │     │
│   └─────────────┘   │   └───────────┘   │   └─────────────┘     │
└─────────────────────┴───────────────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOWNLOAD ENGINE                             │
├─────────────────────┬───────────────────┬───────────────────────┤
│   Torrent Client    │   File System     │   Background Tasks    │
│                     │                   │                       │
│   ┌─────────────┐   │   ┌───────────┐   │   ┌─────────────┐     │
│   │Transmission │   │   │ ~/Movies/ │   │   │ Download    │     │
│   │     OR      │   │   │ NiluFlix/ │   │   │ Manager     │     │
│   │qBittorrent  │   │   │ Structure │   │   │ (Queue)     │     │
│   └─────────────┘   │   └───────────┘   │   └─────────────┘     │
└─────────────────────┴───────────────────┴───────────────────────┘
```

## Core Components

### 1. Desktop Application (Primary Interface)

#### Electron Main Process
```typescript
// src/main/main.ts
class NiluFlixApp {
  private mainWindow: BrowserWindow;
  private apiServer: Express;
  private torrentClient: TorrentClient;
  
  async initialize() {
    await this.setupDirectories();
    await this.initializeDatabase();
    await this.startApiServer();
    await this.detectTorrentClient();
    await this.createMainWindow();
  }
}
```

**Responsibilities:**
- Window management and OS integration
- Auto-configuration on first launch
- System tray and menu integration
- Auto-updater functionality
- IPC communication with renderer

#### Electron Renderer Process (React Frontend)
```typescript
// src/renderer/App.tsx
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv/:id" element={<TVShowDetailPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};
```

### 2. Backend API Server (Express)

#### Core API Structure
```typescript
// src/server/server.ts
class ApiServer {
  private app: Express;
  private db: Database;
  
  setupRoutes() {
    this.app.use('/api/movies', movieRoutes);
    this.app.use('/api/tv', tvRoutes);
    this.app.use('/api/downloads', downloadRoutes);
    this.app.use('/api/library', libraryRoutes);
    this.app.use('/api/remote', remoteRoutes);
  }
}
```

#### API Endpoints
```typescript
// Movies API
GET    /api/movies/popular
GET    /api/movies/trending
GET    /api/movies/search/:query
GET    /api/movies/:id
POST   /api/movies/:id/download
GET    /api/movies/downloaded

// TV Shows API
GET    /api/tv/popular
GET    /api/tv/trending
GET    /api/tv/search/:query
GET    /api/tv/:id
GET    /api/tv/:id/season/:seasonNumber
POST   /api/tv/:id/download
POST   /api/episodes/:id/download

// Downloads API
GET    /api/downloads/active
GET    /api/downloads/history
DELETE /api/downloads/:id
GET    /api/downloads/progress

// Library API
GET    /api/library/movies
GET    /api/library/tv-shows
POST   /api/library/sync

// Remote Access API
GET    /api/remote/status
POST   /api/remote/enable
POST   /api/remote/disable
GET    /api/remote/link
```

### 3. Data Layer

#### SQLite Database (Desktop)
```sql
-- Core schema for desktop app
-- Movies table
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date TEXT,
  runtime INTEGER,
  vote_average REAL,
  genres TEXT, -- JSON array
  download_status TEXT DEFAULT 'not_downloaded',
  file_path TEXT,
  file_size INTEGER,
  download_progress REAL DEFAULT 0,
  magnet_link TEXT,
  torrent_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TV Shows table
CREATE TABLE tv_shows (
  id INTEGER PRIMARY KEY,
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
  status TEXT,
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
  magnet_link TEXT,
  torrent_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tv_show_id) REFERENCES tv_shows(id)
);

-- Download queue
CREATE TABLE download_queue (
  id INTEGER PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'movie' or 'episode'
  content_id INTEGER NOT NULL,
  torrent_magnet TEXT NOT NULL,
  torrent_name TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued', -- 'queued', 'downloading', 'completed', 'failed'
  progress REAL DEFAULT 0,
  download_speed INTEGER DEFAULT 0,
  eta INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Supabase Database (Web Interface)
```sql
-- Remote sessions tracking
CREATE TABLE remote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_app_id TEXT UNIQUE NOT NULL,
  app_version TEXT,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  ip_address INET,
  port INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared library metadata (no actual files)
CREATE TABLE shared_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_app_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL, -- 'movie' or 'tv_show'
  title TEXT NOT NULL,
  poster_path TEXT,
  download_status TEXT DEFAULT 'not_downloaded',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (desktop_app_id) REFERENCES remote_sessions(desktop_app_id)
);

-- Remote download commands
CREATE TABLE remote_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_app_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  command_type TEXT NOT NULL, -- 'download', 'cancel', 'pause'
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  FOREIGN KEY (desktop_app_id) REFERENCES remote_sessions(desktop_app_id)
);
```

### 4. External Integrations

#### TMDB API Client
```typescript
// src/services/tmdb.ts
class TMDBClient {
  private apiKey: string;
  private baseURL = 'https://api.themoviedb.org/3';
  private cache: Map<string, any> = new Map();
  
  async searchMovies(query: string): Promise<Movie[]> {
    const cacheKey = `search_movies_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const response = await fetch(
      `${this.baseURL}/search/movie?api_key=${this.apiKey}&query=${query}`
    );
    const data = await response.json();
    
    this.cache.set(cacheKey, data.results);
    return data.results;
  }
  
  async getMovieDetails(id: number): Promise<MovieDetails> {
    // Implementation with caching
  }
  
  async getTVShowDetails(id: number): Promise<TVShowDetails> {
    // Implementation with caching
  }
}
```

#### Torrent Search Engine
```typescript
// src/services/torrent-search.ts
class TorrentSearchEngine {
  private providers = ['1337x', 'ThePirateBay', 'RARBG'];
  
  async findTorrents(title: string, year?: number, type: 'movie' | 'tv'): Promise<Torrent[]> {
    const searchTerms = this.buildSearchTerms(title, year, type);
    const results = await Promise.allSettled(
      this.providers.map(provider => 
        this.searchProvider(provider, searchTerms)
      )
    );
    
    const torrents = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    return this.rankTorrents(torrents);
  }
  
  private rankTorrents(torrents: Torrent[]): Torrent[] {
    return torrents.sort((a, b) => {
      // Quality preference: 1080p > 720p > 4K
      const qualityScore = this.getQualityScore(a) - this.getQualityScore(b);
      if (qualityScore !== 0) return qualityScore;
      
      // Seeder count (higher is better)
      return b.seeders - a.seeders;
    });
  }
  
  private getQualityScore(torrent: Torrent): number {
    if (torrent.title.includes('1080p')) return 3;
    if (torrent.title.includes('720p')) return 2;
    if (torrent.title.includes('4K') || torrent.title.includes('2160p')) return 1;
    return 0;
  }
}
```

### 5. Download Management System

#### Torrent Client Abstraction
```typescript
// src/services/torrent-client.ts
abstract class TorrentClient {
  abstract start(magnetLink: string): Promise<string>; // Returns torrent ID
  abstract pause(torrentId: string): Promise<void>;
  abstract resume(torrentId: string): Promise<void>;
  abstract remove(torrentId: string): Promise<void>;
  abstract getProgress(torrentId: string): Promise<TorrentProgress>;
  abstract listActive(): Promise<ActiveTorrent[]>;
}

class TransmissionClient extends TorrentClient {
  private rpcUrl = 'http://localhost:9091/transmission/rpc';
  
  async start(magnetLink: string): Promise<string> {
    const response = await this.rpcCall('torrent-add', {
      filename: magnetLink,
      'download-dir': this.getDownloadPath()
    });
    return response.arguments['torrent-added'].id;
  }
  
  // Implementation for other methods...
}

class QBittorrentClient extends TorrentClient {
  private baseUrl = 'http://localhost:8080';
  
  // Implementation...
}
```

#### Download Manager
```typescript
// src/services/download-manager.ts
class DownloadManager {
  private queue: DownloadJob[] = [];
  private activeDownloads: Map<string, DownloadJob> = new Map();
  private maxConcurrentDownloads = 3;
  
  async addDownload(content: Movie | Episode): Promise<void> {
    // Find best torrent
    const torrents = await this.torrentSearch.findTorrents(
      content.title,
      content.year,
      content.type
    );
    
    if (torrents.length === 0) {
      throw new Error('No torrents found');
    }
    
    const job: DownloadJob = {
      id: generateId(),
      content,
      torrent: torrents[0],
      status: 'queued',
      progress: 0,
      createdAt: new Date()
    };
    
    this.queue.push(job);
    await this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    while (
      this.activeDownloads.size < this.maxConcurrentDownloads &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift()!;
      await this.startDownload(job);
    }
  }
  
  private async startDownload(job: DownloadJob): Promise<void> {
    try {
      job.status = 'downloading';
      job.torrentId = await this.torrentClient.start(job.torrent.magnetLink);
      
      this.activeDownloads.set(job.id, job);
      
      // Update database
      await this.database.updateDownloadStatus(job.content.id, 'downloading');
      
      // Start progress monitoring
      this.monitorProgress(job);
      
    } catch (error) {
      job.status = 'failed';
      await this.database.updateDownloadStatus(job.content.id, 'failed');
    }
  }
  
  private async monitorProgress(job: DownloadJob): Promise<void> {
    const progressInterval = setInterval(async () => {
      try {
        const progress = await this.torrentClient.getProgress(job.torrentId!);
        job.progress = progress.percentDone;
        
        // Emit progress update
        this.eventEmitter.emit('download:progress', {
          jobId: job.id,
          contentId: job.content.id,
          progress: job.progress,
          downloadSpeed: progress.downloadSpeed,
          eta: progress.eta
        });
        
        // Update database
        await this.database.updateDownloadProgress(
          job.content.id,
          job.progress
        );
        
        if (progress.percentDone >= 1.0) {
          await this.completeDownload(job);
          clearInterval(progressInterval);
        }
        
      } catch (error) {
        clearInterval(progressInterval);
        await this.failDownload(job, error);
      }
    }, 5000); // Update every 5 seconds
  }
}
```

### 6. File System Management

#### File Organization
```typescript
// src/services/file-organizer.ts
class FileOrganizer {
  private basePath = path.join(os.homedir(), 'Movies', 'NiluFlix');
  
  constructor() {
    this.ensureDirectories();
  }
  
  private ensureDirectories(): void {
    const directories = [
      this.basePath,
      path.join(this.basePath, 'Movies'),
      path.join(this.basePath, 'TV Shows'),
      path.join(this.basePath, 'Downloads'),
      path.join(this.basePath, '.metadata')
    ];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  getMoviePath(movie: Movie): string {
    const sanitizedTitle = this.sanitizeFilename(movie.title);
    const year = new Date(movie.releaseDate).getFullYear();
    return path.join(
      this.basePath,
      'Movies',
      `${sanitizedTitle} (${year})`
    );
  }
  
  getTVShowPath(show: TVShow, season: number, episode: number): string {
    const sanitizedName = this.sanitizeFilename(show.name);
    return path.join(
      this.basePath,
      'TV Shows',
      sanitizedName,
      `Season ${season.toString().padStart(2, '0')}`
    );
  }
  
  async organizeDownload(torrentPath: string, content: Movie | Episode): Promise<string> {
    const targetPath = content.type === 'movie' 
      ? this.getMoviePath(content as Movie)
      : this.getTVShowPath(
          content.tvShow,
          content.seasonNumber,
          content.episodeNumber
        );
    
    // Ensure target directory exists
    await fs.promises.mkdir(targetPath, { recursive: true });
    
    // Move files
    const files = await this.findVideoFiles(torrentPath);
    const targetFile = path.join(targetPath, files[0]);
    
    await fs.promises.rename(
      path.join(torrentPath, files[0]),
      targetFile
    );
    
    // Create metadata file
    await this.createMetadataFile(targetPath, content);
    
    return targetFile;
  }
  
  private async createMetadataFile(targetPath: string, content: Movie | Episode): Promise<void> {
    const metadata = {
      tmdbId: content.tmdbId,
      title: content.title,
      type: content.type,
      downloadedAt: new Date().toISOString(),
      fileSize: await this.getFileSize(targetPath)
    };
    
    const metadataPath = path.join(targetPath, 'metadata.json');
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2)
    );
  }
}
```

## Frontend Architecture

### React Component Structure
```
src/renderer/
├── components/
│   ├── ui/                 # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Spinner.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navigation.tsx
│   │   └── MainLayout.tsx
│   ├── content/            # Content-specific components
│   │   ├── MovieCard.tsx
│   │   ├── TVShowCard.tsx
│   │   ├── ContentGrid.tsx
│   │   ├── ContentRow.tsx
│   │   └── HeroSection.tsx
│   ├── downloads/          # Download-related components
│   │   ├── DownloadButton.tsx
│   │   ├── DownloadProgress.tsx
│   │   ├── DownloadQueue.tsx
│   │   └── DownloadStatus.tsx
│   └── library/            # Library compone
nts
│       ├── LibraryGrid.tsx
│       ├── MyShows.tsx
│       └── FilterBar.tsx
├── pages/                  # Page components
│   ├── HomePage.tsx
│   ├── SearchPage.tsx
│   ├── MovieDetailPage.tsx
│   ├── TVShowDetailPage.tsx
│   ├── LibraryPage.tsx
│   └── DownloadsPage.tsx
├── hooks/                  # Custom React hooks
│   ├── useDownloads.ts
│   ├── useLibrary.ts
│   ├── useSearch.ts
│   └── useWebSocket.ts
├── services/               # API services
│   ├── api.ts
│   ├── websocket.ts
│   └── ipc.ts
├── stores/                 # State management
│   ├── downloadStore.ts
│   ├── libraryStore.ts
│   └── settingsStore.ts
└── utils/                  # Utility functions
    ├── formatting.ts
    ├── constants.ts
    └── types.ts
```

### State Management
```typescript
// src/renderer/stores/downloadStore.ts
interface DownloadState {
  activeDownloads: DownloadJob[];
  completedDownloads: DownloadJob[];
  queue: DownloadJob[];
  totalProgress: number;
}

class DownloadStore {
  private state: DownloadState = {
    activeDownloads: [],
    completedDownloads: [],
    queue: [],
    totalProgress: 0
  };
  
  private listeners: Set<() => void> = new Set();
  
  addDownload(content: Movie | Episode): void {
    // Add to queue and notify listeners
  }
  
  updateProgress(jobId: string, progress: number): void {
    // Update progress and notify listeners
  }
  
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  getState(): DownloadState {
    return { ...this.state };
  }
}
```

## Remote Web Interface

### Architecture
The web interface is a separate deployment that connects to the desktop app's API server running on the user's local machine.

```typescript
// Web interface architecture
Web Interface (Vercel) ←→ Home Network (Desktop App API)
│
├── Same React components as desktop
├── Supabase for authentication & session management
├── WebSocket connection to desktop app
└── REST API calls to desktop app (when online)
```

### Connection Flow
```typescript
// src/web/services/remote-connection.ts
class RemoteConnection {
  private desktopApiUrl: string;
  private websocket: WebSocket | null = null;
  
  async connect(sessionId: string): Promise<void> {
    // 1. Authenticate with Supabase
    const session = await supabase.auth.getSession();
    
    // 2. Get desktop app connection info
    const connectionInfo = await this.getConnectionInfo(sessionId);
    
    // 3. Establish WebSocket connection
    this.websocket = new WebSocket(connectionInfo.websocketUrl);
    
    // 4. Setup heartbeat and reconnection logic
    this.setupHeartbeat();
  }
  
  async queueDownload(content: Movie | Episode): Promise<void> {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      // Real-time command via WebSocket
      this.websocket.send(JSON.stringify({
        type: 'download',
        content
      }));
    } else {
      // Fallback: Queue command in Supabase
      await supabase
        .from('remote_downloads')
        .insert({
          desktop_app_id: this.sessionId,
          tmdb_id: content.tmdbId,
          content_type: content.type,
          command_type: 'download'
        });
    }
  }
}
```

## Security & Privacy

### Data Protection
```typescript
// src/security/encryption.ts
class DataEncryption {
  private key: Buffer;
  
  constructor() {
    this.key = this.deriveKey();
  }
  
  encryptSensitive(data: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', this.key);
    const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
  }
  
  decryptSensitive(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', this.key);
    const decrypted = decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
  }
}
```

### Network Security
```typescript
// src/security/network.ts
class NetworkSecurity {
  validateRemoteAccess(request: Request): boolean {
    // Validate API keys
    // Check rate limits
    // Verify session tokens
    return true;
  }
  
  setupSSL(): void {
    // Configure HTTPS for remote access
    // Generate self-signed certificates for local network
  }
}
```

## Performance Optimizations

### Caching Strategy
```typescript
// src/services/cache-manager.ts
class CacheManager {
  private memoryCache: Map<string, any> = new Map();
  private diskCache: LRUCache;
  
  constructor() {
    this.diskCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 60 * 24 // 24 hours
    });
  }
  
  async get(key: string): Promise<any> {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // Check disk cache
    const diskValue = await this.diskCache.get(key);
    if (diskValue) {
      this.memoryCache.set(key, diskValue);
      return diskValue;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.memoryCache.set(key, value);
    await this.diskCache.set(key, value);
  }
}
```

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_movies_download_status ON movies(download_status);
CREATE INDEX idx_episodes_tv_show_id ON episodes(tv_show_id);
CREATE INDEX idx_episodes_season_episode ON episodes(season_number, episode_number);
CREATE INDEX idx_download_queue_status ON download_queue(status);
CREATE INDEX idx_download_queue_priority ON download_queue(priority DESC);
```

## Deployment & Distribution

### Desktop App Build Process
```typescript
// build/electron-builder.config.js
module.exports = {
  appId: 'com.niluflix.app',
  productName: 'NiluFlix',
  directories: {
    output: 'dist'
  },
  mac: {
    category: 'public.app-category.entertainment',
    target: [
      {
        target: 'dmg',
        arch: ['arm64', 'x64'] // M1 and Intel Macs
      }
    ],
    icon: 'build/icon.icns'
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ]
  },
  afterSign: 'scripts/notarize.js' // macOS notarization
};
```

### Auto-Configuration Script
```typescript
// src/main/auto-configure.ts
class AutoConfigurator {
  async configure(): Promise<void> {
    await this.createDirectories();
    await this.detectTorrentClient();
    await this.initializeDatabase();
    await this.setupDefaultSettings();
    await this.testConnections();
  }
  
  private async detectTorrentClient(): Promise<void> {
    const clients = ['transmission-daemon', 'qbittorrent'];
    
    for (const client of clients) {
      try {
        await this.testClientConnection(client);
        await this.configureClient(client);
        return;
      } catch (error) {
        continue;
      }
    }
    
    // If no client found, install Transmission
    await this.installTransmission();
  }
  
  private async installTransmission(): Promise<void> {
    // Install via Homebrew or direct download
    exec('brew install transmission');
    await this.waitForInstallation();
    await this.configureClient('transmission');
  }
}
```

## Monitoring & Logging

### Application Monitoring
```typescript
// src/monitoring/app-monitor.ts
class AppMonitor {
  private metrics: Map<string, number> = new Map();
  
  trackDownload(jobId: string, event: string): void {
    const key = `download.${event}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }
  
  trackApiCall(endpoint: string, duration: number): void {
    this.metrics.set(`api.${endpoint}.calls`, 
      (this.metrics.get(`api.${endpoint}.calls`) || 0) + 1);
    this.metrics.set(`api.${endpoint}.avg_duration`, duration);
  }
  
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
// tests/services/torrent-search.test.ts
describe('TorrentSearchEngine', () => {
  it('should rank 1080p torrents higher than 720p', () => {
    const torrents = [
      { title: 'Movie 720p', seeders: 100 },
      { title: 'Movie 1080p', seeders: 50 }
    ];
    
    const ranked = torrentSearch.rankTorrents(torrents);
    expect(ranked[0].title).toContain('1080p');
  });
});
```

### Integration Tests
```typescript
// tests/integration/download-flow.test.ts
describe('Download Flow', () => {
  it('should complete full download process', async () => {
    const movie = await tmdbClient.getMovieDetails(550); // Fight Club
    await downloadManager.addDownload(movie);
    
    // Mock torrent completion
    await mockTorrentCompletion(movie.id);
    
    const downloadedMovie = await database.getMovie(movie.id);
    expect(downloadedMovie.downloadStatus).toBe('downloaded');
    expect(fs.existsSync(downloadedMovie.filePath)).toBe(true);
  });
});
```

## Scalability Considerations

### Future Enhancements
- **Multi-user support**: User accounts and permissions
- **Cloud storage integration**: OneDrive, Google Drive sync
- **Advanced AI**: Content recommendations based on viewing history
- **Streaming optimization**: Direct streaming without full download
- **Mobile apps**: Native iOS/Android applications
- **Plugin system**: Custom torrent providers and sources

This architecture provides a solid foundation for building NiluFlix as a production-ready application with room for future enhancements and scalability.
