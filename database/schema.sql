-- Base de données de l'escape game (MySQL 5.7+ ou MariaDB 10.3+).
-- Créez d'abord la base, par exemple :
--   CREATE DATABASE escape_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- puis importez ce fichier dans cette base.

SET NAMES utf8mb4;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE games (
    id INT UNSIGNED PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE game_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    game_id INT UNSIGNED NOT NULL,
    score INT NOT NULL,
    time_remaining SMALLINT UNSIGNED NOT NULL,
    hints_used TINYINT UNSIGNED NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_sessions_leaderboard (game_id, completed, score),
    KEY idx_sessions_user (user_id, played_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_game FOREIGN KEY (game_id) REFERENCES games (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO games (id, name, description) VALUES
    (1, 'La Bibliothèque Mystérieuse', 'Résoudre quatre énigmes pour ouvrir la porte secrète.'),
    (2, 'Le Laboratoire Abandonné', 'Retrouver les bons ingrédients et préparer la potion dans le bon ordre.'),
    (3, 'Le Vaisseau Perdu', 'Utiliser chaque objet au bon endroit pour redémarrer le vaisseau.');
