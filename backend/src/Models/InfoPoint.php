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

        return $result->fetch_all(MYSQLI_ASSOC);
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

        return $row ?: null;
    }
    public function create(array $data): bool
    {
        $query = "INSERT INTO {$this->table} (time, title, description, ambient_path, voice_path, img_path) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $ambientPath = $data['ambient_path'] ?? null;
        $voicePath = $data['voice_path'] ?? null;
        $imgPath = $data['img_path'] ?? null;

        $stmt->bind_param(
            'ssssss',
            $data['time'],
            $data['title'],
            $data['description'],
            $ambientPath,
            $voicePath,
            $imgPath
        );
        return $stmt->execute();
    }
    public function update(int $id, array $data): bool
    {
        $query = "UPDATE {$this->table} SET time = ?, title = ?, description = ?, ambient_path = ?, voice_path = ?, img_path = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $ambientPath = $data['ambient_path'] ?? null;
        $voicePath = $data['voice_path'] ?? null;
        $imgPath = $data['img_path'] ?? null;

        $stmt->bind_param(
            'ssssssi',
            $data['time'],
            $data['title'],
            $data['description'],
            $ambientPath,
            $voicePath,
            $imgPath,
            $id
        );
        return $stmt->execute();
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
}