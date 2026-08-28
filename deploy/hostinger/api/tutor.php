<?php

declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function respond_json(array $payload, int $status = 200, array $headers = []): never
{
    http_response_code($status);
    foreach ($headers as $name => $value) {
        header($name . ': ' . $value);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function text_value(mixed $value, int $maxLength): string
{
    if (!is_string($value)) {
        return '';
    }
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $maxLength, 'UTF-8') : substr($value, 0, $maxLength);
}

function lower_text(string $value): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
}

function infer_lesson(string $question, mixed $contextLesson): ?int
{
    $lesson = filter_var($contextLesson, FILTER_VALIDATE_INT);
    if ($lesson !== false && $lesson >= 13 && $lesson <= 18) {
        return $lesson;
    }
    if (preg_match('/\b(?:(?:lektion|lekcj[aię]|l)\s*)?(1[3-8])\b/iu', $question, $matches)) {
        return (int) $matches[1];
    }
    return null;
}

function route_model(string $question, array $models): array
{
    $normalized = lower_text($question);
    $complex = strlen($question) > 700
        || preg_match('/niejednoznacz|sprzeczn|wyjąt|wyjatek|głęboka analiza|dokładnie porówn|złożon|trudn.*gramat/u', $normalized);
    if ($complex) {
        return ['tier' => 'smart', 'model' => (string) $models['smart'], 'effort' => 'medium'];
    }
    if (preg_match('/dlaczego|różnic|porównaj|gramat|dativ|akkusativ|końców|szyk|przyimek/u', $normalized)) {
        return ['tier' => 'default', 'model' => (string) $models['default'], 'effort' => 'medium'];
    }
    return ['tier' => 'default', 'model' => (string) $models['default'], 'effort' => 'low'];
}

function origin_is_allowed(array $allowedHosts): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return true;
    }
    $host = parse_url($origin, PHP_URL_HOST);
    return is_string($host) && in_array(lower_text($host), array_map('lower_text', $allowedHosts), true);
}

function rate_limit_exceeded(array $settings): bool
{
    $limit = max(1, (int) ($settings['limit'] ?? 30));
    $window = max(60, (int) ($settings['window_seconds'] ?? 600));
    $salt = (string) ($settings['salt'] ?? 'deutsch-ai');
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $directory = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'deutsch-ai-rate';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        return false;
    }
    $file = $directory . DIRECTORY_SEPARATOR . hash('sha256', $salt . '|' . $ip) . '.json';
    $handle = @fopen($file, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        if (is_resource($handle)) {
            fclose($handle);
        }
        return false;
    }

    $raw = stream_get_contents($handle);
    $timestamps = json_decode($raw ?: '[]', true);
    if (!is_array($timestamps)) {
        $timestamps = [];
    }
    $now = time();
    $timestamps = array_values(array_filter($timestamps, static fn ($timestamp): bool => is_int($timestamp) && $now - $timestamp < $window));
    $limited = count($timestamps) >= $limit;
    if (!$limited) {
        $timestamps[] = $now;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($timestamps));
        fflush($handle);
    }
    flock($handle, LOCK_UN);
    fclose($handle);
    return $limited;
}

function retrieve_context(array $entries, string $query, ?int $lesson): string
{
    preg_match_all('/[\p{L}\p{N}-]{3,}/u', lower_text($query), $termMatches);
    $terms = array_values(array_unique($termMatches[0] ?? []));
    $scored = [];
    foreach ($entries as $entry) {
        if (!is_array($entry) || !isset($entry['content'])) {
            continue;
        }
        $entryLesson = isset($entry['lesson']) && is_numeric($entry['lesson']) ? (int) $entry['lesson'] : null;
        $haystack = lower_text((string) ($entry['searchText'] ?? $entry['content']));
        $score = $lesson !== null && $entryLesson === $lesson ? 5 : 0;
        foreach ($terms as $term) {
            if (str_contains($haystack, $term)) {
                $score += 2;
            }
        }
        if ($score > 0) {
            $scored[] = [
                'score' => $score,
                'lesson' => $entryLesson,
                'content' => text_value($entry['tutorText'] ?? $entry['content'], 1100),
            ];
        }
    }
    usort($scored, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);
    $selected = array_slice($scored, 0, 5);
    if ($selected === []) {
        return 'Brak jednoznacznego fragmentu w lokalnych notatkach.';
    }
    return implode("\n\n", array_map(
        static fn (array $item): string => '[Lektion ' . ($item['lesson'] ?? '?') . '] ' . $item['content'],
        $selected,
    ));
}

