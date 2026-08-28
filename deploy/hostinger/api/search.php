<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
header('X-Content-Type-Options: nosniff');

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Dozwolona jest metoda GET.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$query = trim((string) ($_GET['query'] ?? $_GET['q'] ?? ''));
if ($query === '' || strlen($query) > 160) {
    echo '[]';
    exit;
}

$indexPath = dirname(__DIR__, 2) . '/config/study-index.json';
$entries = is_file($indexPath) ? json_decode((string) file_get_contents($indexPath), true) : [];
if (!is_array($entries)) {
    echo '[]';
    exit;
}

$lower = static fn (string $value): string => function_exists('mb_strtolower')
    ? mb_strtolower($value, 'UTF-8')
    : strtolower($value);
preg_match_all('/[\p{L}\p{N}-]{2,}/u', $lower($query), $matches);
$terms = array_values(array_unique($matches[0] ?? []));
$results = [];

foreach ($entries as $entry) {
    if (!is_array($entry) || !isset($entry['content'], $entry['url'], $entry['id'])) {
        continue;
    }
    $haystack = $lower((string) ($entry['searchText'] ?? $entry['content']));
    $score = 0;
    foreach ($terms as $term) {
        if (str_contains($haystack, $term)) {
            $score += ($entry['type'] ?? '') === 'page' ? 4 : 2;
            $score += substr_count($haystack, $term);
        }
    }
    if ($score === 0) {
        continue;
    }
    $content = (string) $entry['content'];
    foreach ($terms as $term) {
        $content = preg_replace('/(' . preg_quote($term, '/') . ')/iu', '<mark>$1</mark>', $content, 2) ?? $content;
    }
    $results[] = [
        'score' => $score,
        'id' => (string) $entry['id'],
        'type' => ($entry['type'] ?? '') === 'page' ? 'page' : 'text',
        'content' => $content,
        'breadcrumbs' => is_array($entry['breadcrumbs'] ?? null) ? $entry['breadcrumbs'] : [],
        'url' => (string) $entry['url'],
    ];
}

usort($results, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);
$results = array_map(static function (array $item): array {
    unset($item['score']);
    return $item;
}, array_slice($results, 0, 12));

echo json_encode($results, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
