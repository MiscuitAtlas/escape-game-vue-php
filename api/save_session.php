<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
$userId = require_user(); // le joueur est celui de la session, pas un identifiant envoyé par le navigateur
$data = read_json();

$gameId = int_field($data, 'game_id', 1, PHP_INT_MAX);
$timeRemaining = int_field($data, 'time_remaining', 0, GAME_DURATION);
$hintsUsed = int_field($data, 'hints_used', 0, MAX_HINTS);

$exists = db()->prepare('SELECT 1 FROM games WHERE id = :id');
$exists->execute([':id' => $gameId]);
if (!$exists->fetchColumn()) {
    fail(404, 'Jeu inconnu.');
}

// Le score est recalculé ici : un score envoyé par le navigateur serait ignoré.
$score = compute_score($timeRemaining, $hintsUsed);
db()->prepare(
    'INSERT INTO game_sessions (user_id, game_id, score, time_remaining, hints_used, completed)
     VALUES (:user, :game, :score, :time, :hints, 1)'
)->execute([':user' => $userId, ':game' => $gameId, ':score' => $score, ':time' => $timeRemaining, ':hints' => $hintsUsed]);

json_response(201, ['score' => $score]);
