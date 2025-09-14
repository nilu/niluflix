"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorrentClientDetector = exports.QBittorrentClient = exports.TransmissionClient = exports.TorrentClient = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const node_fetch_1 = __importDefault(require("node-fetch"));
const events_1 = require("events");
const logger_1 = __importDefault(require("../database/logger"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Abstract base class for torrent clients
 */
class TorrentClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
    }
    emitProgress(torrentId, progress) {
        this.emit('progress', { torrentId, progress });
    }
    emitCompleted(torrentId) {
        this.emit('completed', { torrentId });
    }
    emitError(torrentId, error) {
        this.emit('error', { torrentId, error });
    }
}
exports.TorrentClient = TorrentClient;
/**
 * Transmission torrent client implementation
 */
class TransmissionClient extends TorrentClient {
    constructor(config) {
        super(config);
        this.baseUrl = `http://${config.host}:${config.port}/transmission/rpc`;
    }
    async isConnected() {
        try {
            await this.rpcCall('session-get', {});
            return true;
        }
        catch (error) {
            logger_1.default.error('Transmission connection failed:', error);
            return false;
        }
    }
    async start(magnetLink, downloadPath) {
        const params = {
            filename: magnetLink,
        };
        if (downloadPath) {
            params['download-dir'] = downloadPath;
        }
        else {
            params['download-dir'] = this.config.downloadPath;
        }
        const response = await this.rpcCall('torrent-add', params);
        if (response.arguments['torrent-added']) {
            const torrentId = response.arguments['torrent-added'].id.toString();
            logger_1.default.info(`Started torrent download: ${torrentId}`);
            return torrentId;
        }
        else if (response.arguments['torrent-duplicate']) {
            const torrentId = response.arguments['torrent-duplicate'].id.toString();
            logger_1.default.info(`Torrent already exists: ${torrentId}`);
            return torrentId;
        }
        throw new Error('Failed to add torrent');
    }
    async pause(torrentId) {
        await this.rpcCall('torrent-stop', { ids: [parseInt(torrentId)] });
        logger_1.default.info(`Paused torrent: ${torrentId}`);
    }
    async resume(torrentId) {
        await this.rpcCall('torrent-start', { ids: [parseInt(torrentId)] });
        logger_1.default.info(`Resumed torrent: ${torrentId}`);
    }
    async remove(torrentId, deleteFiles = false) {
        await this.rpcCall('torrent-remove', {
            ids: [parseInt(torrentId)],
            'delete-local-data': deleteFiles
        });
        logger_1.default.info(`Removed torrent: ${torrentId}, deleteFiles: ${deleteFiles}`);
    }
    async getProgress(torrentId) {
        const response = await this.rpcCall('torrent-get', {
            ids: [parseInt(torrentId)],
            fields: [
                'id', 'name', 'percentDone', 'rateDownload', 'rateUpload',
                'eta', 'status', 'downloadedEver', 'totalSize',
                'peersSendingToUs', 'peersGettingFromUs'
            ]
        });
        const torrent = response.arguments.torrents[0];
        if (!torrent) {
            throw new Error(`Torrent not found: ${torrentId}`);
        }
        return {
            id: torrent.id.toString(),
            name: torrent.name,
            percentDone: torrent.percentDone,
            downloadSpeed: torrent.rateDownload,
            uploadSpeed: torrent.rateUpload,
            eta: torrent.eta,
            status: this.mapTransmissionStatus(torrent.status),
            downloadedBytes: torrent.downloadedEver,
            totalBytes: torrent.totalSize,
            seeders: torrent.peersSendingToUs,
            leechers: torrent.peersGettingFromUs
        };
    }
    async listActive() {
        const response = await this.rpcCall('torrent-get', {
            fields: ['id', 'name', 'magnetLink', 'status', 'percentDone', 'downloadDir']
        });
        return response.arguments.torrents.map((torrent) => ({
            id: torrent.id.toString(),
            name: torrent.name,
            magnetLink: torrent.magnetLink || '',
            status: this.mapTransmissionStatus(torrent.status),
            progress: torrent.percentDone,
            downloadPath: torrent.downloadDir
        }));
    }
    mapTransmissionStatus(status) {
        switch (status) {
            case 0: return 'paused'; // TR_STATUS_STOPPED
            case 1: return 'downloading'; // TR_STATUS_CHECK_WAIT
            case 2: return 'downloading'; // TR_STATUS_CHECK
            case 3: return 'downloading'; // TR_STATUS_DOWNLOAD_WAIT
            case 4: return 'downloading'; // TR_STATUS_DOWNLOAD
            case 5: return 'seeding'; // TR_STATUS_SEED_WAIT
            case 6: return 'seeding'; // TR_STATUS_SEED
            default: return 'error';
        }
    }
    async rpcCall(method, arguments_) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.sessionId) {
            headers['X-Transmission-Session-Id'] = this.sessionId;
        }
        if (this.config.username && this.config.password) {
            const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }
        const response = await (0, node_fetch_1.default)(this.baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                method,
                arguments: arguments_
            })
        });
        // Handle session ID requirement
        if (response.status === 409) {
            const sessionId = response.headers.get('X-Transmission-Session-Id');
            if (sessionId) {
                this.sessionId = sessionId;
                return this.rpcCall(method, arguments_);
            }
        }
        if (!response.ok) {
            throw new Error(`Transmission RPC error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.result !== 'success') {
            throw new Error(`Transmission RPC error: ${data.result}`);
        }
        return data;
    }
}
exports.TransmissionClient = TransmissionClient;
/**
 * qBittorrent torrent client implementation
 */
class QBittorrentClient extends TorrentClient {
    constructor(config) {
        super(config);
        this.baseUrl = `http://${config.host}:${config.port}`;
    }
    async isConnected() {
        try {
            await this.ensureAuthenticated();
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/app/version`, {
                headers: this.getHeaders()
            });
            return response.ok;
        }
        catch (error) {
            logger_1.default.error('qBittorrent connection failed:', error);
            return false;
        }
    }
    async start(magnetLink, downloadPath) {
        await this.ensureAuthenticated();
        const formData = new URLSearchParams();
        formData.append('urls', magnetLink);
        if (downloadPath) {
            formData.append('savepath', downloadPath);
        }
        else {
            formData.append('savepath', this.config.downloadPath);
        }
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/torrents/add`, {
            method: 'POST',
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to add torrent: ${response.statusText}`);
        }
        // qBittorrent doesn't return the hash directly, we need to find it
        const hash = this.extractHashFromMagnet(magnetLink);
        logger_1.default.info(`Started torrent download: ${hash}`);
        return hash;
    }
    async pause(torrentId) {
        await this.ensureAuthenticated();
        const formData = new URLSearchParams();
        formData.append('hashes', torrentId);
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/torrents/pause`, {
            method: 'POST',
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to pause torrent: ${response.statusText}`);
        }
        logger_1.default.info(`Paused torrent: ${torrentId}`);
    }
    async resume(torrentId) {
        await this.ensureAuthenticated();
        const formData = new URLSearchParams();
        formData.append('hashes', torrentId);
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/torrents/resume`, {
            method: 'POST',
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to resume torrent: ${response.statusText}`);
        }
        logger_1.default.info(`Resumed torrent: ${torrentId}`);
    }
    async remove(torrentId, deleteFiles = false) {
        await this.ensureAuthenticated();
        const formData = new URLSearchParams();
        formData.append('hashes', torrentId);
        formData.append('deleteFiles', deleteFiles.toString());
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/torrents/delete`, {
            method: 'POST',
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to remove torrent: ${response.statusText}`);
        }
        logger_1.default.info(`Removed torrent: ${torrentId}, deleteFiles: ${deleteFiles}`);
    }
    async getProgress(torrentId) {
        await this.ensureAuthenticated();
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/torrents/info?hashes=${torrentId}`, {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to get torrent info: ${response.statusText}`);
        }
        const torrents = await response.json();
        const torrent = torrents[0];
        if (!torrent) {
            throw new Error(`Torrent not found: ${torrentId}`);
        }
        return {
            id: torrent.hash,
            name: torrent.name,
            percentDone: torrent.progress,
            downloadSpeed: torrent.dlspeed,
            uploadSpeed: torrent.upspeed,
            eta: torrent.eta,
            status: this.mapQBittorrentStatus(torrent.state),
            downloadedBytes: torrent.downloaded,
            totalBytes: torrent.size,
            seeders: torrent.num_seeds,
            leechers: torrent.num_leechs
        };
    }
    async listActive() {
        await this.ensureAuthenticated();
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/torrents/info`, {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to get torrents list: ${response.statusText}`);
        }
        const torrents = await response.json();
        return torrents.map((torrent) => ({
            id: torrent.hash,
            name: torrent.name,
            magnetLink: torrent.magnet_uri || '',
            status: this.mapQBittorrentStatus(torrent.state),
            progress: torrent.progress,
            downloadPath: torrent.save_path
        }));
    }
    mapQBittorrentStatus(state) {
        switch (state) {
            case 'downloading':
            case 'metaDL':
            case 'allocating':
                return 'downloading';
            case 'uploading':
            case 'stalledUP':
                return 'seeding';
            case 'pausedDL':
            case 'pausedUP':
                return 'paused';
            case 'error':
            case 'missingFiles':
                return 'error';
            case 'queuedDL':
            case 'queuedUP':
            case 'stalledDL':
                return 'downloading';
            default:
                return 'downloading';
        }
    }
    async ensureAuthenticated() {
        if (this.cookie) {
            return;
        }
        if (!this.config.username || !this.config.password) {
            throw new Error('qBittorrent requires username and password');
        }
        const formData = new URLSearchParams();
        formData.append('username', this.config.username);
        formData.append('password', this.config.password);
        const response = await (0, node_fetch_1.default)(`${this.baseUrl}/api/v2/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error('qBittorrent authentication failed');
        }
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            this.cookie = setCookie.split(';')[0];
        }
    }
    getHeaders() {
        const headers = {};
        if (this.cookie) {
            headers['Cookie'] = this.cookie;
        }
        return headers;
    }
    extractHashFromMagnet(magnetLink) {
        const match = magnetLink.match(/urn:btih:([a-fA-F0-9]{40})/);
        if (match) {
            return match[1].toLowerCase();
        }
        // Try to extract from xt parameter
        const xtMatch = magnetLink.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
        if (xtMatch) {
            return xtMatch[1].toLowerCase();
        }
        throw new Error('Could not extract hash from magnet link');
    }
}
exports.QBittorrentClient = QBittorrentClient;
/**
 * Auto-detect and create appropriate torrent client
 */
class TorrentClientDetector {
    static async detectAndCreate(downloadPath) {
        // Try to detect running clients
        const detectedClients = await this.detectRunningClients();
        if (detectedClients.length === 0) {
            // Try to auto-install Transmission as it's more lightweight
            await this.installTransmission();
            // Retry detection after installation
            const retryClients = await this.detectRunningClients();
            if (retryClients.length === 0) {
                throw new Error('No torrent client found and auto-installation failed');
            }
            return this.createClient(retryClients[0], downloadPath);
        }
        // Use the first detected client
        return this.createClient(detectedClients[0], downloadPath);
    }
    static async detectRunningClients() {
        const clients = [];
        // Check for Transmission
        try {
            const transmissionClient = new TransmissionClient({
                type: 'transmission',
                host: 'localhost',
                port: this.DEFAULT_PORTS.transmission,
                downloadPath: ''
            });
            if (await transmissionClient.isConnected()) {
                clients.push({ type: 'transmission', port: this.DEFAULT_PORTS.transmission });
                logger_1.default.info('Detected running Transmission client');
            }
        }
        catch (error) {
            logger_1.default.debug('Transmission not detected:', error);
        }
        // Check for qBittorrent
        try {
            const qbClient = new QBittorrentClient({
                type: 'qbittorrent',
                host: 'localhost',
                port: this.DEFAULT_PORTS.qbittorrent,
                username: 'admin',
                password: 'adminadmin',
                downloadPath: ''
            });
            if (await qbClient.isConnected()) {
                clients.push({ type: 'qbittorrent', port: this.DEFAULT_PORTS.qbittorrent });
                logger_1.default.info('Detected running qBittorrent client');
            }
        }
        catch (error) {
            logger_1.default.debug('qBittorrent not detected:', error);
        }
        return clients;
    }
    static createClient(clientInfo, downloadPath) {
        const config = {
            type: clientInfo.type,
            host: 'localhost',
            port: clientInfo.port,
            downloadPath
        };
        if (clientInfo.type === 'transmission') {
            return new TransmissionClient(config);
        }
        else {
            config.username = 'admin';
            config.password = 'adminadmin';
            return new QBittorrentClient(config);
        }
    }
    static async installTransmission() {
        try {
            logger_1.default.info('Installing Transmission via Homebrew...');
            // Check if Homebrew is installed
            try {
                await execAsync('which brew');
            }
            catch (error) {
                throw new Error('Homebrew is required but not installed. Please install Homebrew first.');
            }
            // Install Transmission
            await execAsync('brew install transmission');
            // Start Transmission daemon
            await execAsync('brew services start transmission');
            // Wait a bit for the service to start
            await new Promise(resolve => setTimeout(resolve, 3000));
            logger_1.default.info('Transmission installed and started successfully');
        }
        catch (error) {
            logger_1.default.error('Failed to install Transmission:', error);
            throw new Error('Failed to auto-install Transmission. Please install it manually.');
        }
    }
}
exports.TorrentClientDetector = TorrentClientDetector;
TorrentClientDetector.DEFAULT_PORTS = {
    transmission: 9091,
    qbittorrent: 8080
};
//# sourceMappingURL=torrent-client.js.map