<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Sales;

class GeminiService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function chat(string $text): string
    {
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$this->apiKey}",
            [
                "system_instruction" => [
                    "parts" => [
                        [
                            "text" =>
                                "Saya adalah AI bernama ZANOVIA yang bekerja sebagai karyawan untuk ZANOV Shoes Purwokerto dan Bintang Shoes Purwokerto yang siap melayani informasi kepada karyawan dan client dengan sopan."
                        ]
                    ]
                ],

                "contents" => [
                    [
                        "role" => "user",
                        "parts" => [
                            ["text" => $text]
                        ]
                    ]
                ]
            ]
        )->json();

        return $response['candidates'][0]['content']['parts'][0]['text']
            ?? 'No response';
    }

    public function askAI($question)
    {
        $sales = Sales::with([
            'installments',
            'outstanding',
            'seller'
        ])->get();

        return $sales->toJson();

        $context = $sales->toJson();

        return $this->chat("
            Kamu adalah AI ZANOV Shoes.
            Jawablah HANYA berdasarkan data berikut.
            Jika jawaban tidak ada di data, jawab:
            'Maaf, data tidak ditemukan pada sistem kami.'

            DATA CRM:
            $context

            Pertanyaan:
            $question
        ");
    }

}
