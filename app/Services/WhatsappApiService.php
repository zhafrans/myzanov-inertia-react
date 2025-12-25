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

    /**
     * Create a new WhatsApp session
     */
    public function createSession(?string $sessionId = null, ?string $webhookUrl = null): array
    {
        try {
            Log::info('WhatsApp createSession attempt', [
                'session_id' => $sessionId,
                'webhook_url' => $webhookUrl
            ]);

            $payload = [];
            if ($sessionId) {
                $payload['session_id'] = $sessionId;
            }
            if ($webhookUrl) {
                $payload['webhook_url'] = $webhookUrl;
            }

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(60)
            ->post("{$this->baseUrl}/session/create", $payload);

            return $this->handleResponse($response, 'createSession');

        } catch (\Exception $e) {
            Log::error('WhatsApp createSession error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get all sessions for current user
     */
    public function getSessions(): array
    {
        try {
            Log::info('WhatsApp getSessions attempt');

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->get("{$this->baseUrl}/sessions");

            return $this->handleResponse($response, 'getSessions');

        } catch (\Exception $e) {
            Log::error('WhatsApp getSessions error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get session status
     */
    public function getSessionStatus(?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp getSessionStatus attempt', [
                'session_id' => $targetSessionId
            ]);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->get("{$this->baseUrl}/session/{$targetSessionId}/status");

            return $this->handleResponse($response, 'getSessionStatus');

        } catch (\Exception $e) {
            Log::error('WhatsApp getSessionStatus error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get QR code for session authentication
     */
    public function getQrCode(?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp getQrCode attempt', [
                'session_id' => $targetSessionId
            ]);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->get("{$this->baseUrl}/session/{$targetSessionId}/qr");

            return $this->handleResponse($response, 'getQrCode');

        } catch (\Exception $e) {
            Log::error('WhatsApp getQrCode error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Logout and delete WhatsApp session
     */
    public function deleteSession(?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp deleteSession attempt', [
                'session_id' => $targetSessionId
            ]);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->delete("{$this->baseUrl}/session/{$targetSessionId}");

            return $this->handleResponse($response, 'deleteSession');

        } catch (\Exception $e) {
            Log::error('WhatsApp deleteSession error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Set or update the webhook URL for session events
     */
    public function updateWebhook(string $webhookUrl, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp updateWebhook attempt', [
                'session_id' => $targetSessionId,
                'webhook_url' => $webhookUrl
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(30)
            ->put("{$this->baseUrl}/session/{$targetSessionId}/webhook", [
                'webhook_url' => $webhookUrl
            ]);

            return $this->handleResponse($response, 'updateWebhook');

        } catch (\Exception $e) {
            Log::error('WhatsApp updateWebhook error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send message to individual
     */
    public function sendMessage(string $phoneNumber, string $message, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp sendMessage attempt', [
                'session_id' => $targetSessionId,
                'phone_number' => $phoneNumber,
                'message_length' => strlen($message)
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(30)
            ->post("{$this->baseUrl}/session/{$targetSessionId}/send", [
                "phoneNumber" => $phoneNumber,
                "message" => $message
            ]);

            return $this->handleResponse($response, 'sendMessage');

        } catch (\Exception $e) {
            Log::error('WhatsApp sendMessage error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send message to group
     */
    public function sendGroup(string $message, ?string $groupId = null, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            $targetGroupId = $groupId ?? $this->groupId;
            
            Log::info('WhatsApp sendGroup attempt', [
                'session_id' => $targetSessionId,
                'group_id' => $targetGroupId,
                'message_length' => strlen($message)
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(30)
            ->post("{$this->baseUrl}/session/{$targetSessionId}/send-group", [
                "groupId" => $targetGroupId,
                "message" => $message
            ]);

            return $this->handleResponse($response, 'sendGroup');

        } catch (\Exception $e) {
            Log::error('WhatsApp sendGroup error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send broadcast message
     */
    public function sendBroadcast(array $phoneNumbers, string $message, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp sendBroadcast attempt', [
                'session_id' => $targetSessionId,
                'recipients_count' => count($phoneNumbers),
                'message_length' => strlen($message)
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(60)
            ->post("{$this->baseUrl}/session/{$targetSessionId}/broadcast", [
                "phoneNumbers" => $phoneNumbers,
                "message" => $message
            ]);

            return $this->handleResponse($response, 'sendBroadcast');

        } catch (\Exception $e) {
            Log::error('WhatsApp sendBroadcast error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get all groups the session is participating in
     */
    public function getGroups(?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp getGroups attempt', [
                'session_id' => $targetSessionId
            ]);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->get("{$this->baseUrl}/session/{$targetSessionId}/groups");

            return $this->handleResponse($response, 'getGroups');

        } catch (\Exception $e) {
            Log::error('WhatsApp getGroups error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create a new WhatsApp group
     */
    public function createGroup(string $name, array $participants, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp createGroup attempt', [
                'session_id' => $targetSessionId,
                'group_name' => $name,
                'participants_count' => count($participants)
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(60)
            ->post("{$this->baseUrl}/session/{$targetSessionId}/groups", [
                "name" => $name,
                "participants" => $participants
            ]);

            return $this->handleResponse($response, 'createGroup');

        } catch (\Exception $e) {
            Log::error('WhatsApp createGroup error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get group metadata and participants
     */
    public function getGroupInfo(string $groupId, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp getGroupInfo attempt', [
                'session_id' => $targetSessionId,
                'group_id' => $groupId
            ]);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->get("{$this->baseUrl}/session/{$targetSessionId}/groups/{$groupId}");

            return $this->handleResponse($response, 'getGroupInfo');

        } catch (\Exception $e) {
            Log::error('WhatsApp getGroupInfo error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Leave group
     */
    public function leaveGroup(string $groupId, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp leaveGroup attempt', [
                'session_id' => $targetSessionId,
                'group_id' => $groupId
            ]);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->delete("{$this->baseUrl}/session/{$targetSessionId}/groups/{$groupId}");

            return $this->handleResponse($response, 'leaveGroup');

        } catch (\Exception $e) {
            Log::error('WhatsApp leaveGroup error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Add members to group
     */
    public function addParticipants(string $groupId, array $participants, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp addParticipants attempt', [
                'session_id' => $targetSessionId,
                'group_id' => $groupId,
                'participants_count' => count($participants)
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(60)
            ->post("{$this->baseUrl}/session/{$targetSessionId}/groups/{$groupId}/add", [
                "participants" => $participants
            ]);

            return $this->handleResponse($response, 'addParticipants');

        } catch (\Exception $e) {
            Log::error('WhatsApp addParticipants error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Remove members from group
     */
    public function removeParticipants(string $groupId, array $participants, ?string $sessionId = null): array
    {
        try {
            $targetSessionId = $sessionId ?? $this->sessionId;
            
            Log::info('WhatsApp removeParticipants attempt', [
                'session_id' => $targetSessionId,
                'group_id' => $groupId,
                'participants_count' => count($participants)
            ]);

            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(60)
            ->post("{$this->baseUrl}/session/{$targetSessionId}/groups/{$groupId}/remove", [
                "participants" => $participants
            ]);

            return $this->handleResponse($response, 'removeParticipants');

        } catch (\Exception $e) {
            Log::error('WhatsApp removeParticipants error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'General error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Common response handler
     */
    private function handleResponse($response, string $method): array
    {
        if ($response->failed()) {
            Log::error("WhatsApp {$method} failed response", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => 'HTTP ' . $response->status() . ': ' . $response->body()
            ];
        }

        $result = $response->json();

        Log::info("WhatsApp {$method} success", [
            'response' => $result
        ]);

        return $result ?? ['success' => true];
    }
}