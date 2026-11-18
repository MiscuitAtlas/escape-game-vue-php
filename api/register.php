<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
$data = read_json();

$username = string_field($data, 'username');
$email = mb_strtolower(string_field($data, 'email'));
$password = is_string($data['password'] ?? null) ? $data['password'] : '';

if (!preg_match('/^[\p{L}\p{N}_.-]{3,30}$/u', $username)) {
    fail(422, "Le nom d'utilisateur doit faire de 3 à 30 caractères : lettres, chiffres, « _ », « . » ou « - ».");
}
if (strlen($email) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'Adresse email invalide.');
}
validate_password($password);

try {
    $stmt = db()->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :hash)');
    $stmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') { // contrainte d'unicité
        fail(409, "Ce nom d'utilisateur ou cette adresse email est déjà utilisé.");
    }
    throw $e;
}

$user = ['id' => (int) db()->lastInsertId(), 'username' => $username, 'email' => $email];
log_in($user);
json_response(201, ['user' => public_user($user)]);
