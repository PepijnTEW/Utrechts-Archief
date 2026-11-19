<?php

$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASSWORD');
$dbRootPass = getenv('DB_ROOT_PASSWORD');
$dbHost = getenv('DB_HOST') ?: 'localhost'; // fallback if DB_HOST is not set

// Create connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}