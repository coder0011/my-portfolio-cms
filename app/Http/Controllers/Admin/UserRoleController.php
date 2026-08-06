<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    /**
     * Display User and Role Management page.
     */
    public function index(): Response
    {
        Gate::authorize('users.manage');

        $users = User::with(['roles', 'permissions'])
            ->orderBy('name', 'asc')
            ->get();

        $roles = Role::with('permissions')
            ->orderBy('name', 'asc')
            ->get();

        $permissions = Permission::orderBy('name', 'asc')->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created User in storage.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        Gate::authorize('users.manage');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'bio' => 'nullable|string',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'bio' => $validated['bio'] ?? null,
        ]);

        if (! empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        ActivityLogger::log('USER_CREATED', "Created user account '{$user->name}'");

        return redirect()->back()->with('success', 'User created successfully!');
    }

    /**
     * Update user details and roles.
     */
    public function updateUser(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('users.manage');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'bio' => 'nullable|string',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'bio' => $validated['bio'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // Keep at least one Super Admin mapping or check if we are un-assigning ourselves
        if ($user->id === auth()->id() && ! in_array('Super Admin', $validated['roles'] ?? [])) {
            return redirect()->back()->with('error', 'You cannot remove the Super Admin role from yourself!');
        }

        $user->syncRoles($validated['roles'] ?? []);

        ActivityLogger::log('USER_UPDATED', "Updated user account details of '{$user->name}'");

        return redirect()->back()->with('success', 'User updated successfully!');
    }

    /**
     * Delete a user.
     */
    public function destroyUser(User $user): RedirectResponse
    {
        Gate::authorize('users.manage');

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account!');
        }

        $name = $user->name;
        $user->delete();

        ActivityLogger::log('USER_DELETED', "Deleted user account '{$name}'");

        return redirect()->back()->with('success', 'User deleted successfully!');
    }

    /**
     * Store a newly created Role.
     */
    public function storeRole(Request $request): RedirectResponse
    {
        Gate::authorize('users.manage');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        ActivityLogger::log('ROLE_CREATED', "Created system role '{$role->name}'");

        return redirect()->back()->with('success', 'Role created successfully!');
    }

    /**
     * Update a Role and its permissions.
     */
    public function updateRole(Request $request, Role $role): RedirectResponse
    {
        Gate::authorize('users.manage');

        // Prevent renaming the Super Admin role
        if ($role->name === 'Super Admin') {
            $validated = $request->validate([
                'permissions' => 'nullable|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);
        } else {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
                'permissions' => 'nullable|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            $role->update(['name' => $validated['name']]);
        }

        $role->syncPermissions($validated['permissions'] ?? []);

        ActivityLogger::log('ROLE_UPDATED', "Updated system role '{$role->name}'");

        return redirect()->back()->with('success', 'Role updated successfully!');
    }

    /**
     * Delete a Role.
     */
    public function destroyRole(Role $role): RedirectResponse
    {
        Gate::authorize('users.manage');

        if ($role->name === 'Super Admin') {
            return redirect()->back()->with('error', 'The Super Admin role cannot be deleted!');
        }

        $name = $role->name;
        $role->delete();

        ActivityLogger::log('ROLE_DELETED', "Deleted system role '{$name}'");

        return redirect()->back()->with('success', 'Role deleted successfully!');
    }
}
