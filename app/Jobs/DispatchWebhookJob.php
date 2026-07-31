<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $event;
    protected $payload;

    /**
     * Create a new job instance.
     */
    public function __construct(string $event, array $payload = [])
    {
        $this->event = $event;
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $webhookUrl = config('services.frontend.webhook_url');

        if (!$webhookUrl) {
            Log::info("Frontend rebuild webhook skipped: No webhook URL configured.");
            return;
        }

        Log::info("Dispatching frontend rebuild webhook to: {$webhookUrl} for event: {$this->event}");

        try {
            $response = Http::withoutVerifying()->post($webhookUrl, [
                'event' => $this->event,
                'timestamp' => now()->toIso8601String(),
                'data' => $this->payload,
            ]);

            if ($response->failed()) {
                Log::error("Frontend rebuild webhook failed. Status: {$response->status()}, Response: {$response->body()}");
            } else {
                Log::info("Frontend rebuild webhook successfully dispatched.");
            }
        } catch (\Exception $e) {
            Log::error("Error dispatching frontend rebuild webhook: " . $e->getMessage());
        }
    }
}
