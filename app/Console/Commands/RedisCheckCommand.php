<?php

namespace App\Console\Commands;

use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisCheckCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:check {--fail-on-error : Return a non-zero exit code if connection fails}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check Redis connection, active driver, latency, and read/write health';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('=========================================');
        $this->info('      Redis Health & Status Check        ');
        $this->info('=========================================');

        // 1. Client Driver Inspection
        $configuredClient = config('database.redis.client', 'phpredis');
        $extLoaded = extension_loaded('redis');

        $this->newLine();
        $this->line('<fg=yellow;options=bold>1. Client Configuration</>');
        $this->table(
            ['Setting', 'Configured Value', 'Status'],
            [
                ['Active Client Driver', $configuredClient, 'OK'],
                ['ext-redis (C Extension)', $extLoaded ? 'Loaded' : 'Not Loaded', $extLoaded ? '<fg=green>Installed</>' : '<fg=yellow>Using pure-PHP Predis</>'],
                ['predis/predis', class_exists(\Predis\Client::class) ? 'Installed' : 'Missing', class_exists(\Predis\Client::class) ? '<fg=green>Available</>' : '<fg=red>Missing</>'],
            ]
        );

        // 2. Connection Settings
        $defaultHost = config('database.redis.default.host', '127.0.0.1');
        $defaultPort = config('database.redis.default.port', 6379);
        $cacheDb = config('database.redis.cache.database', 1);
        $sessionDb = config('database.redis.session.database', 2);

        $this->newLine();
        $this->line('<fg=yellow;options=bold>2. Target Connections</>');
        $this->table(
            ['Connection', 'Host:Port', 'DB Index'],
            [
                ['default (Queues/Locks)', "{$defaultHost}:{$defaultPort}", config('database.redis.default.database', 0)],
                ['cache', "{$defaultHost}:{$defaultPort}", $cacheDb],
                ['session', "{$defaultHost}:{$defaultPort}", $sessionDb],
            ]
        );

        // 3. Ping & Latency Measurement
        $this->newLine();
        $this->line('<fg=yellow;options=bold>3. Connectivity & Read/Write Test</>');

        try {
            $startTime = microtime(true);
            $redis = Redis::connection('default');
            $pong = $redis->ping();
            $latency = round((microtime(true) - $startTime) * 1000, 2);

            $this->info("✓ Connection established to {$defaultHost}:{$defaultPort} (Latency: {$latency} ms)");

            // Read / Write verification on cache connection
            $cacheRedis = Redis::connection('cache');
            $testKey = 'health_check_'.time();
            $testVal = 'ok_'.bin2hex(random_bytes(4));

            $cacheRedis->setex($testKey, 10, $testVal);
            $readVal = $cacheRedis->get($testKey);
            $cacheRedis->del($testKey);

            if ($readVal === $testVal) {
                $this->info('✓ Cache Read & Write test: PASSED (Keyspace isolated to DB '.$cacheDb.')');
            } else {
                $this->warn('! Cache Read & Write test: Data mismatch.');
            }

            // 4. Server Telemetry
            $info = $redis->info();
            $serverInfo = is_array($info) ? ($info['Server'] ?? $info) : [];
            $memoryInfo = is_array($info) ? ($info['Memory'] ?? $info) : [];
            $clientsInfo = is_array($info) ? ($info['Clients'] ?? $info) : [];

            $version = $serverInfo['redis_version'] ?? 'Unknown';
            $uptimeDays = isset($serverInfo['uptime_in_days']) ? "{$serverInfo['uptime_in_days']} days" : 'Unknown';
            $usedMemory = $memoryInfo['used_memory_human'] ?? 'Unknown';
            $connectedClients = $clientsInfo['connected_clients'] ?? 'Unknown';

            $this->newLine();
            $this->line('<fg=yellow;options=bold>4. Server Telemetry</>');
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Redis Version', $version],
                    ['Uptime', $uptimeDays],
                    ['Used Memory', $usedMemory],
                    ['Connected Clients', $connectedClients],
                ]
            );

            $this->newLine();
            $this->info('✓ Redis is operational and ready for Cache, Queue, and Session usage.');

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->newLine();
            $this->error("✕ Connection failed: {$e->getMessage()}");
            $this->line('<fg=gray>Note: If Redis is not currently running locally, ensure the Redis service is started or update REDIS_HOST/REDIS_PASSWORD in .env.</>');

            if ($this->option('fail-on-error')) {
                return self::FAILURE;
            }

            return self::SUCCESS;
        }
    }
}
