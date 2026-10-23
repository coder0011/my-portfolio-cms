<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PostAiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_ai_endpoints(): void
    {
        $this->postJson(route('admin.posts.ai.seo'), [
            'title' => 'Test Post',
        ])->assertUnauthorized();

        $this->postJson(route('admin.posts.ai.editorial'), [
            'action' => 'outline',
            'title' => 'Test Post',
        ])->assertUnauthorized();
    }

    public function test_users_without_permission_cannot_access_ai_endpoints(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson(route('admin.posts.ai.seo'), [
            'title' => 'Test Post',
        ])->assertForbidden();
    }

    public function test_ai_seo_validates_required_title(): void
    {
        Permission::create(['name' => 'posts.create']);
        $user = User::factory()->create();
        $user->givePermissionTo('posts.create');

        $this->actingAs($user)->postJson(route('admin.posts.ai.seo'), [
            'title' => '',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    public function test_ai_editorial_validates_action(): void
    {
        Permission::create(['name' => 'posts.create']);
        $user = User::factory()->create();
        $user->givePermissionTo('posts.create');

        $this->actingAs($user)->postJson(route('admin.posts.ai.editorial'), [
            'action' => 'invalid-action',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['action']);
    }
}
