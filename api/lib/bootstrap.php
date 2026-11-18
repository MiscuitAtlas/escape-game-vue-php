<?php

declare(strict_types=1);

/*
 * Socle commun à tous les points d'entrée de l'API : configuration, base de données,
 * session, réponses JSON et gestion des erreurs.
 */

const GAME_DURATION = 180;      // durée d'une partie, en secondes
const POINTS_PER_SECOND = 10;
const HINT_PENALTY = 100;
const MAX_HINTS = 4;

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

set_exception_handler(function (Throwable $e): void {
    // Le détail reste dans le journal du serveur ; le client ne reçoit qu'un message générique.
    error_log('[escape-game] ' . $e);
    if (!headers_sent()) {
        json_response(500, ['error' => 'Erreur interne du serveur.']);
    }
});

/**
 * Configuration lue dans les variables d'environnement, sinon dans api/config.php
 * (fichier non versionné, à créer à partir de config.example.php).
 */
function config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $file = __DIR__ . '/../config.php';
    $local = is_file($file) ? require $file : [];
    $get = fn (string $env, string $key, $default = null) => getenv($env) !== false ? getenv($env) : ($local[$key] ?? $default);

    $config = [
        'dsn' => $get('DB_DSN', 'dsn'),
        'host' => $get('DB_HOST', 'host', 'localhost'),
        'port' => (int) $get('DB_PORT', 'port', 3306),
        'name' => $get('DB_NAME', 'name', 'escape_game'),
        'user' => $get('DB_USER', 'user', 'root'),
        'password' => $get('DB_PASSWORD', 'password', ''),
    ];
    return $config;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config();
        $dsn = $c['dsn'] ?: sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['host'], $c['port'], $c['name']);
        $pdo = new PDO($dsn, $c['user'], $c['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

function json_response(int $status, array $data): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $message): void
{
    json_response($status, ['error' => $message]);
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        fail(405, 'Méthode non autorisée.');
    }
}

/**
 * Corps JSON de la requête. Le type de contenu est vérifié : un formulaire HTML envoyé depuis un autre
 * site ne peut pas produire une requête « application/json » sans autorisation CORS.
 */
function read_json(): array
{
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== 0) {
        fail(415, 'Le corps de la requête doit être au format JSON.');
    }
    $data = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($data)) {
        fail(400, 'Requête JSON invalide.');
    }
    return $data;
}

function string_field(array $data, string $key): string
{
    $value = $data[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

function int_field(array $data, string $key, int $min, int $max): int
{
    $value = $data[$key] ?? null;
    if (!is_int($value) || $value < $min || $value > $max) {
        fail(400, "Valeur invalide pour « $key ».");
    }
    return $value;
}

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = ($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off';
    session_name('escape_game_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function current_user_id(): ?int
{
    start_session();
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

function require_user(): int
{
    $id = current_user_id();
    if ($id === null) {
        fail(401, 'Connectez-vous pour continuer.');
    }
    return $id;
}

function log_in(array $user): void
{
    start_session();
    session_regenerate_id(true); // nouvel identifiant de session : pas de fixation de session
    $_SESSION['user_id'] = (int) $user['id'];
}

function public_user(array $user): array
{
    return ['id' => (int) $user['id'], 'username' => $user['username'], 'email' => $user['email']];
}

function find_user(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, username, email FROM users WHERE id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
}

/** Même formule que le front : 10 points par seconde restante, 100 points retirés par indice. */
function compute_score(int $timeRemaining, int $hintsUsed): int
{
    return max(0, $timeRemaining * POINTS_PER_SECOND - $hintsUsed * HINT_PENALTY);
}

function validate_password(string $password): void
{
    $length = mb_strlen($password);
    if ($length < 8) {
        fail(422, 'Le mot de passe doit contenir au moins 8 caractères.');
    }
    if (strlen($password) > 72) { // limite de bcrypt
        fail(422, 'Le mot de passe est trop long (72 octets maximum).');
    }
}
