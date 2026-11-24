<?php
namespace App\Models;

use mysqli;

class InfoPoint
{
//store the mySQLi connetcion
 private mysqli $conn;
 //store the table name
 private string $table = 'info_points';

 public function __construct(mysqli $conn)
 {
  $this->conn = $conn;
 }
 
 public function getAll(): array
 {
    $query = "SELECT * FROM {$this->table} ORDER BY id DESC";
    $stmt = $this->conn->prepare($query);
     if (!$stmt) {
            return [];
        }

        if (!$stmt->execute()) {
            return [];
        }

        $result = $stmt->get_result();

        $infoPoints = $result->fetch_all(MYSQLI_ASSOC);

        foreach ($infoPoints as &$infoPoint) {
            $infoPoint = $this->withImages($infoPoint);
        }

        return $infoPoints;
 }
 public function getById(int $id): ?array
    {
        $query = "SELECT * FROM {$this->table} WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return null;
        }

        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        return $row ? $this->withImages($row) : null;
    }
    public function create(array $data): bool
    {
        $query = "INSERT INTO {$this->table} (time, title, description, ambient_path, voice_path) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $ambientPath = $data['ambient_path'] ?? null;
        $voicePath = $data['voice_path'] ?? null;

        $stmt->bind_param(
            'sssss',
            $data['time'],
            $data['title'],
            $data['description'],
            $ambientPath,
            $voicePath
        );

        if (!$stmt->execute()) {
            return false;
        }

        return $this->replaceImages((int) $this->conn->insert_id, $data['images'] ?? []);
    }
    public function update(int $id, array $data): bool
    {
        $query = "UPDATE {$this->table} SET time = ?, title = ?, description = ?, ambient_path = ?, voice_path = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $ambientPath = $data['ambient_path'] ?? null;
        $voicePath = $data['voice_path'] ?? null;

        $stmt->bind_param(
            'sssssi',
            $data['time'],
            $data['title'],
            $data['description'],
            $ambientPath,
            $voicePath,
            $id
        );

        if (!$stmt->execute()) {
            return false;
        }

        if (array_key_exists('images', $data)) {
            return $this->replaceImages($id, $data['images']);
        }

        return true;
    }
    public function delete(int $id): bool
    {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }

    public function destroy(): void
    {
        $this->conn->close();
    }

    private function withImages(array $infoPoint): array
    {
        $query = 'SELECT id, image_path FROM info_images WHERE info_point_id = ? ORDER BY id ASC';
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            $infoPoint['images'] = [];
            return $infoPoint;
        }

        $id = (int) $infoPoint['id'];
        $stmt->bind_param('i', $id);

        if (!$stmt->execute()) {
            $infoPoint['images'] = [];
            return $infoPoint;
        }

        $infoPoint['images'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $infoPoint;
    }

    private function replaceImages(int $infoPointId, mixed $images): bool
    {
        if (!is_array($images)) {
            return false;
        }

        $delete = $this->conn->prepare('DELETE FROM info_images WHERE info_point_id = ?');
        if (!$delete) {
            return false;
        }

        $delete->bind_param('i', $infoPointId);
        if (!$delete->execute()) {
            return false;
        }

        $insert = $this->conn->prepare(
            'INSERT INTO info_images (info_point_id, image_path) VALUES (?, ?)'
        );
        if (!$insert) {
            return false;
        }

        foreach ($images as $image) {
            if (!is_string($image) || $image === '') {
                return false;
            }

            $insert->bind_param('is', $infoPointId, $image);
            if (!$insert->execute()) {
                return false;
            }
        }

        return true;
    }
}