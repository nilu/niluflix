"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorrentSearchEngine = void 0;
const torrent_search_api_1 = __importDefault(require("torrent-search-api"));
class TorrentSearchEngine {
    constructor() {
        this.providers = [];
        this.isInitialized = false;
        this.qualityPreferences = {
            '1080p': 3,
            '720p': 2,
            '4K': 1,
            '2160p': 1,
            'unknown': 0
        };
        this.initializeProviders();
    }
    async initializeProviders() {
        if (this.isInitialized)
            return;
        try {
            // Enable all available providers
            const availableProviders = torrent_search_api_1.default.getProviders();
            console.log('Available torrent providers:', availableProviders.map(p => p.name));
            // Prioritize reliable providers
            const preferredProviders = [
                '1337x',
                'ThePirateBay',
                'Torrentz2',
                'Nyaa',
                'YTS'
            ];
            for (const providerName of preferredProviders) {
                const provider = availableProviders.find(p => p.name === providerName);
                if (provider) {
                    try {
                        torrent_search_api_1.default.enableProvider(provider.name);
                        this.providers.push(provider.name);
                        console.log(`✅ Enabled torrent provider: ${provider.name}`);
                    }
                    catch (error) {
                        console.warn(`⚠️ Failed to enable provider ${provider.name}:`, error);
                    }
                }
            }
            // Enable remaining providers as fallbacks
            for (const provider of availableProviders) {
                if (!this.providers.includes(provider.name)) {
                    try {
                        torrent_search_api_1.default.enableProvider(provider.name);
                        this.providers.push(provider.name);
                    }
                    catch (error) {
                        console.warn(`⚠️ Failed to enable fallback provider ${provider.name}:`, error);
                    }
                }
            }
            this.isInitialized = true;
            console.log(`🔍 Torrent search initialized with ${this.providers.length} providers`);
        }
        catch (error) {
            console.error('Failed to initialize torrent providers:', error);
            throw new Error('Torrent search initialization failed');
        }
    }
    extractQuality(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('2160p') || titleLower.includes('4k')) {
            return titleLower.includes('2160p') ? '2160p' : '4K';
        }
        if (titleLower.includes('1080p'))
            return '1080p';
        if (titleLower.includes('720p'))
            return '720p';
        return 'unknown';
    }
    calculateScore(torrent, preferredQuality = 'auto') {
        let score = 0;
        // Seeder count (most important factor)
        const seeders = parseInt(torrent.seeders) || 0;
        score += Math.min(seeders * 2, 1000); // Cap at 1000 points for seeders
        // Quality preference
        const quality = this.extractQuality(torrent.title);
        const qualityScore = this.qualityPreferences[quality] || 0;
        if (preferredQuality === 'auto') {
            // Default preference: 1080p > 720p > 4K > unknown
            score += qualityScore * 100;
        }
        else if (preferredQuality === quality) {
            // Exact quality match gets bonus
            score += 500;
        }
        else if (quality !== 'unknown') {
            // Other known qualities get partial points
            score += qualityScore * 50;
        }
        // Size preference (reasonable file sizes get bonus)
        const sizeStr = torrent.size || '';
        const sizeMatch = sizeStr.match(/([\d.]+)\s*(GB|MB)/i);
        if (sizeMatch) {
            const size = parseFloat(sizeMatch[1]);
            const unit = sizeMatch[2].toUpperCase();
            let sizeInGB = unit === 'GB' ? size : size / 1024;
            // Ideal size ranges for movies
            if (quality === '720p' && sizeInGB >= 0.8 && sizeInGB <= 3)
                score += 50;
            else if (quality === '1080p' && sizeInGB >= 1.5 && sizeInGB <= 8)
                score += 50;
            else if ((quality === '4K' || quality === '2160p') && sizeInGB >= 4 && sizeInGB <= 25)
                score += 50;
        }
        // Trusted indicators
        const titleLower = torrent.title.toLowerCase();
        if (titleLower.includes('webrip') || titleLower.includes('web-dl'))
            score += 30;
        if (titleLower.includes('bluray') || titleLower.includes('bdrip'))
            score += 25;
        if (titleLower.includes('yts') || titleLower.includes('yify'))
            score += 20; // Popular for movies
        // Penalize poor indicators
        if (titleLower.includes('cam') || titleLower.includes('ts') || titleLower.includes('tc'))
            score -= 200;
        if (seeders < 5)
            score -= 100;
        return Math.max(score, 0);
    }
    buildSearchTerms(title, year, type) {
        const baseTerms = [title];
        if (year) {
            baseTerms.push(`${title} ${year}`);
        }
        // Add common quality variations
        const qualityTerms = [];
        for (const baseTerm of baseTerms) {
            qualityTerms.push(baseTerm);
            qualityTerms.push(`${baseTerm} 1080p`);
            qualityTerms.push(`${baseTerm} 720p`);
            if (type === 'movie') {
                qualityTerms.push(`${baseTerm} BluRay`);
                qualityTerms.push(`${baseTerm} WEB-DL`);
            }
        }
        return [...new Set(qualityTerms)]; // Remove duplicates
    }
    async searchTorrents(title, options = {}) {
        await this.initializeProviders();
        const { category = 'all', maxResults = 50, minSeeders = 1, preferredQuality = 'auto', providers = this.providers, timeout = 30000 } = options;
        console.log(`🔍 Searching torrents for: "${title}"`);
        console.log(`📊 Options:`, { category, maxResults, minSeeders, preferredQuality });
        try {
            // Search with multiple terms
            const searchTerms = this.buildSearchTerms(title);
            const allResults = [];
            // Search with each term
            for (const searchTerm of searchTerms.slice(0, 3)) { // Limit to first 3 terms
                try {
                    console.log(`🔎 Searching for: "${searchTerm}"`);
                    // Set category
                    if (category === 'movies') {
                        torrent_search_api_1.default.setCategory('Movies');
                    }
                    else if (category === 'tv') {
                        torrent_search_api_1.default.setCategory('TV');
                    }
                    else {
                        torrent_search_api_1.default.setCategory('All');
                    }
                    const results = await Promise.race([
                        torrent_search_api_1.default.search(searchTerm, category === 'all' ? 'All' : category, maxResults),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), timeout))
                    ]);
                    if (Array.isArray(results)) {
                        allResults.push(...results);
                    }
                }
                catch (error) {
                    console.warn(`Search failed for term "${searchTerm}":`, error);
                }
            }
            console.log(`📝 Found ${allResults.length} raw results`);
            // Process and rank results
            const processedResults = allResults
                .map((result) => ({
                title: result.title || '',
                magnet: result.magnet || '',
                size: result.size || '',
                seeders: parseInt(result.seeds) || parseInt(result.seeders) || 0,
                leechers: parseInt(result.peers) || parseInt(result.leechers) || 0,
                time: result.time || result.upload || '',
                provider: result.provider || 'unknown',
                quality: this.extractQuality(result.title || ''),
                score: 0, // Will be calculated next
                verified: result.verified === true
            }))
                .filter(result => result.magnet &&
                result.title &&
                result.seeders >= minSeeders)
                .map(result => ({
                ...result,
                score: this.calculateScore(result, preferredQuality)
            }))
                .sort((a, b) => b.score - a.score) // Sort by score descending
                .slice(0, maxResults);
            console.log(`✅ Returning ${processedResults.length} filtered and ranked results`);
            // Log top 3 results for debugging
            processedResults.slice(0, 3).forEach((result, index) => {
                console.log(`🏆 #${index + 1}: ${result.title}`);
                console.log(`   Score: ${result.score}, Seeders: ${result.seeders}, Quality: ${result.quality}`);
            });
            return processedResults;
        }
        catch (error) {
            console.error('Torrent search failed:', error);
            throw new Error(`Failed to search torrents: ${error.message}`);
        }
    }
    async findMovieTorrents(title, year, preferredQuality = 'auto') {
        return this.searchTorrents(title, {
            category: 'movies',
            preferredQuality,
            maxResults: 30,
            minSeeders: 5
        });
    }
    async findTVShowTorrents(showTitle, season, episode, preferredQuality = 'auto') {
        let searchTitle = showTitle;
        if (season !== undefined) {
            const seasonStr = season.toString().padStart(2, '0');
            if (episode !== undefined) {
                const episodeStr = episode.toString().padStart(2, '0');
                searchTitle = `${showTitle} S${seasonStr}E${episodeStr}`;
            }
            else {
                searchTitle = `${showTitle} S${seasonStr}`;
            }
        }
        return this.searchTorrents(searchTitle, {
            category: 'tv',
            preferredQuality,
            maxResults: 30,
            minSeeders: 3 // Lower requirement for TV shows
        });
    }
    async getBestTorrent(title, options) {
        const results = await this.searchTorrents(title, options);
        return results.length > 0 ? results[0] : null;
    }
    async getMagnetLink(torrent) {
        if (torrent.magnet) {
            return torrent.magnet;
        }
        throw new Error('No magnet link available for this torrent');
    }
    getProviders() {
        return [...this.providers];
    }
    async enableProvider(providerName) {
        try {
            torrent_search_api_1.default.enableProvider(providerName);
            if (!this.providers.includes(providerName)) {
                this.providers.push(providerName);
            }
            console.log(`✅ Enabled provider: ${providerName}`);
        }
        catch (error) {
            console.error(`Failed to enable provider ${providerName}:`, error);
            throw error;
        }
    }
    async disableProvider(providerName) {
        try {
            torrent_search_api_1.default.disableProvider(providerName);
            this.providers = this.providers.filter(p => p !== providerName);
            console.log(`❌ Disabled provider: ${providerName}`);
        }
        catch (error) {
            console.error(`Failed to disable provider ${providerName}:`, error);
            throw error;
        }
    }
}
exports.TorrentSearchEngine = TorrentSearchEngine;
//# sourceMappingURL=torrent-search.js.map