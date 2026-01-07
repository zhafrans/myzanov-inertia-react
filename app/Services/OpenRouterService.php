<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected string $baseUrl = "https://openrouter.ai/api/v1";
    protected ?string $apiKey;
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
        $attempt = 0;
        $maxDelay = 60; // Maximum delay of 60 seconds
        
        while (true) {
            $attempt++;
            
            try {
                Log::info('OpenRouter chat attempt', [
                    'model' => $model,
                    'text_length' => strlen($text),
                    'text_preview' => substr($text, 0, 200),
                    'attempt' => $attempt
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
                        'model' => $model,
                        'attempt' => $attempt
                    ]);

                    throw new \Exception("OpenRouter API error (HTTP {$response->status()}): " . $response->body());
                }

                $json = $response->json();

                if (!isset($json['choices'][0]['message']['content'])) {
                    Log::error('OpenRouter chat unexpected response format', [
                        'response' => $json,
                        'attempt' => $attempt
                    ]);

                    throw new \Exception("Error: Unexpected response format from OpenRouter");
                }

                $content = $json['choices'][0]['message']['content'];

                Log::info('OpenRouter chat success', [
                    'response_length' => strlen($content),
                    'response_preview' => substr($content, 0, 200),
                    'attempt' => $attempt
                ]);

                return $content;
                
            } catch (\Exception $e) {
                Log::error("OpenRouter chat exception on attempt {$attempt}", [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'will_retry' => true
                ]);
                
                // Calculate delay with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s...)
                $delay = min(pow(2, $attempt - 1), $maxDelay);
                
                Log::info("OpenRouter chat retrying in {$delay} seconds (attempt {$attempt})");
                sleep($delay);
            }
        }
    }
}