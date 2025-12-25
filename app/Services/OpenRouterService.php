<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function chat(string $text, string $model = 'allenai/olmo-3.1-32b-think:free'): string
    {
        try {
            Log::info('OpenRouter chat attempt', [
                'model' => $model,
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 200)
            ]);

            $headers = [
                "Authorization" => "Bearer {$this->apiKey}",
                "Content-Type"  => "application/json",
            ];

            if ($this->siteUrl)  $headers["HTTP-Referer"] = $this->siteUrl;
            if ($this->siteName) $headers["X-Title"]      = $this->siteName;

            $response = Http::withHeaders($headers)
                ->timeout(120)
                ->connectTimeout(30)
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
                Log::error('OpenRouter chat failed response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'model' => $model
                ]);

                return "OpenRouter API error (HTTP {$response->status()}): " . $response->body();
            }

            $json = $response->json();

            if (!isset($json['choices'][0]['message']['content'])) {
                Log::error('OpenRouter chat unexpected response format', [
                    'response' => $json
                ]);

                return "Error: Unexpected response format from OpenRouter";
            }

            $content = $json['choices'][0]['message']['content'];

            Log::info('OpenRouter chat success', [
                'response_length' => strlen($content),
                'response_preview' => substr($content, 0, 200)
            ]);

            return $content;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('OpenRouter chat connection error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => "{$this->baseUrl}/chat/completions"
            ]);

            return "Connection error to OpenRouter: " . $e->getMessage();

        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('OpenRouter chat request error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'response' => $e->response?->body()
            ]);

            return "Request error to OpenRouter: " . $e->getMessage();

        } catch (\Exception $e) {
            Log::error('OpenRouter chat general error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'class' => get_class($e),
                'model' => $model
            ]);

            return "General error: " . $e->getMessage();
        }
    }
}