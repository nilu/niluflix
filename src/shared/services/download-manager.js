"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadManager = void 0;
const events_1 = require("events");
const torrent_client_1 = require("./torrent-client");
const file_organizer_1 = require("./file-organizer");
const torrent_search_1 = require("./torrent-search");
const logger_1 = __importDefault(require("../database/logger"));
class DownloadManager extends events_1.EventEmitter {
    constructor(maxConcurrentDownloads = 3, customDownloadPath) {
        super();
        this.jobs = new Map();
        this.isInitialized = false;
        this.maxConcurrentDownloads = maxConcurrentDownloads;
        this.fileOrganizer = new file_organizer_1.FileOrganizer(customDownloadPath);
        this.torrentSearch = new torrent_search_1.TorrentSearchEngine();
        // Start progress monitoring
        this.startProgressMonitoring();
    }
    /**
     * Initialize the download manager
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            logger_1.default.info('Initializing download manager...');
            // Detect and create torrent client
            const downloadPath = this.fileOrganizer.getDownloadsPath();
            this.torrentClient = await torrent_client_1.TorrentClientDetector.detectAndCreate(downloadPath);
            // Setup torrent client event listeners
            this.setupTorrentClientEvents();
            this.isInitialized = true;
            logger_1.default.info('Download manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            logger_1.default.error('Failed to initialize download manager:', error);
            throw error;
        }
    }
    /**
     * Add a new download to the queue
     */
    async addDownload(content, preFoundTorrents = null) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const jobId = this.generateJobId();
        logger_1.default.info(`Adding download job: ${jobId} for ${content.title}`);
        try {
            // Use pre-found torrents if provided, otherwise search for them
            let torrents;
            if (preFoundTorrents && preFoundTorrents.length > 0) {
                console.log(`🎬 Using pre-found torrents for ${content.title} (${preFoundTorrents.length} torrents)`);
                torrents = preFoundTorrents;
            } else {
                console.log(`🎬 Searching for torrents for ${content.title} (no pre-found torrents)`);
                if (content.type === 'movie') {
                    torrents = await this.torrentSearch.findMovieTorrents(content.title, content.year, 'auto');
                }
                else {
                    torrents = await this.torrentSearch.findTVShowTorrents(content.tvShowName || content.title, content.seasonNumber || 1, content.episodeNumber || 1, 'auto');
                }
            }
            if (torrents.length === 0) {
                throw new Error(`No torrents found for: ${content.title}`);
            }
            // Create download job
            const job = {
                id: jobId,
                content,
                torrent: torrents[0], // Use the best ranked torrent
                status: 'queued',
                progress: 0,
                downloadSpeed: 0,
                uploadSpeed: 0,
                eta: 0,
                createdAt: new Date()
            };
            this.jobs.set(jobId, job);
            // Emit job added event
            this.emit('jobAdded', job);
            // Try to start the download immediately if slots available
            await this.processQueue();
            logger_1.default.info(`Download job added: ${jobId} with torrent: ${torrents[0].name}`);
            return jobId;
        }
        catch (error) {
            logger_1.default.error(`Failed to add download for ${content.title}:`, error);
            // Create failed job for tracking
            const failedJob = {
                id: jobId,
                content,
                status: 'failed',
                progress: 0,
                downloadSpeed: 0,
                uploadSpeed: 0,
                eta: 0,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                createdAt: new Date()
            };
            this.jobs.set(jobId, failedJob);
            this.emit('jobFailed', failedJob);
            throw error;
        }
    }
    /**
     * Cancel a download
     */
    async cancelDownload(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Download job not found: ${jobId}`);
        }
        try {
            if (job.torrentId && this.torrentClient) {
                await this.torrentClient.remove(job.torrentId, false);
            }
            job.status = 'cancelled';
            this.emit('jobCancelled', job);
            logger_1.default.info(`Cancelled download job: ${jobId}`);
            // Process queue to start next job if any
            await this.processQueue();
        }
        catch (error) {
            logger_1.default.error(`Failed to cancel download ${jobId}:`, error);
            throw error;
        }
    }
    /**
     * Pause a download
     */
    async pauseDownload(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.torrentId || !this.torrentClient) {
            throw new Error(`Cannot pause download: ${jobId}`);
        }
        try {
            await this.torrentClient.pause(job.torrentId);
            logger_1.default.info(`Paused download job: ${jobId}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to pause download ${jobId}:`, error);
            throw error;
        }
    }
    /**
     * Resume a download
     */
    async resumeDownload(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.torrentId || !this.torrentClient) {
            throw new Error(`Cannot resume download: ${jobId}`);
        }
        try {
            await this.torrentClient.resume(job.torrentId);
            logger_1.default.info(`Resumed download job: ${jobId}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to resume download ${jobId}:`, error);
            throw error;
        }
    }
    /**
     * Get download job by ID
     */
    getJob(jobId) {
        return this.jobs.get(jobId);
    }
    /**
     * Get all download jobs
     */
    getAllJobs() {
        return Array.from(this.jobs.values());
    }
    /**
     * Get jobs by status
     */
    getJobsByStatus(status) {
        return this.getAllJobs().filter(job => job.status === status);
    }
    /**
     * Get download statistics
     */
    getStats() {
        const jobs = this.getAllJobs();
        const activeJobs = this.getJobsByStatus('downloading');
        return {
            totalJobs: jobs.length,
            activeDownloads: activeJobs.length,
            completedDownloads: this.getJobsByStatus('completed').length,
            failedDownloads: this.getJobsByStatus('failed').length,
            queuedJobs: this.getJobsByStatus('queued').length,
            totalDownloadSpeed: activeJobs.reduce((sum, job) => sum + job.downloadSpeed, 0),
            totalUploadSpeed: activeJobs.reduce((sum, job) => sum + job.uploadSpeed, 0)
        };
    }
    /**
     * Clear completed downloads from memory
     */
    clearCompleted() {
        const completedJobs = this.getJobsByStatus('completed');
        completedJobs.forEach(job => {
            this.jobs.delete(job.id);
        });
        logger_1.default.info(`Cleared ${completedJobs.length} completed download jobs`);
        this.emit('jobsCleared', completedJobs);
    }
    /**
     * Process the download queue
     */
    async processQueue() {
        if (!this.torrentClient) {
            return;
        }
        const activeJobs = this.getJobsByStatus('downloading');
        const queuedJobs = this.getJobsByStatus('queued');
        // Start new downloads if we have slots available
        const availableSlots = this.maxConcurrentDownloads - activeJobs.length;
        const jobsToStart = queuedJobs.slice(0, availableSlots);
        for (const job of jobsToStart) {
            try {
                await this.startDownload(job);
            }
            catch (error) {
                logger_1.default.error(`Failed to start download ${job.id}:`, error);
                job.status = 'failed';
                job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.emit('jobFailed', job);
            }
        }
    }
    /**
     * Start a specific download job
     */
    async startDownload(job) {
        if (!this.torrentClient || !job.torrent) {
            throw new Error('Torrent client or torrent info not available');
        }
        try {
            logger_1.default.info(`Starting download: ${job.id} - ${job.torrent.title}`);
            // Start the torrent
            const torrentId = await this.torrentClient.start(job.torrent.magnet, this.fileOrganizer.getDownloadsPath());
            // Update job status
            job.torrentId = torrentId;
            job.status = 'downloading';
            job.startedAt = new Date();
            this.emit('jobStarted', job);
            // Emit step update for torrent start
            this.emit('jobStepUpdate', { jobId: job.id, step: 'torrent_start', status: 'active' });
        }
        catch (error) {
            logger_1.default.error(`Failed to start download ${job.id}:`, error);
            throw error;
        }
    }
    /**
     * Setup torrent client event listeners
     */
    setupTorrentClientEvents() {
        if (!this.torrentClient) {
            return;
        }
        this.torrentClient.on('progress', ({ torrentId, progress }) => {
            this.updateJobProgress(torrentId, progress);
        });
        this.torrentClient.on('completed', ({ torrentId }) => {
            this.handleTorrentCompleted(torrentId);
        });
        this.torrentClient.on('error', ({ torrentId, error }) => {
            this.handleTorrentError(torrentId, error);
        });
    }
    /**
     * Update job progress from torrent client
     */
    updateJobProgress(torrentId, progress) {
        const job = this.findJobByTorrentId(torrentId);
        if (!job) {
            return;
        }
        job.progress = progress.percentDone;
        job.downloadSpeed = progress.downloadSpeed;
        job.uploadSpeed = progress.uploadSpeed;
        job.eta = progress.eta;
        this.emit('jobProgress', job);
    }
    /**
     * Handle torrent completion
     */
    async handleTorrentCompleted(torrentId) {
        const job = this.findJobByTorrentId(torrentId);
        if (!job) {
            return;
        }
        try {
            logger_1.default.info(`Torrent completed: ${torrentId}, organizing files...`);
            job.status = 'organizing';
            this.emit('jobOrganizing', job);
            // Get torrent info to find download path
            if (!this.torrentClient) {
                throw new Error('Torrent client not available');
            }
            const activeTorrents = await this.torrentClient.listActive();
            const torrent = activeTorrents.find(t => t.id === torrentId);
            if (!torrent) {
                throw new Error(`Torrent not found: ${torrentId}`);
            }
            // Organize files
            const organizedFiles = await this.fileOrganizer.organizeDownload(torrent.downloadPath, job.content, torrent.name);
            // Update job status
            job.status = 'completed';
            job.progress = 1.0;
            job.completedAt = new Date();
            job.organizedFiles = organizedFiles.map(f => f.newPath);
            this.emit('jobCompleted', job);
            // Remove torrent from client (keep files)
            await this.torrentClient.remove(torrentId, false);
            // Process queue for next download
            await this.processQueue();
            logger_1.default.info(`Download completed and organized: ${job.id}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to organize completed download ${job.id}:`, error);
            job.status = 'failed';
            job.errorMessage = error instanceof Error ? error.message : 'Organization failed';
            this.emit('jobFailed', job);
        }
    }
    /**
     * Handle torrent error
     */
    handleTorrentError(torrentId, error) {
        const job = this.findJobByTorrentId(torrentId);
        if (!job) {
            return;
        }
        logger_1.default.error(`Torrent error for job ${job.id}:`, error);
        job.status = 'failed';
        job.errorMessage = error.message;
        this.emit('jobFailed', job);
        // Process queue to start next download
        this.processQueue().catch(err => {
            logger_1.default.error('Failed to process queue after error:', err);
        });
    }
    /**
     * Find job by torrent ID
     */
    findJobByTorrentId(torrentId) {
        return this.getAllJobs().find(job => job.torrentId === torrentId);
    }
    /**
     * Start progress monitoring
     */
    startProgressMonitoring() {
        // Monitor every 5 seconds
        this.progressMonitorInterval = setInterval(async () => {
            if (!this.torrentClient) {
                return;
            }
            try {
                const activeJobs = this.getJobsByStatus('downloading');
                for (const job of activeJobs) {
                    if (job.torrentId) {
                        try {
                            const progress = await this.torrentClient.getProgress(job.torrentId);
                            this.updateJobProgress(job.torrentId, progress);
                            // Check if completed
                            if (progress.percentDone >= 1.0 && progress.status === 'completed') {
                                await this.handleTorrentCompleted(job.torrentId);
                            }
                        }
                        catch (error) {
                            logger_1.default.debug(`Failed to get progress for ${job.torrentId}:`, error);
                        }
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Error in progress monitoring:', error);
            }
        }, 5000);
    }
    /**
     * Generate unique job ID
     */
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.progressMonitorInterval) {
            clearInterval(this.progressMonitorInterval);
        }
        this.removeAllListeners();
        logger_1.default.info('Download manager destroyed');
    }
}
exports.DownloadManager = DownloadManager;
//# sourceMappingURL=download-manager.js.map
