<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenRouterService
{
    protected string $baseUrl = "https://openrouter.ai/api/v1";

    protected string $apiKey;
    protected ?string $siteUrl;
    protected ?string $siteName;

    public function __construct()
    {
        $this->apiKey   = env('OPENROUTER_API_KEY');
        $this->siteUrl  = env('OPENROUTER_SITE_URL');
        $this->siteName = env('OPENROUTER_SITE_NAME');
    }

    public function chat(string $text, string $model = 'nex-agi/deepseek-v3.1-nex-n1:free'): string
    {
        $headers = [
            "Authorization" => "Bearer {$this->apiKey}",
            "Content-Type"  => "application/json",
        ];

        if ($this->siteUrl)  $headers["HTTP-Referer"] = $this->siteUrl;
        if ($this->siteName) $headers["X-Title"]      = $this->siteName;

        $response = Http::withHeaders($headers)
        ->timeout(0)          // no limit execution
        ->connectTimeout(0) 
        ->post("{$this->baseUrl}/chat/completions", [
            "model" => $model,
            "messages" => [
                [
                    "role" => "system",
                    "content" => "You are Zanovia AI assistant for ZANOV Shoes."
                ],
                [
                    "role" => "user",
                    "content" => $text
                ]
            ]
        ]);

        if ($response->failed()) {
            return "Request failed: " . $response->body();
        }

        $json = $response->json();

        return $json['choices'][0]['message']['content']
            ?? 'No response';
    }

}
