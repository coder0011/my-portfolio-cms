<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Spatie roles and permissions
        $this->call(RoleAndPermissionSeeder::class);

        // Create default Super Admin user
        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@admin.com',
            'password' => bcrypt('password'), // In production, this should be secure or generated
        ]);

        $admin->assignRole('Super Admin');
    }
}
