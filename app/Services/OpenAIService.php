<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenAIService
{
    public function summary($text)
    {
        $response = Http::withToken(env('OPENAI_API_KEY'))
            ->post('https://api.openai.com/v1/responses', [
                "model" => "gpt-5-nano",
                "input" => $text,
                "store" => false
            ]);

        return $response->json('output[0].content[0].text');
    }
}
