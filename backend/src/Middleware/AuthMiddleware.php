<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    public static function check_auth(): void
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if ($authHeader === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0 && is_string($value)) {
                    $authHeader = $value;
                    break;
                }
            }
        }

        if (!preg_match('/^Bearer\s+(\S+)$/i', trim($authHeader), $matches)) {
            self::respond(401, 'Missing or invalid bearer token');
        }

        $secret = getenv('JWT_SECRET');
        if (!is_string($secret) || strlen($secret) < 32) {
            self::respond(500, 'JWT authentication is not configured');
        }

        try {
            $payload = JWT::decode($matches[1], new Key($secret, 'HS256'));
        } catch (\UnexpectedValueException | \DomainException | \InvalidArgumentException $exception) {
            self::respond(401, 'Invalid or expired token');
        }

        if (!isset($payload->iss) || $payload->iss !== 'Utrechts_Archief') {
            self::respond(401, 'Invalid token issuer');
        }
    }

    private static function respond(int $status, string $message): never
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode(['error' => $message]);
        exit;
    }
}
