"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileOrganizer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger_1 = __importDefault(require("../database/logger"));
class FileOrganizer {
    constructor(customBasePath) {
        this.basePath = customBasePath || path.join(os.homedir(), 'Movies', 'NiluFlix');
        this.ensureDirectories();
    }
    /**
     * Get the base download path
     */
    getBasePath() {
        return this.basePath;
    }
    /**
     * Get download path for movies
     */
    getMoviesPath() {
        return path.join(this.basePath, 'Movies');
    }
    /**
     * Get download path for TV shows
     */
    getTVShowsPath() {
        return path.join(this.basePath, 'TV Shows');
    }
    /**
     * Get download path for temporary downloads
     */
    getDownloadsPath() {
        return path.join(this.basePath, 'Downloads');
    }
    /**
     * Get metadata directory path
     */
    getMetadataPath() {
        return path.join(this.basePath, '.metadata');
    }
    /**
     * Create all necessary directories
     */
    async ensureDirectories() {
        const directories = [
            this.basePath,
            this.getMoviesPath(),
            this.getTVShowsPath(),
            this.getDownloadsPath(),
            this.getMetadataPath()
        ];
        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                logger_1.default.debug(`Ensured directory exists: ${dir}`);
            }
            catch (error) {
                logger_1.default.error(`Failed to create directory ${dir}:`, error);
                throw error;
            }
        }
    }
    /**
     * Get the target path for a movie
     */
    getMoviePath(movie) {
        const sanitizedTitle = this.sanitizeFilename(movie.title);
        const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
        const folderName = year ? `${sanitizedTitle} (${year})` : sanitizedTitle;
        return path.join(this.getMoviesPath(), folderName);
    }
    /**
     * Get the target path for a TV show episode
     */
    getTVShowPath(show, seasonNumber, episodeNumber) {
        const sanitizedName = this.sanitizeFilename(show.name);
        const seasonFolder = `Season ${seasonNumber.toString().padStart(2, '0')}`;
        return path.join(this.getTVShowsPath(), sanitizedName, seasonFolder);
    }
    /**
     * Organize a downloaded torrent into proper directory structure
     */
    async organizeDownload(torrentPath, content, torrentName) {
        try {
            logger_1.default.info(`Organizing download: ${torrentName} for ${content.title}`);
            // Find video files in the torrent directory
            const videoFiles = await this.findVideoFiles(torrentPath);
            if (videoFiles.length === 0) {
                throw new Error(`No video files found in torrent: ${torrentName}`);
            }
            const organizedFiles = [];
            // Determine target directory based on content type
            const targetDir = content.type === 'movie'
                ? this.getMoviePath({ title: content.title, releaseDate: content.year?.toString() })
                : this.getTVShowPath({ name: content.tvShowName || content.title }, content.seasonNumber || 1, content.episodeNumber);
            // Ensure target directory exists
            await fs.mkdir(targetDir, { recursive: true });
            // Organize each video file
            for (const videoFile of videoFiles) {
                const originalPath = path.join(torrentPath, videoFile);
                const stats = await fs.stat(originalPath);
                // Generate appropriate filename
                const newFilename = this.generateFilename(content, videoFile, videoFiles.length > 1);
                const newPath = path.join(targetDir, newFilename);
                // Move file to organized location
                await this.moveFile(originalPath, newPath);
                // Create metadata
                const metadata = {
                    tmdbId: content.tmdbId,
                    title: content.title,
                    type: content.type,
                    year: content.year,
                    seasonNumber: content.seasonNumber,
                    episodeNumber: content.episodeNumber,
                    tvShowName: content.tvShowName,
                    downloadedAt: new Date().toISOString(),
                    fileSize: stats.size,
                    filePath: newPath,
                    originalTorrentName: torrentName
                };
                organizedFiles.push({
                    originalPath,
                    newPath,
                    metadata
                });
            }
            // Create metadata file for the content
            await this.createMetadataFile(targetDir, organizedFiles[0].metadata);
            // Copy subtitles if any exist
            await this.copySubtitles(torrentPath, targetDir);
            // Clean up empty torrent directory if it's different from target
            if (torrentPath !== targetDir) {
                await this.cleanupTorrentDirectory(torrentPath);
            }
            logger_1.default.info(`Successfully organized ${organizedFiles.length} files to ${targetDir}`);
            return organizedFiles;
        }
        catch (error) {
            logger_1.default.error(`Failed to organize download ${torrentName}:`, error);
            throw error;
        }
    }
    /**
     * Find video files in a directory
     */
    async findVideoFiles(dirPath) {
        const videoExtensions = ['.mkv', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
        const videoFiles = [];
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            for (const item of items) {
                if (item.isFile()) {
                    const ext = path.extname(item.name).toLowerCase();
                    if (videoExtensions.includes(ext)) {
                        videoFiles.push(item.name);
                    }
                }
                else if (item.isDirectory()) {
                    // Recursively search subdirectories
                    const subVideoFiles = await this.findVideoFiles(path.join(dirPath, item.name));
                    videoFiles.push(...subVideoFiles.map(file => path.join(item.name, file)));
                }
            }
        }
        catch (error) {
            logger_1.default.error(`Error reading directory ${dirPath}:`, error);
            throw error;
        }
        // Sort by file size (largest first) to prioritize main video files
        const filesWithStats = await Promise.all(videoFiles.map(async (file) => {
            const fullPath = path.join(dirPath, file);
            const stats = await fs.stat(fullPath);
            return { file, size: stats.size };
        }));
        return filesWithStats
            .sort((a, b) => b.size - a.size)
            .map(item => item.file);
    }
    /**
     * Generate appropriate filename for organized content
     */
    generateFilename(content, originalFilename, isMultiFile) {
        const ext = path.extname(originalFilename);
        if (content.type === 'movie') {
            const sanitizedTitle = this.sanitizeFilename(content.title);
            const year = content.year || '';
            if (isMultiFile) {
                // For multi-file movies, preserve some of the original name
                const baseName = this.sanitizeFilename(path.basename(originalFilename, ext));
                return year ? `${sanitizedTitle} (${year}) - ${baseName}${ext}` : `${sanitizedTitle} - ${baseName}${ext}`;
            }
            else {
                return year ? `${sanitizedTitle} (${year})${ext}` : `${sanitizedTitle}${ext}`;
            }
        }
        else {
            // TV Show episode
            const showName = this.sanitizeFilename(content.tvShowName || content.title);
            const season = (content.seasonNumber || 1).toString().padStart(2, '0');
            const episode = (content.episodeNumber || 1).toString().padStart(2, '0');
            return `${showName} S${season}E${episode}${ext}`;
        }
    }
    /**
     * Sanitize filename to remove invalid characters
     */
    sanitizeFilename(filename) {
        // Remove or replace invalid filename characters
        return filename
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .substring(0, 200); // Limit length to prevent filesystem issues
    }
    /**
     * Move file from source to destination
     */
    async moveFile(sourcePath, destPath) {
        try {
            // Ensure destination directory exists
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            // Check if destination already exists
            try {
                await fs.access(destPath);
                logger_1.default.warn(`Destination file already exists: ${destPath}`);
                // Generate unique filename
                const ext = path.extname(destPath);
                const base = path.basename(destPath, ext);
                const dir = path.dirname(destPath);
                let counter = 1;
                while (true) {
                    const newPath = path.join(dir, `${base} (${counter})${ext}`);
                    try {
                        await fs.access(newPath);
                        counter++;
                    }
                    catch {
                        destPath = newPath;
                        break;
                    }
                }
            }
            catch {
                // File doesn't exist, which is what we want
            }
            // Move the file
            await fs.rename(sourcePath, destPath);
            logger_1.default.info(`Moved file: ${sourcePath} -> ${destPath}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to move file ${sourcePath} to ${destPath}:`, error);
            throw error;
        }
    }
    /**
     * Copy subtitle files to target directory
     */
    async copySubtitles(sourcePath, targetDir) {
        const subtitleExtensions = ['.srt', '.sub', '.ass', '.ssa', '.vtt'];
        try {
            const items = await fs.readdir(sourcePath, { withFileTypes: true });
            for (const item of items) {
                if (item.isFile()) {
                    const ext = path.extname(item.name).toLowerCase();
                    if (subtitleExtensions.includes(ext)) {
                        const sourceFile = path.join(sourcePath, item.name);
                        const targetFile = path.join(targetDir, item.name);
                        try {
                            await fs.copyFile(sourceFile, targetFile);
                            logger_1.default.info(`Copied subtitle: ${item.name}`);
                        }
                        catch (error) {
                            logger_1.default.warn(`Failed to copy subtitle ${item.name}:`, error);
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.default.debug(`No subtitles found in ${sourcePath}:`, error);
        }
    }
    /**
     * Create metadata file for organized content
     */
    async createMetadataFile(targetDir, metadata) {
        const metadataPath = path.join(targetDir, 'metadata.json');
        try {
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            logger_1.default.debug(`Created metadata file: ${metadataPath}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to create metadata file ${metadataPath}:`, error);
        }
    }
    /**
     * Clean up empty torrent directory after organizing
     */
    async cleanupTorrentDirectory(torrentPath) {
        try {
            const items = await fs.readdir(torrentPath);
            if (items.length === 0) {
                await fs.rmdir(torrentPath);
                logger_1.default.info(`Cleaned up empty torrent directory: ${torrentPath}`);
            }
            else {
                logger_1.default.debug(`Torrent directory not empty, keeping: ${torrentPath}`);
            }
        }
        catch (error) {
            logger_1.default.debug(`Failed to cleanup torrent directory ${torrentPath}:`, error);
        }
    }
    /**
     * Get file size in bytes
     */
    async getFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        }
        catch {
            return 0;
        }
    }
    /**
     * Check if a file is a video file based on extension
     */
    isVideoFile(filename) {
        const videoExtensions = ['.mkv', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
        const ext = path.extname(filename).toLowerCase();
        return videoExtensions.includes(ext);
    }
    /**
     * Get human-readable file size
     */
    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}
exports.FileOrganizer = FileOrganizer;
//# sourceMappingURL=file-organizer.js.map