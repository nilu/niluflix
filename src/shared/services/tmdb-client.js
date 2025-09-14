"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TMDBClient = void 0;
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class TMDBClient {
    constructor(config) {
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        if (!config.apiKey) {
            throw new Error('TMDB API key is required');
        }
        this.config = {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl || 'https://api.themoviedb.org/3',
            imageBaseUrl: config.imageBaseUrl || 'https://image.tmdb.org/t/p',
            language: config.language || 'en-US',
            region: config.region || 'US',
            rateLimitRpm: config.rateLimitRpm || 40,
        };
        // Calculate delay between requests based on rate limit
        this.rateLimitDelay = (60 * 1000) / this.config.rateLimitRpm;
        this.client = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: 10000,
            headers: {
                'User-Agent': 'NiluFlix/1.0.0',
            },
            params: {
                api_key: this.config.apiKey,
                language: this.config.language,
                region: this.config.region,
            },
        });
        this.cacheDir = path_1.default.join(process.cwd(), '.cache', 'tmdb');
        this.initializeCache();
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 429) {
                console.warn('TMDB rate limit exceeded, queuing request');
                throw new Error('Rate limit exceeded');
            }
            throw error;
        });
    }
    async initializeCache() {
        try {
            await promises_1.default.mkdir(this.cacheDir, { recursive: true });
        }
        catch (error) {
            console.warn('Failed to create cache directory:', error);
        }
    }
    getCacheKey(endpoint, params) {
        const paramString = params ? JSON.stringify(params) : '';
        return `${endpoint}_${paramString}`;
    }
    isValidCacheEntry(entry) {
        return Date.now() - entry.timestamp < entry.ttl;
    }
    async getFromCache(key) {
        // Check memory cache first
        const memoryEntry = this.cache.get(key);
        if (memoryEntry && this.isValidCacheEntry(memoryEntry)) {
            return memoryEntry.data;
        }
        // Check disk cache
        try {
            const filePath = path_1.default.join(this.cacheDir, `${key}.json`);
            const fileContent = await promises_1.default.readFile(filePath, 'utf-8');
            const diskEntry = JSON.parse(fileContent);
            if (this.isValidCacheEntry(diskEntry)) {
                // Move to memory cache
                this.cache.set(key, diskEntry);
                return diskEntry.data;
            }
        }
        catch (error) {
            // File doesn't exist or is corrupted
        }
        return null;
    }
    async setCache(key, data, ttlHours = 24) {
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: ttlHours * 60 * 60 * 1000,
        };
        // Set in memory cache
        this.cache.set(key, entry);
        // Set in disk cache
        try {
            const filePath = path_1.default.join(this.cacheDir, `${key}.json`);
            await promises_1.default.writeFile(filePath, JSON.stringify(entry), 'utf-8');
        }
        catch (error) {
            console.warn('Failed to write to disk cache:', error);
        }
    }
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push(async () => {
                try {
                    const response = await requestFn();
                    resolve(response.data);
                }
                catch (error) {
                    reject(error);
                }
            });
            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }
        this.isProcessingQueue = true;
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            // Enforce rate limiting
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            if (timeSinceLastRequest < this.rateLimitDelay) {
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
            }
            try {
                await request();
                this.lastRequestTime = Date.now();
            }
            catch (error) {
                console.error('Request failed:', error);
            }
        }
        this.isProcessingQueue = false;
    }
    async makeRequest(endpoint, params, ttlHours = 24) {
        const cacheKey = this.getCacheKey(endpoint, params);
        // Check cache first
        const cachedData = await this.getFromCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        // Make API request
        const data = await this.queueRequest(() => this.client.get(endpoint, { params }));
        // Cache the result
        await this.setCache(cacheKey, data, ttlHours);
        return data;
    }
    // Image URL helpers
    getImageUrl(path, size = 'w500') {
        if (!path)
            return null;
        return `${this.config.imageBaseUrl}/${size}${path}`;
    }
    getPosterUrl(posterPath, size) {
        return this.getImageUrl(posterPath, size);
    }
    getBackdropUrl(backdropPath, size) {
        return this.getImageUrl(backdropPath, size);
    }
    // Movie endpoints
    async getPopularMovies(page = 1) {
        return this.makeRequest('/movie/popular', { page });
    }
    async getTrendingMovies(timeWindow = 'day', page = 1) {
        return this.makeRequest(`/trending/movie/${timeWindow}`, { page });
    }
    async searchMovies(query, page = 1, year) {
        const params = { query, page };
        if (year)
            params.year = year;
        return this.makeRequest('/search/movie', params, 1); // Shorter cache for searches
    }
    async getMovieDetails(id, appendToResponse) {
        const params = {};
        if (appendToResponse)
            params.append_to_response = appendToResponse;
        return this.makeRequest(`/movie/${id}`, params);
    }
    async getMovieCredits(id) {
        return this.makeRequest(`/movie/${id}/credits`);
    }
    async getMovieVideos(id) {
        return this.makeRequest(`/movie/${id}/videos`);
    }
    // TV Show endpoints
    async getPopularTVShows(page = 1) {
        return this.makeRequest('/tv/popular', { page });
    }
    async getTrendingTVShows(timeWindow = 'day', page = 1) {
        return this.makeRequest(`/trending/tv/${timeWindow}`, { page });
    }
    async searchTVShows(query, page = 1, firstAirDateYear) {
        const params = { query, page };
        if (firstAirDateYear)
            params.first_air_date_year = firstAirDateYear;
        return this.makeRequest('/search/tv', params, 1); // Shorter cache for searches
    }
    async getTVShowDetails(id, appendToResponse) {
        const params = {};
        if (appendToResponse)
            params.append_to_response = appendToResponse;
        return this.makeRequest(`/tv/${id}`, params);
    }
    async getTVShowSeason(tvId, seasonNumber) {
        return this.makeRequest(`/tv/${tvId}/season/${seasonNumber}`);
    }
    async getTVShowEpisode(tvId, seasonNumber, episodeNumber) {
        return this.makeRequest(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
    }
    async getTVShowCredits(id) {
        return this.makeRequest(`/tv/${id}/credits`);
    }
    async getTVShowVideos(id) {
        return this.makeRequest(`/tv/${id}/videos`);
    }
    // Genre endpoints
    async getMovieGenres() {
        return this.makeRequest('/genre/movie/list', {}, 24 * 7); // Cache for a week
    }
    async getTVGenres() {
        return this.makeRequest('/genre/tv/list', {}, 24 * 7); // Cache for a week
    }
    // Configuration
    async getConfiguration() {
        return this.makeRequest('/configuration', {}, 24 * 7); // Cache for a week
    }
    // Clear cache methods
    clearMemoryCache() {
        this.cache.clear();
    }
    async clearDiskCache() {
        try {
            const files = await promises_1.default.readdir(this.cacheDir);
            await Promise.all(files.map(file => promises_1.default.unlink(path_1.default.join(this.cacheDir, file))));
        }
        catch (error) {
            console.warn('Failed to clear disk cache:', error);
        }
    }
    async clearAllCache() {
        this.clearMemoryCache();
        await this.clearDiskCache();
    }
}
exports.TMDBClient = TMDBClient;
//# sourceMappingURL=tmdb-client.js.map