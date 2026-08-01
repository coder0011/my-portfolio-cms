<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'posts.create',
            'posts.edit',
            'posts.delete',
            'posts.publish',
            'revisions.restore',
            'comments.approve',
            'comments.delete',
            'subscribers.manage',
            'logs.view',
            'educations.manage',
            'experiences.manage',
            'projects.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and assign permissions

        // Super Admin (all permissions)
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        // Super Admins typically bypass permission checks in Gates, but we can assign all for safety
        $superAdminRole->syncPermissions(Permission::all());

        // Editor
        $editorRole = Role::firstOrCreate(['name' => 'Editor']);
        $editorRole->syncPermissions([
            'posts.create',
            'posts.edit',
            'posts.delete',
            'posts.publish',
            'revisions.restore',
            'logs.view',
        ]);

        // Moderator
        $moderatorRole = Role::firstOrCreate(['name' => 'Moderator']);
        $moderatorRole->syncPermissions([
            'comments.approve',
            'comments.delete',
        ]);
    }
}
