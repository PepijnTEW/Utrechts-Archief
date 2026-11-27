<?php
namespace App\Controllers;

use App\Models\InfoPoint;
use App\Services\MediaStorage;
use InvalidArgumentException;
use mysqli_sql_exception;
use RuntimeException;

class InfoPointController
{
    private InfoPoint $infoPointModel;
    private MediaStorage $mediaStorage;

    public function __construct(InfoPoint $infoPointModel)
    {
        $this->infoPointModel = $infoPointModel;
        $this->mediaStorage = new MediaStorage();
    }

    public function index(): void
    {
        $this->respond(200, ['data' => $this->infoPointModel->getAll()]);
    }

    public function show(int $id): void
    {
        $infoPoint = $this->infoPointModel->getById($id);

        if ($infoPoint === null) {
            $this->respond(404, ['error' => 'InfoPoint not found']);
            return;
        }

        $this->respond(200, ['data' => $infoPoint]);
    }

    public function store(): void
    {
        $data = $this->requestData();
        $validationError = $this->validateFields($data);
        if ($validationError !== null) {
            $this->respond(400, ['error' => $validationError]);
            return;
        }

        $newPaths = [];

        try {
            $data['images'] = $this->imagePaths($data['images'] ?? []);
            $data['voice_path'] = $this->audioPath($data, 'voice_path', null);
            $data['ambient_path'] = $this->audioPath($data, 'ambient_path', null);

            $uploadedImages = $this->mediaStorage->storeMultiple($_FILES['image_files'] ?? null, 'images');
            $newPaths = array_merge($newPaths, $uploadedImages);
            $data['images'] = array_merge($data['images'], $uploadedImages);

            foreach (['voice_file' => 'voice_path', 'ambient_file' => 'ambient_path'] as $fileField => $pathField) {
                $uploadedPath = $this->mediaStorage->storeSingle($_FILES[$fileField] ?? null, 'audio');
                if ($uploadedPath !== null) {
                    $newPaths[] = $uploadedPath;
                    $data[$pathField] = $uploadedPath;
                }
            }

            $id = $this->infoPointModel->create($data);
            if ($id === false) {
                $this->mediaStorage->deleteFiles($newPaths);
                $this->respond(500, ['error' => 'Failed to create InfoPoint']);
                return;
            }

            $this->respond(201, ['data' => ['id' => $id], 'message' => 'InfoPoint created successfully']);
        } catch (InvalidArgumentException $exception) {
            $this->mediaStorage->deleteFiles($newPaths);
            $this->respond(400, ['error' => $exception->getMessage()]);
        } catch (RuntimeException | mysqli_sql_exception $exception) {
            $this->mediaStorage->deleteFiles($newPaths);
            error_log($exception->getMessage());
            $this->respond(500, ['error' => 'Could not save InfoPoint media']);
        }
    }

    public function update(int $id): void
    {
        $existing = $this->infoPointModel->getById($id);
        if ($existing === null) {
            $this->respond(404, ['error' => 'InfoPoint not found']);
            return;
        }

        $data = $this->requestData();
        $validationError = $this->validateFields($data);
        if ($validationError !== null) {
            $this->respond(400, ['error' => $validationError]);
            return;
        }

        $oldPaths = $this->recordMediaPaths($existing);
        $newPaths = [];

        try {
            $imagePaths = array_key_exists('images_present', $data)
                ? ($data['images'] ?? [])
                : ($data['images'] ?? $this->recordImagePaths($existing));
            $data['images'] = $this->imagePaths($imagePaths);
            $data['voice_path'] = $this->audioPath($data, 'voice_path', $existing['voice_path'] ?? null);
            $data['ambient_path'] = $this->audioPath($data, 'ambient_path', $existing['ambient_path'] ?? null);

            $uploadedImages = $this->mediaStorage->storeMultiple($_FILES['image_files'] ?? null, 'images');
            $newPaths = array_merge($newPaths, $uploadedImages);
            $data['images'] = array_merge($data['images'], $uploadedImages);

            foreach (['voice_file' => 'voice_path', 'ambient_file' => 'ambient_path'] as $fileField => $pathField) {
                $uploadedPath = $this->mediaStorage->storeSingle($_FILES[$fileField] ?? null, 'audio');
                if ($uploadedPath !== null) {
                    $newPaths[] = $uploadedPath;
                    $data[$pathField] = $uploadedPath;
                }
            }

            if (!$this->infoPointModel->update($id, $data)) {
                $this->mediaStorage->deleteFiles($newPaths);
                $this->respond(500, ['error' => 'Failed to update InfoPoint']);
                return;
            }

            $this->mediaStorage->deleteFiles(array_values(array_diff(
                $oldPaths,
                $this->recordMediaPaths($data),
            )));
            $this->respond(200, ['message' => 'InfoPoint updated successfully']);
        } catch (InvalidArgumentException $exception) {
            $this->mediaStorage->deleteFiles($newPaths);
            $this->respond(400, ['error' => $exception->getMessage()]);
        } catch (RuntimeException | mysqli_sql_exception $exception) {
            $this->mediaStorage->deleteFiles($newPaths);
            error_log($exception->getMessage());
            $this->respond(500, ['error' => 'Could not save InfoPoint media']);
        }
    }

