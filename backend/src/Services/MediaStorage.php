<?php
namespace App\Services;

use InvalidArgumentException;
use RuntimeException;

final class MediaStorage
{
    private const UPLOAD_ROOT = __DIR__ . '/../../public/uploads';
    private const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

    private const MIME_EXTENSIONS = [
        'images' => [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ],
        'audio' => [
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'audio/x-wav' => 'wav',
            'audio/vnd.wave' => 'wav',
            'audio/ogg' => 'ogg',
            'application/ogg' => 'ogg',
            'audio/mp4' => 'm4a',
            'audio/x-m4a' => 'm4a',
            'audio/aac' => 'aac',
            'audio/flac' => 'flac',
            'audio/x-flac' => 'flac',
        ],
    ];

    public function storeMultiple(?array $upload, string $kind): array
    {
        if ($upload === null) {
            return [];
        }

        $storedPaths = [];

        try {
            foreach ($this->normalizeMultipleUpload($upload) as $file) {
                if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                    continue;
                }

                $storedPaths[] = $this->storeOne($file, $kind);
            }
        } catch (InvalidArgumentException | RuntimeException $exception) {
            $this->deleteFiles($storedPaths);
            throw $exception;
        }

        return $storedPaths;
    }

    public function storeSingle(?array $upload, string $kind): ?string
    {
        if ($upload === null || ($upload['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if (is_array($upload['error'] ?? null)) {
            throw new InvalidArgumentException('Only one file can be uploaded in this field.');
        }

        return $this->storeOne($upload, $kind);
    }

    public function isManagedPath(string $path, string $kind): bool
    {
        $patterns = [
            'images' => '#^/uploads/images/[a-f0-9]{32}\.(?:jpg|png|webp)$#D',
            'audio' => '#^/uploads/audio/[a-f0-9]{32}\.(?:mp3|wav|ogg|m4a|aac|flac)$#D',
        ];

        return isset($patterns[$kind]) && preg_match($patterns[$kind], $path) === 1;
    }

    public function deleteFiles(array $paths): void
    {
        $root = realpath(self::UPLOAD_ROOT);
        if ($root === false) {
            return;
        }

        foreach ($paths as $path) {
            if (!is_string($path) || !preg_match('#^/uploads/(images|audio)/([a-f0-9]{32}\.[a-z]+)$#D', $path, $matches)) {
                continue;
            }

            $fullPath = $root . DIRECTORY_SEPARATOR . $matches[1] . DIRECTORY_SEPARATOR . $matches[2];
            if (is_file($fullPath) && !unlink($fullPath)) {
                error_log('Could not remove uploaded media file: ' . $path);
            }
        }
    }

    private function normalizeMultipleUpload(array $upload): array
    {
        if (!isset($upload['name']) || !is_array($upload['name'])) {
            throw new InvalidArgumentException('The uploaded files are invalid.');
        }

        $files = [];
        foreach ($upload['name'] as $index => $name) {
            $files[] = [
                'name' => $name,
                'type' => $upload['type'][$index] ?? '',
                'tmp_name' => $upload['tmp_name'][$index] ?? '',
                'error' => $upload['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                'size' => $upload['size'][$index] ?? 0,
            ];
        }

        return $files;
    }

    private function storeOne(array $file, string $kind): string
    {
        if (!isset(self::MIME_EXTENSIONS[$kind])) {
            throw new InvalidArgumentException('Unsupported media type.');
        }

        $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($error !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException($this->uploadErrorMessage((int) $error));
        }

        $temporaryPath = $file['tmp_name'] ?? null;
        if (!is_string($temporaryPath) || !is_uploaded_file($temporaryPath)) {
            throw new InvalidArgumentException('The uploaded file is invalid.');
        }

        $size = filesize($temporaryPath);
        $maxSize = $kind === 'images' ? self::MAX_IMAGE_SIZE : self::MAX_AUDIO_SIZE;
        if ($size === false || $size === 0 || $size > $maxSize) {
            $limit = $kind === 'images' ? '5 MB' : '20 MB';
            throw new InvalidArgumentException('Files of this type must be no larger than ' . $limit . '.');
        }

        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);
        $extension = is_string($mimeType) ? (self::MIME_EXTENSIONS[$kind][$mimeType] ?? null) : null;
        if ($extension === null) {
            $allowed = $kind === 'images' ? 'JPG, PNG, or WebP' : 'MP3, WAV, OGG, M4A, AAC, or FLAC';
            throw new InvalidArgumentException('Use a supported ' . $kind . ' file (' . $allowed . ').');
        }

        $directory = self::UPLOAD_ROOT . DIRECTORY_SEPARATOR . $kind;
        if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
            throw new RuntimeException('Could not create the media upload directory.');
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        if (!move_uploaded_file($temporaryPath, $directory . DIRECTORY_SEPARATOR . $filename)) {
            throw new RuntimeException('Could not store the uploaded media file.');
        }

        return '/uploads/' . $kind . '/' . $filename;
    }

    private function uploadErrorMessage(int $error): string
    {
        return match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The uploaded file is too large.',
            UPLOAD_ERR_PARTIAL => 'The file upload was incomplete.',
            UPLOAD_ERR_NO_TMP_DIR => 'The server is missing its upload temporary directory.',
            UPLOAD_ERR_CANT_WRITE => 'The server could not write the uploaded file.',
            UPLOAD_ERR_EXTENSION => 'A server extension stopped the file upload.',
            default => 'The file upload failed.',
        };
    }
}
