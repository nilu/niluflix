-- CreateTable
CREATE TABLE "movies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tmdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "release_date" TEXT,
    "runtime" INTEGER,
    "vote_average" REAL,
    "genres" TEXT,
    "download_status" TEXT NOT NULL DEFAULT 'not_downloaded',
    "file_path" TEXT,
    "file_size" INTEGER,
    "download_progress" REAL NOT NULL DEFAULT 0,
    "magnet_link" TEXT,
    "torrent_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tv_shows" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tmdb_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "first_air_date" TEXT,
    "last_air_date" TEXT,
    "number_of_seasons" INTEGER,
    "number_of_episodes" INTEGER,
    "vote_average" REAL,
    "genres" TEXT,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "episodes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tv_show_id" INTEGER NOT NULL,
    "tmdb_episode_id" INTEGER,
    "season_number" INTEGER NOT NULL,
    "episode_number" INTEGER NOT NULL,
    "name" TEXT,
    "overview" TEXT,
    "air_date" TEXT,
    "runtime" INTEGER,
    "vote_average" REAL,
    "download_status" TEXT NOT NULL DEFAULT 'not_downloaded',
    "file_path" TEXT,
    "file_size" INTEGER,
    "download_progress" REAL NOT NULL DEFAULT 0,
    "magnet_link" TEXT,
    "torrent_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "episodes_tv_show_id_fkey" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "download_queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content_type" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "torrent_magnet" TEXT NOT NULL,
    "torrent_name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" REAL NOT NULL DEFAULT 0,
    "download_speed" INTEGER NOT NULL DEFAULT 0,
    "eta" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" DATETIME,
    "completed_at" DATETIME
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "download_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content_type" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "file_size" INTEGER,
    "download_time" INTEGER,
    "quality" TEXT,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "tv_shows_tmdb_id_key" ON "tv_shows"("tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_tv_show_id_season_number_episode_number_key" ON "episodes"("tv_show_id", "season_number", "episode_number");