    public function updateActive(int $id): void
    {
        if ($this->infoPointModel->getById($id) === null) {
            $this->respond(404, ['error' => 'InfoPoint not found']);
            return;
        }

        $data = $this->requestData();
        if (!array_key_exists('active', $data) || !is_bool($data['active'])) {
            $this->respond(400, ['error' => 'Active must be a boolean.']);
            return;
        }

        try {
            if (!$this->infoPointModel->setActive($id, $data['active'])) {
                $this->respond(500, ['error' => 'Failed to update InfoPoint status']);
                return;
            }

            $this->respond(200, ['message' => 'InfoPoint status updated successfully']);
        } catch (mysqli_sql_exception $exception) {
            error_log($exception->getMessage());
            $this->respond(500, ['error' => 'Failed to update InfoPoint status']);
        }
    }

    public function destroy(int $id): void
    {
        $infoPoint = $this->infoPointModel->getById($id);
        if ($infoPoint === null) {
            $this->respond(404, ['error' => 'InfoPoint not found']);
            return;
        }

        if (!$this->infoPointModel->delete($id)) {
            $this->respond(500, ['error' => 'Failed to delete InfoPoint']);
            return;
        }

        $this->mediaStorage->deleteFiles($this->recordMediaPaths($infoPoint));
        $this->respond(200, ['message' => 'InfoPoint deleted successfully']);
    }

    private function requestData(): array
    {
        $contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
        if (str_starts_with($contentType, 'multipart/form-data') || str_starts_with($contentType, 'application/x-www-form-urlencoded')) {
            return $_POST;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        return is_array($data) ? $data : [];
    }

    private function validateFields(array &$data): ?string
    {
        $titleValue = $data['title'] ?? '';
        $timeValue = $data['time'] ?? '';
        $descriptionValue = $data['description'] ?? '';
        if (!is_string($titleValue) || !is_string($timeValue) || !is_string($descriptionValue)) {
            return 'Title, time, and description must be text.';
        }

        $title = trim($titleValue);
        $time = trim($timeValue);
        $description = $descriptionValue;

        if ($title === '' || $time === '') {
            return 'Title and time are required.';
        }

        $titleLength = preg_match_all('/./us', $title);
        if ($titleLength === false || $titleLength > 255) {
            return 'Title cannot be longer than 255 characters.';
        }

        if (!preg_match('/^(?:\d{1,3}):[0-5]\d:[0-5]\d$/D', $time)) {
            return 'Time must use HH:MM:SS format.';
        }

        if ((int) explode(':', $time, 2)[0] > 838) {
            return 'Time is outside the supported range.';
        }

        $descriptionLength = preg_match_all('/./us', $description);
        if ($descriptionLength === false || $descriptionLength > 255) {
            return 'Description cannot be longer than 255 characters.';
        }

        $data['title'] = $title;
        $data['time'] = $time;
        $data['description'] = $description;

        return null;
    }

    private function imagePaths(mixed $paths): array
    {
        if (!is_array($paths)) {
            throw new InvalidArgumentException('Image paths must be an array.');
        }

        foreach ($paths as $path) {
            if (!is_string($path) || !$this->mediaStorage->isManagedPath($path, 'images')) {
                throw new InvalidArgumentException('An image path is invalid.');
            }
        }

        return array_values($paths);
    }

    private function audioPath(array $data, string $field, ?string $fallback): ?string
    {
        if (!array_key_exists($field, $data)) {
            return $fallback;
        }

        if (!is_string($data[$field]) && $data[$field] !== null) {
            throw new InvalidArgumentException('An audio path is invalid.');
        }

        $path = trim($data[$field] ?? '');
        if ($path === '') {
            return null;
        }

        if (!$this->mediaStorage->isManagedPath($path, 'audio')) {
            throw new InvalidArgumentException('An audio path is invalid.');
        }

        return $path;
    }

    private function recordImagePaths(array $infoPoint): array
    {
        return array_values(array_filter(
            array_map(
                static fn (mixed $image): mixed => is_array($image)
                    ? ($image['image_path'] ?? null)
                    : $image,
                $infoPoint['images'] ?? [],
            ),
            static fn (mixed $path): bool => is_string($path) && $path !== '',
        ));
    }

    private function recordMediaPaths(array $infoPoint): array
    {
        return array_values(array_filter([
            ...$this->recordImagePaths($infoPoint),
            $infoPoint['voice_path'] ?? null,
            $infoPoint['ambient_path'] ?? null,
        ], static fn (mixed $path): bool => is_string($path) && $path !== ''));
    }

    private function respond(int $status, array $body): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($body);
    }
}
