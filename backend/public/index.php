<?php
require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/../src/Config/database.php';

require_once __DIR__ . '/../src/Controllers/AuthController.php';

use App\Models\InfoPoint;
use App\Controllers\InfoPointController;

$infoPointModel = new InfoPoint($conn);
$infoPointController = new InfoPointController($infoPointModel);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

//login path

if ($method === 'POST' && $path === '/login') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    // $username = $data['username'] ?? '';
    // $password = $data['password'] ?? '';
    $username = 'Admin';
    $password = 'rYcQ13uhELhNMdP0uTu7';

    $authController = new AuthController($username, $password);

    if ($authController->authenticate($username, $password)) {
        $authController->generate_jwt();
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}
//info-points path
if ($method === 'GET' && $path === '/info-points') {
    $infoPointController->index();
} elseif ($method === 'GET' && preg_match('#^/info-points/([0-9]+)$#', $path, $matches)) {
    $infoPointController->show((int) $matches[1]);
} elseif ($method === 'POST' && $path === '/info-points') {
    $infoPointController->store();
} elseif ($method === 'PUT' && preg_match('#^/info-points/([0-9]+)$#', $path, $matches)) {
    $infoPointController->update((int) $matches[1]);
} elseif ($method === 'DELETE' && preg_match('#^/info-points/([0-9]+)$#', $path, $matches)) {
    $infoPointController->destroy((int) $matches[1]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}
