-- ─────────────────────────────────────────────────────────
--  Smart Study Planner — Database Initialisation
--  This file runs automatically when the MySQL container
--  starts for the first time (mounted as /docker-entrypoint-initdb.d/)
-- ─────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS smart_study_planner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_study_planner;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Tasks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT              NOT NULL,
    title       VARCHAR(200)     NOT NULL,
    deadline    DATE             NOT NULL,
    importance  TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=Low 2=Medium 3=High',
    difficulty  TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=Easy 2=Medium 3=Hard',
    status      ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

-- ── Push Subscriptions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT       NOT NULL,
    subscription LONGTEXT  NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_push_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_user_id     ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline    ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_push_user_id      ON push_subscriptions(user_id);