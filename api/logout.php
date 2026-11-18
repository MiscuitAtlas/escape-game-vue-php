<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
start_session();
$_SESSION = [];
$params = session_get_cookie_params();
setcookie(session_name(), '', [
    'expires' => time() - 3600,
    'path' => $params['path'],
    'secure' => $params['secure'],
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_destroy();
json_response(200, ['user' => null]);
