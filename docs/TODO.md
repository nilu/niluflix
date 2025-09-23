# NiluFlix Development TODO 🎬

## Step 0: Environment & Tooling Setup (M1 Mac)

### Core Development Tools
- [ ] **Node.js** (via nvm for version management)
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install --lts
  nvm use --lts
  ```
- [ ] **Package Managers**
  - [ ] npm (comes with Node.js)
  - [ ] Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- [ ] **Git** (likely pre-installed): `git --version`
- [ ] **Code Editor**: VS Code with extensions:
  - [ ] TypeScript and JavaScript Language Features
  - [ ] Prettier - Code formatter
  - [ ] ESLint
  - [ ] Tailwind CSS IntelliSense
  - [ ] SQLite Viewer

### Electron & Desktop Development
- [ ] **Electron** (project dependency, handled via npm)
- [ ] **electron-builder** (for packaging .dmg files)
- [ ] **Xcode Command Line Tools**: `xcode-select --install`

### Database & Backend Tools
- [ ] **SQLite** (built into macOS, verify): `sqlite3 --version`
- [ ] **Supabase** account and project setup
- [ ] **Database GUI**: DB Browser for SQLite or TablePlus
- [ ] **Prisma CLI**: `npm install -g prisma`

### Torrenting Tools (for development/testing)
- [ ] **Transmission** (lightweight): `brew install transmission`
- [ ] **qBittorrent** (alternative): `brew install qbittorrent`

### API & External Services
- [ ] **TMDB API Key**: Register at https://www.themoviedb.org/settings/api
- [ ] **Supabase Project**: Create at https://supabase.com/dashboard
- [ ] **OpenSubtitles API**: Register for subtitle support

### Optional Development Tools
- [ ] **Vercel CLI** (for web deployment): `npm install -g vercel`
- [ ] **Postman** or **Insomnia** (API testing)
- [ ] **Docker** (if containerization needed later)

---

## Core Feature Development (MVP)

### Step 1: Project Foundation & Structure ✅ COMPLETED
- [x] **1.1** Initialize project structure
  - [x] Create main directories: `src/`, `database/`, `config/`, `scripts/`
  - [x] Setup package.json with all necessary dependencies
  - [x] Configure TypeScript, ESLint, Prettier
- [x] **1.2** Environment configuration
  - [x] Create `.env.example` and `.env` files
  - [x] Setup environment variable loading
  - [x] Configure different environments (dev, production)

### Step 2: Database Layer & Core Models ✅ COMPLETED
- [x] **2.1** Database setup
  - [x] Initialize SQLite database (desktop app)
  - [x] Setup Supabase project (web interface)
  - [x] Setup Prisma ORM configuration for both databases
  - [x] Create database schemas (movies, tv_shows, episodes, download_queue)
- [x] **2.2** Database migrations
  - [x] Create initial migration files for SQLite
  - [x] Create Supabase migration files
  - [x] Setup seed data for development
  - [x] Database connection and error handling

### Step 3: Backend API Foundation ✅ COMPLETED
- [x] **3.1** Express server setup
  - [x] Basic Express app with TypeScript
  - [x] CORS configuration for Electron integration
  - [x] Error handling middleware
  - [x] Request logging and validation
- [x] **3.2** Core API routes structure
  - [x] Movies endpoints (`/api/movies/*`)
  - [x] TV Shows endpoints (`/api/tv/*`)
  - [x] Downloads endpoints (`/api/downloads/*`)
  - [x] Health check endpoint

### Step 4: External API Integration ✅ COMPLETED
- [x] **4.1** TMDB API integration
  - [x] API client setup with rate limiting
  - [x] Movie search and details endpoints
  - [x] TV show and episode data fetching
  - [x] Image URL generation and caching
- [x] **4.2** Torrent search integration
  - [x] torrent-search-api setup
  - [x] Quality preference algorithm (1080p → 720p → 4K)
  - [x] Seeder count optimization
  - [x] Magnet link generation

### Step 5: Torrenting Engine
- [x] **5.1** Torrent client integration
  - [x] Auto-detect Transmission/qBittorrent installation
  - [x] Client communication (API/RPC)
  - [x] Download queue management
- [x] **5.2** File management
  - [x] Auto-create download directories (`~/Movies/NiluFlix/`)
  - [x] File organization (Movies/, TV Shows/, proper folder structure)
  - [x] Metadata file generation
  - [x] Progress tracking and status updates

### Step 6: Frontend Foundation (React)
- [x] **6.1** React app setup
  - [x] Create React app with TypeScript
  - [x] Tailwind CSS v4.1 configuration with PostCSS
  - [x] React Router with HashRouter for Electron
  - [x] Component architecture foundation
- [x] **6.2** Component architecture
  - [x] Layout components (Header, Sidebar, MainLayout)
  - [x] Netflix-style homepage with content rows
  - [x] Movie/TV show cards with hover effects
  - [x] Professional routing and navigation

### Step 7: Netflix-Style UI Components
- [x] **7.1** Home page layout
  - [x] Hero section with featured content
  - [x] Content rows (Popular, Trending, etc.)
  - [x] Responsive grid layout
- [x] **7.2** Content display components
  - [x] Movie/show cards with posters
  - [x] Hover effects and trailers
  - [x] Download status indicators
  - [x] Rating and metadata display

### Step 8: Core User Features
- [ ] **8.1** Content browsing
  - [x] Home feed with latest releases
  - [x] Search functionality
  - [ ] Category/genre filtering
  - [ ] Content detail pages
- [ ] **8.2** Download functionality
  - [x] One-click movie downloads
  - [ ] TV show season/episode selection
  - [ ] Download progress visualization
  - [ ] Download queue management

### Step 9: Personal Library
- [ ] **9.1** "My Shows" sidebar
  - [ ] Downloaded content listing
  - [ ] Quick access to personal library
  - [ ] Organize by type (Movies/TV Shows)
- [ ] **9.2** Content management
  - [ ] Mark favorites
  - [ ] Watch status tracking
  - [ ] Local file integration

### Step 10: Electron Desktop App
- [ ] **10.1** Electron main process
  - [ ] Window management and configuration
  - [ ] Menu bar and system tray integration
  - [ ] Auto-updater setup
- [ ] **10.2** Electron-React integration
  - [ ] Bundle React app in Electron
  - [ ] IPC communication between main/renderer
  - [ ] Native OS integrations

### Step 11: App Packaging & Distribution
- [ ] **11.1** Build configuration
  - [ ] electron-builder setup for macOS (M1 optimized)
  - [ ] DMG installer creation
  - [ ] Code signing and notarization
- [ ] **11.2** Auto-configuration on first launch
  - [ ] Detect/install torrent clients
  - [ ] Create necessary directories
  - [ ] Configure default settings
  - [ ] Database initialization

### Step 12: Testing & Quality Assurance
- [ ] **12.1** Unit testing
  - [ ] API endpoint testing
  - [ ] Database operations testing
  - [ ] Component testing (React Testing Library)
- [ ] **12.2** Integration testing
  - [ ] End-to-end download flow
  - [ ] TMDB API integration testing
  - [ ] File system operations testing

---

## Optional Features (Post-MVP)

### Remote Web Access
- [ ] **Web-1** Vercel + Supabase deployment setup
  - [ ] Separate web interface repository
  - [ ] Same React frontend adapted for web
  - [ ] Supabase database integration
  - [ ] Connection to desktop app API
- [ ] **Web-2** Remote access configuration
  - [ ] Dynamic DNS setup
  - [ ] Network configuration automation
  - [ ] Web interface authentication (Supabase Auth)
- [ ] **Web-3** Remote control features
  - [ ] Remote download queuing
  - [ ] Progress monitoring from anywhere
  - [ ] Library sharing with friends
  - [ ] Real-time sync between desktop and web

### Advanced Features
- [ ] **Adv-1** Auto-subtitle downloads
  - [ ] OpenSubtitles API integration
  - [ ] Automatic subtitle matching
  - [ ] Multiple language support
- [ ] **Adv-2** Enhanced discovery
  - [ ] IMDB ratings integration
  - [ ] Personal recommendations
  - [ ] Watchlist functionality
- [ ] **Adv-3** Social features
  - [ ] Watch party mode
  - [ ] Library sharing
  - [ ] Multi-user support

### Mobile & Cross-Platform
- [ ] **Mobile-1** iOS/Android app development
  - [ ] React Native implementation
  - [ ] Remote control functionality
  - [ ] Push notifications for download completion
- [ ] **Mobile-2** Cross-platform desktop
  - [ ] Windows and Linux builds
  - [ ] Platform-specific optimizations
  - [ ] Alternative torrent client support

### Performance & Scalability
- [ ] **Perf-1** Caching layer
  - [ ] TMDB API response caching
  - [ ] Image caching and optimization
  - [ ] Database query optimization
- [ ] **Perf-2** Advanced download management
  - [ ] Bandwidth throttling
  - [ ] Schedule-based downloads
  - [ ] Smart storage management

### Security & Privacy
- [ ] **Sec-1** Enhanced privacy features
  - [ ] Built-in VPN integration
  - [ ] Encrypted local storage
  - [ ] Anonymous torrent proxy
- [ ] **Sec-2** Access control
  - [ ] User authentication system
  - [ ] Parental controls
  - [ ] Content filtering options

---

## Development Environment Verification

After Step 0 completion, verify setup:
```bash
# Node.js and npm
node --version  # Should be v18+ LTS
npm --version   # Should be v9+

# Development tools
git --version
sqlite3 --version
code --version  # VS Code

# Torrent clients
transmission-daemon --version
# OR
qbittorrent --version

# Project setup verification
npx create-electron-app test-app  # Should work without errors
rm -rf test-app  # Clean up test
```

---

**🎯 Success Criteria for MVP:**
- ✅ One-click .dmg installer that works immediately
- ✅ Netflix-style UI for browsing movies/TV shows
- ✅ Automatic torrent finding and downloading
- ✅ Proper file organization in ~/Movies/NiluFlix/
- ✅ Download progress tracking and status updates
- ✅ Personal library management

**📱 Post-MVP Goals:**
- Remote web access from any device
- Mobile app for remote control
- Advanced social and sharing features
