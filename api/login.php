<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
$data = read_json();

$email = mb_strtolower(string_field($data, 'email'));
$password = is_string($data['password'] ?? null) ? $data['password'] : '';

$stmt = db()->prepare('SELECT id, username, email, password_hash FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

// Même message, et même temps de calcul, que l'email soit inconnu ou le mot de passe faux :
// on ne révèle pas quels comptes existent.
$hash = $user['password_hash'] ?? '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';
if (!password_verify($password, $hash) || !$user) {
    fail(401, 'Email ou mot de passe incorrect.');
}

if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
    db()->prepare('UPDATE users SET password_hash = :hash WHERE id = :id')
        ->execute([':hash' => password_hash($password, PASSWORD_DEFAULT), ':id' => $user['id']]);
}
db()->prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $user['id']]);

log_in($user);
json_response(200, ['user' => public_user($user)]);
