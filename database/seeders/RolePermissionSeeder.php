<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Buat permission
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

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Buat role
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $pm = Role::firstOrCreate(['name' => 'Project Manager']);
        $tm = Role::firstOrCreate(['name' => 'Team Member']);

        // Assign permission ke role Admin
        $admin->syncPermissions([
            'manage users',
            'create project',
            'update project',
            'delete project',
            'comment tasks',
            'view dashboard',
        ]);

        // Assign permission ke role Project Manager
        $pm->syncPermissions([
            'create project',
            'update project',
            'assign tasks',
            'update tasks',
            'comment tasks',
            'view dashboard',
        ]);

        // Assign permission ke role Team Member
        $tm->syncPermissions([
            'update tasks',
            'comment tasks',
            'view dashboard',
        ]);
    }
}
