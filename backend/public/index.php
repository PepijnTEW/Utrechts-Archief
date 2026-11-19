<?php
require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/../src/Config/database.php';

use App\Models\InfoPoint;

$infoPointModel = new InfoPoint($conn);
$infoPoints = $infoPointModel->getAll();

header('Content-Type: application/json');
echo json_encode($infoPoints);

