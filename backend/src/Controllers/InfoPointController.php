<?php
namespace App\Controllers;

use App\Models\InfoPoint;

class InfoPointController
{
    private InfoPoint $infoPointModel;

    public function __construct(InfoPoint $infoPointModel)
    {
        $this->infoPointModel = $infoPointModel;
    }

    public function index(): void
    {
        header('Content-Type: application/json');
        echo json_encode(['data' => $this->infoPointModel->getAll()]);
    }

    public function show(int $id): void
    {
        $infoPoint = $this->infoPointModel->getById($id);

        if ($infoPoint === null) {
            http_response_code(404);
            echo json_encode(['error' => 'InfoPoint not found']);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(['data' => $infoPoint]);
    }

    public function store(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            $data = $_POST;
        }

        if (!is_array($data) || !isset($data['time'], $data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        if ($this->infoPointModel->create($data)) {
            http_response_code(201);
            echo json_encode(['message' => 'InfoPoint created successfully']);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'Failed to create InfoPoint']);
    }

    public function update(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data) || !isset($data['time'], $data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        if ($this->infoPointModel->update($id, $data)) {
            http_response_code(200);
            echo json_encode(['message' => 'InfoPoint updated successfully']);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'Failed to update InfoPoint']);
    }

    public function destroy(int $id): void
    {
        if (!$this->infoPointModel->delete($id)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete InfoPoint']);
            return;
        }

        http_response_code(200);
        echo json_encode(['message' => 'InfoPoint deleted successfully']);
    }
}