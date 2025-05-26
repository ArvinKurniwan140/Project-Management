<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage users',
            'create project',
            'update project',
            'delete project',
            'assign tasks',
            'update tasks',
            'comment tasks',
            'view dashboard',
        ];

        // Create permissions only if they don't exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // Create roles only if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'api']);
        $managerRole = Role::firstOrCreate(['name' => 'Project Manager', 'guard_name' => 'api']);
        $memberRole = Role::firstOrCreate(['name' => 'Team Member', 'guard_name' => 'api']);
        // Sync permissions to roles (this will replace existing permissions)
        $adminRole->syncPermissions(Permission::all());
        
        $managerRole->syncPermissions([
            'create project',
            'update project',
            'assign tasks',
            'update tasks',
            'comment tasks',
            'view dashboard',
        ]);

        $memberRole->syncPermissions([
            'update tasks',
            'comment tasks',
            'view dashboard',
        ]);

        // Create users only if they don't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ]
        );
        if (!$admin->hasRole('Admin')) {
            $admin->assignRole('Admin');
        }

        $manager = User::firstOrCreate(
            ['email' => 'pm@gmail.com'],
            [
                'name' => 'Project Manager',
                'password' => Hash::make('password'),
            ]
        );
        if (!$manager->hasRole('Project Manager')) {
            $manager->assignRole('Project Manager');
        }

        $member = User::firstOrCreate(
            ['email' => 'tm@gmail.com'],
            [
                'name' => 'Team Member',
                'password' => Hash::make('password'),
            ]
        );
        if (!$member->hasRole('Team Member')) {
            $member->assignRole('Team Member');
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}