function response_text(array $response): string
{
    if (isset($response['output_text']) && is_string($response['output_text'])) {
        return trim($response['output_text']);
    }
    $parts = [];
    foreach (($response['output'] ?? []) as $output) {
        if (!is_array($output)) {
            continue;
        }
        foreach (($output['content'] ?? []) as $content) {
            if (is_array($content) && ($content['type'] ?? '') === 'output_text' && is_string($content['text'] ?? null)) {
                $parts[] = $content['text'];
            }
        }
    }
    return trim(implode('', $parts));
}

$domainRoot = dirname(__DIR__, 2);
$configPath = $domainRoot . '/config/deutsch-ai.php';
$indexPath = $domainRoot . '/config/study-index.json';
if (!is_file($configPath)) {
    respond_json(['error' => 'Tutor AI nie jest jeszcze skonfigurowany.'], 503);
}

$config = require $configPath;
if (!is_array($config) || text_value($config['openai_api_key'] ?? '', 300) === '') {
    respond_json(['error' => 'Tutor AI nie jest jeszcze skonfigurowany.'], 503);
}

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'GET') {
    respond_json(['status' => 'ok', 'service' => 'deutsch-ai-tutor']);
}
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($method !== 'POST') {
    respond_json(['error' => 'Dozwolona jest metoda POST.'], 405, ['Allow' => 'GET, POST, OPTIONS']);
}
if (!origin_is_allowed((array) ($config['allowed_hosts'] ?? []))) {
    respond_json(['error' => 'Niedozwolone źródło żądania.'], 403);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 64000) {
    respond_json(['error' => 'Żądanie jest zbyt duże.'], 413);
}
if (rate_limit_exceeded((array) ($config['rate_limit'] ?? []))) {
    respond_json(
        ['error' => 'Za dużo pytań w krótkim czasie. Spróbuj ponownie za kilka minut.'],
        429,
        ['Retry-After' => '120'],
    );
}

try {
    $body = json_decode((string) file_get_contents('php://input'), true, 64, JSON_THROW_ON_ERROR);
} catch (Throwable) {
    respond_json(['error' => 'Nieprawidłowe dane żądania.'], 400);
}
if (!is_array($body)) {
    respond_json(['error' => 'Nieprawidłowe dane żądania.'], 400);
}

$question = text_value($body['question'] ?? '', 1200);
if (strlen($question) < 2) {
    respond_json(['error' => 'Wpisz pytanie.'], 400);
}
$context = is_array($body['context'] ?? null) ? $body['context'] : [];
$lesson = infer_lesson($question, $context['lesson'] ?? null);
$selectedText = text_value($context['selectedText'] ?? '', 1800);
$surroundingText = text_value($context['surroundingText'] ?? '', 2200);
$heading = text_value($context['heading'] ?? '', 180);
$route = text_value($context['route'] ?? '', 220);
$weakTopics = [];
foreach (array_slice(is_array($context['weakTopics'] ?? null) ? $context['weakTopics'] : [], 0, 5) as $topic) {
    $topic = text_value($topic, 100);
    if ($topic !== '') {
        $weakTopics[] = $topic;
    }
}

