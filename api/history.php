<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('GET');
$userId = require_user(); // l'historique est celui de la session, jamais d'un identifiant passé en paramètre

$stmt = db()->prepare(
    'SELECT g.id AS game_id, g.name AS game_name, gs.score, gs.time_remaining, gs.hints_used, gs.played_at
     FROM game_sessions gs
     JOIN games g ON g.id = gs.game_id
     WHERE gs.user_id = :user
     ORDER BY gs.played_at DESC, gs.id DESC
     LIMIT 50'
);
$stmt->execute([':user' => $userId]);
json_response(200, ['history' => array_map(fn (array $row) => [
    'game_id' => (int) $row['game_id'],
    'game_name' => $row['game_name'],
    'score' => (int) $row['score'],
    'time_remaining' => (int) $row['time_remaining'],
    'hints_used' => (int) $row['hints_used'],
    'played_at' => $row['played_at'],
], $stmt->fetchAll())]);
