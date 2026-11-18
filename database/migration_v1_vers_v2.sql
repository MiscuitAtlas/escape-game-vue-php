-- Mise à jour d'une base créée avec la première version du projet (colonne « PASSWORD »).
-- Les mots de passe existants restent valides : ils étaient déjà hachés avec password_hash().

ALTER TABLE users
    CHANGE PASSWORD password_hash VARCHAR(255) NOT NULL,
    MODIFY username VARCHAR(30) NOT NULL;

ALTER TABLE game_sessions
    ADD KEY idx_sessions_leaderboard (game_id, completed, score),
    ADD KEY idx_sessions_user (user_id, played_at);

UPDATE games SET description = 'Résoudre quatre énigmes pour ouvrir la porte secrète.' WHERE id = 1;
UPDATE games SET description = 'Retrouver les bons ingrédients et préparer la potion dans le bon ordre.' WHERE id = 2;
UPDATE games SET description = 'Utiliser chaque objet au bon endroit pour redémarrer le vaisseau.' WHERE id = 3;