$entries = [];
if (is_file($indexPath)) {
    $decodedIndex = json_decode((string) file_get_contents($indexPath), true);
    if (is_array($decodedIndex)) {
        $entries = $decodedIndex;
    }
}
$localContext = retrieve_context($entries, $question . ' ' . $selectedText . ' ' . $heading, $lesson);
$contextParts = array_filter([
    $lesson !== null ? 'Bieżąca lekcja: Lektion ' . $lesson : '',
    $heading !== '' ? 'Sekcja: ' . $heading : '',
    $route !== '' ? 'Trasa: ' . $route : '',
    $selectedText !== '' ? "Zaznaczony tekst:\n" . $selectedText : '',
    $surroundingText !== '' ? "Najbliższy kontekst:\n" . $surroundingText : '',
    $weakTopics !== [] ? 'Ostatnie słabe tematy: ' . implode(', ', $weakTopics) : '',
    "Lokalnie odnalezione notatki:\n" . $localContext,
    "Pytanie ucznia:\n" . $question,
]);

$history = [];
foreach (array_slice(is_array($body['history'] ?? null) ? $body['history'] : [], -8) as $item) {
    if (!is_array($item)) {
        continue;
    }
    $content = text_value($item['text'] ?? '', 1200);
    if ($content !== '') {
        $history[] = ['role' => ($item['role'] ?? '') === 'assistant' ? 'assistant' : 'user', 'content' => $content];
    }
}
$history[] = ['role' => 'user', 'content' => implode("\n\n", $contextParts)];

$models = (array) ($config['models'] ?? []);
if (!isset($models['default'], $models['smart'])) {
    respond_json(['error' => 'Konfiguracja modeli jest niepełna.'], 503);
}
$routeModel = route_model($question, $models);
$systemPrompt = <<<'PROMPT'
Jesteś prywatnym korepetytorem języka niemieckiego dla polskiego ucznia, który przygotowuje się z Momente A1.2, Lektion 13–18. Dostarczone notatki kursowe są głównym źródłem prawdy. Domyślnie odpowiadaj krótko po polsku, a przykłady pozostaw po niemiecku. Dla gramatyki stosuj rytm: prosta odpowiedź, dlaczego, jeden przykład. Wyjaśniaj przyczynę błędu. Jeśli ostatnia wiadomość tutora była pytaniem lub zadaniem, a uczeń odpowiada krótko, oceń tę odpowiedź względem poprzedniego zadania. Zacznij od „Dobrze” albo „Nie tym razem”, a potem krótko wyjaśnij. Nie wprowadzaj Lektion 19 ani dalszych tematów. Jeśli notatki nie wystarczają, powiedz to jednym zdaniem przed użyciem wiedzy ogólnej. Nie udawaj cytatów ani numerów stron. Gdy pomaga to w nauce, zakończ jednym krótkim pytaniem kontrolnym.
PROMPT;

$requestPayload = [
    'model' => $routeModel['model'],
    'reasoning' => ['effort' => $routeModel['effort']],
    'instructions' => $systemPrompt,
    'input' => $history,
    'text' => ['verbosity' => 'low'],
    'max_output_tokens' => 700,
];

$curl = curl_init('https://api.openai.com/v1/responses');
if ($curl === false) {
    respond_json(['error' => 'Tutor AI jest chwilowo niedostępny.'], 502);
}
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 55,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . text_value($config['openai_api_key'], 300),
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($requestPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
]);
$rawResponse = curl_exec($curl);
$curlError = curl_errno($curl);
$status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);

if ($curlError !== 0 || !is_string($rawResponse)) {
    respond_json(['error' => 'Nie udało się połączyć z tutorem. Spróbuj ponownie.'], 502);
}
if ($status === 429) {
    respond_json(['error' => 'Limit OpenAI został chwilowo osiągnięty. Spróbuj ponownie za moment.'], 429, ['Retry-After' => '30']);
}
if ($status < 200 || $status >= 300) {
    error_log('Deutsch AI upstream status: ' . $status);
    respond_json(['error' => 'OpenAI odrzuciło żądanie. Spróbuj ponownie później.'], 502);
}

$decoded = json_decode($rawResponse, true);
$answer = is_array($decoded) ? response_text($decoded) : '';
if ($answer === '') {
    respond_json(['error' => 'Tutor zwrócił pustą odpowiedź. Spróbuj ponownie.'], 502);
}

header('Content-Type: text/plain; charset=utf-8');
header('X-Study-Source: course-notes-local');
header('X-Model-Tier: ' . $routeModel['tier']);
echo $answer;
