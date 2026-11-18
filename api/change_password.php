<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
$userId = require_user();
$data = read_json();

$current = is_string($data['current_password'] ?? null) ? $data['current_password'] : '';
$new = is_string($data['new_password'] ?? null) ? $data['new_password'] : '';

$stmt = db()->prepare('SELECT password_hash FROM users WHERE id = :id');
$stmt->execute([':id' => $userId]);
$hash = $stmt->fetchColumn();
if (!$hash || !password_verify($current, $hash)) {
    fail(403, 'Mot de passe actuel incorrect.');
}
validate_password($new);

db()->prepare('UPDATE users SET password_hash = :hash WHERE id = :id')
    ->execute([':hash' => password_hash($new, PASSWORD_DEFAULT), ':id' => $userId]);
session_regenerate_id(true);
json_response(200, ['message' => 'Mot de passe modifié.']);
