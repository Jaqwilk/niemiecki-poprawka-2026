<?php

declare(strict_types=1);

$documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

if ($path === '/api/tutor' || $path === '/api/tutor/') {
    require $documentRoot . '/api/tutor.php';
    return true;
}
if ($path === '/api/search' || $path === '/api/search/') {
    require $documentRoot . '/api/search.php';
    return true;
}

$candidate = $documentRoot . str_replace('/', DIRECTORY_SEPARATOR, $path);
if (is_file($candidate)) {
    return false;
}
if (is_dir($candidate) && is_file($candidate . '/index.html')) {
    readfile($candidate . '/index.html');
    return true;
}

http_response_code(404);
readfile($documentRoot . '/404.html');
return true;
