<?php

// Copier ce fichier en api/config.php et renseigner les accès à la base de données.
// api/config.php n'est pas versionné : il ne doit jamais être publié.
// Les variables d'environnement DB_HOST, DB_PORT, DB_NAME, DB_USER et DB_PASSWORD sont prioritaires.

return [
    'host' => 'localhost',
    'port' => 3306,
    'name' => 'escape_game',
    'user' => 'root',
    'password' => '',
];
