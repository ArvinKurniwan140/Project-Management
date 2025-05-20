<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
        ['email' => 'admin@example.com'],
        [
            'name' => 'Admin User',
            'password' => Hash::make('password123'),
            'profile_photo' => null,
        ]
        );
        $admin->assignRole('Admin');

        // Contoh buat user Project Manager
        $pm = User::firstOrCreate(
            ['email' => 'pm@example.com'],
            [
                'name' => 'Project Manager',
                'password' => Hash::make('password123'),
                'profile_photo' => null,
            ]
        );
        $pm->assignRole('Project Manager');

        // Contoh buat user Team Member
        $tm = User::firstOrCreate(
            ['email' => 'team@example.com'],
            [
                'name' => 'Team Member',
                'password' => Hash::make('password123'),
                'profile_photo' => null,
            ]
        );
        $tm->assignRole('Team Member');
        }
}
