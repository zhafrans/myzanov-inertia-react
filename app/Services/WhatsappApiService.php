<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

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
        $response = Http::withHeaders([
            'x-api-key'    => $this->apiKey,
            'Content-Type' => 'application/json'
        ])->post("{$this->baseUrl}/session/{$this->sessionId}/send-group", [
            "groupId" => $this->groupId,
            "message" => $message
        ]);

        return $response->json();
    }
}
