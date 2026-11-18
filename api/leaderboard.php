<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('GET');
$gameId = filter_input(INPUT_GET, 'game_id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$gameId) {
    fail(400, 'Paramètre « game_id » invalide.');
}

// Meilleure partie de chaque joueur (score, puis temps restant), dix premiers joueurs.
$stmt = db()->prepare(
    'SELECT u.username, gs.score, gs.time_remaining, gs.hints_used, gs.played_at
     FROM game_sessions gs
     JOIN users u ON u.id = gs.user_id
     WHERE gs.game_id = :game AND gs.completed = 1
       AND gs.id = (
         SELECT best.id FROM game_sessions best
         WHERE best.user_id = gs.user_id AND best.game_id = gs.game_id AND best.completed = 1
         ORDER BY best.score DESC, best.time_remaining DESC, best.id ASC
         LIMIT 1
       )
     ORDER BY gs.score DESC, gs.time_remaining DESC, gs.played_at ASC
     LIMIT 10'
);
$stmt->execute([':game' => $gameId]);
json_response(200, ['leaderboard' => array_map(fn (array $row) => [
    'username' => $row['username'],
    'score' => (int) $row['score'],
    'time_remaining' => (int) $row['time_remaining'],
    'hints_used' => (int) $row['hints_used'],
    'played_at' => $row['played_at'],
], $stmt->fetchAll())]);
