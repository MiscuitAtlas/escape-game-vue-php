<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

require_method('GET');
$id = current_user_id();
$user = $id !== null ? find_user($id) : null;
json_response(200, ['user' => $user ? public_user($user) : null]);
