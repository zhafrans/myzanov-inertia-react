<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappApiService
{
    protected string $baseUrl = 'https://whatsapp.venusverse.me/api';
    protected string $apiKey;
    protected string $groupId;
    protected string $sessionId;

    public function __construct()
    {
        $this->apiKey = env('WA_GATEWAY_KEY', 'a1bcb546...');
        $this->groupId = '120363402682264714';
        $this->sessionId = 'myzanov';
    }

    public function sendGroup(string $message): array
    {
        try {
            Log::info('WhatsApp sendGroup attempt', [
                'message_length' => strlen($message),
                'group_id' => $this->groupId,
                'session_id' => $this->sessionId
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(30)
            ->post("{$this->baseUrl}/session/{$this->sessionId}/send-group", [
                "groupId" => $this->groupId,
                "message" => $message
            ]);

            if ($response->failed()) {
                Log::error('WhatsApp sendGroup failed response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'message_preview' => substr($message, 0, 100)
                ]);

                return [
                    'success' => false,
                    'error' => 'HTTP ' . $response->status() . ': ' . $response->body()
                ];
            }

            $result = $response->json();

            Log::info('WhatsApp sendGroup success', [
                'response' => $result
            ]);

            return $result ?? ['success' => true];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('WhatsApp sendGroup connection error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => "{$this->baseUrl}/session/{$this->sessionId}/send-group"
            ]);

            return [
                'success' => false,
                'error' => 'Connection error: ' . $e->getMessage()
            ];

        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('WhatsApp sendGroup request error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'response' => $e->response?->body()
            ]);

            return [
                'success' => false,
                'error' => 'Request error: ' . $e->getMessage()
            ];

        } catch (\Exception $e) {
            Log::error('WhatsApp sendGroup general error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'class' => get_class($e)
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }
}