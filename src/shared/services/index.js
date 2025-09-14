"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorrentClientDetector = exports.QBittorrentClient = exports.TransmissionClient = exports.TorrentClient = exports.FileOrganizer = exports.DownloadManager = exports.TorrentSearchEngine = exports.TMDBClient = void 0;
exports.initializeTMDB = initializeTMDB;
exports.initializeTorrentSearch = initializeTorrentSearch;
exports.initializeDownloadManager = initializeDownloadManager;
exports.getTMDBClient = getTMDBClient;
exports.getTorrentSearch = getTorrentSearch;
exports.getDownloadManager = getDownloadManager;
exports.initializeServices = initializeServices;
const tmdb_client_1 = require("./tmdb-client");
Object.defineProperty(exports, "TMDBClient", { enumerable: true, get: function () { return tmdb_client_1.TMDBClient; } });
const torrent_search_1 = require("./torrent-search");
Object.defineProperty(exports, "TorrentSearchEngine", { enumerable: true, get: function () { return torrent_search_1.TorrentSearchEngine; } });
const download_manager_1 = require("./download-manager");
Object.defineProperty(exports, "DownloadManager", { enumerable: true, get: function () { return download_manager_1.DownloadManager; } });
const file_organizer_1 = require("./file-organizer");
Object.defineProperty(exports, "FileOrganizer", { enumerable: true, get: function () { return file_organizer_1.FileOrganizer; } });
// Create singleton instances
let tmdbClient = null;
let torrentSearch = null;
let downloadManager = null;
// Initialize TMDB client
function initializeTMDB() {
    if (!tmdbClient) {
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) {
            throw new Error('TMDB_API_KEY environment variable is required');
        }
        tmdbClient = new tmdb_client_1.TMDBClient({
            apiKey,
            baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
            imageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
            language: process.env.TMDB_LANGUAGE || 'en-US',
            region: process.env.TMDB_REGION || 'US',
            rateLimitRpm: parseInt(process.env.TMDB_RATE_LIMIT_RPM || '40'),
        });
        console.log('✅ TMDB client initialized');
    }
    return tmdbClient;
}
// Initialize torrent search engine
function initializeTorrentSearch() {
    if (!torrentSearch) {
        torrentSearch = new torrent_search_1.TorrentSearchEngine();
        console.log('✅ Torrent search engine initialized');
    }
    return torrentSearch;
}
// Initialize download manager
function initializeDownloadManager() {
    if (!downloadManager) {
        downloadManager = new download_manager_1.DownloadManager();
        console.log('✅ Download manager initialized');
    }
    return downloadManager;
}
// Get singleton instances
function getTMDBClient() {
    if (!tmdbClient) {
        return initializeTMDB();
    }
    return tmdbClient;
}
function getTorrentSearch() {
    if (!torrentSearch) {
        return initializeTorrentSearch();
    }
    return torrentSearch;
}
function getDownloadManager() {
    if (!downloadManager) {
        return initializeDownloadManager();
    }
    return downloadManager;
}
// Initialize all services
function initializeServices() {
    try {
        initializeTMDB();
        initializeTorrentSearch();
        initializeDownloadManager();
        console.log('🚀 All external services initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize services:', error);
        throw error;
    }
}
var torrent_client_1 = require("./torrent-client");
Object.defineProperty(exports, "TorrentClient", { enumerable: true, get: function () { return torrent_client_1.TorrentClient; } });
Object.defineProperty(exports, "TransmissionClient", { enumerable: true, get: function () { return torrent_client_1.TransmissionClient; } });
Object.defineProperty(exports, "QBittorrentClient", { enumerable: true, get: function () { return torrent_client_1.QBittorrentClient; } });
Object.defineProperty(exports, "TorrentClientDetector", { enumerable: true, get: function () { return torrent_client_1.TorrentClientDetector; } });
//# sourceMappingURL=index.js.map