<?php

use Firebase\JWT\JWT;

class AuthController
{
    private $auth_username;
    private $auth_password;
    private $secret_key;

    public function __construct($username, $password)
    {
        $this->auth_username = getenv('CMS_USER');
        $this->auth_password = getenv('CMS_PASSWORD');
        $this->secret_key = getenv('JWT_SECRET');
    }
    public function authenticate($username, $password)
    {

        if ($username === $this->auth_username && $password === $this->auth_password) {
            return true;
        } else {
            return false;
        }
    }
    public function generate_jwt(): string
    {
        $payload = array(
            'iss' => 'Utrechts_Archief',
            'iat' => time(),
            'exp' => strtotime("+1 hour")
        );
        $jwt = JWT::encode($payload, $this->secret_key, 'HS256');
        return $jwt;
    }
}
