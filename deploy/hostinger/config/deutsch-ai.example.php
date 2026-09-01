<?php

declare(strict_types=1);

return [
    'openai_api_key' => 'replace-with-server-side-secret',
    'models' => [
        'fast' => 'gpt-5.6-luna',
        'default' => 'gpt-5.6-terra',
        'smart' => 'gpt-5.6-sol',
    ],
    'allowed_hosts' => [
        'jebaccwelazniemieckiego.pl',
        'www.jebaccwelazniemieckiego.pl',
    ],
    'rate_limit' => [
        'limit' => 30,
        'window_seconds' => 600,
        'salt' => 'replace-with-a-random-secret',
    ],
    'flashcard_rate_limit' => [
        'limit' => 120,
        'window_seconds' => 600,
    ],
    'answer_rate_limit' => [
        'limit' => 90,
        'window_seconds' => 600,
    ],
];
