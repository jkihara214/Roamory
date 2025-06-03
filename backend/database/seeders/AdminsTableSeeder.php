<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AdminsTableSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'name' => env('ADMIN_NAME', 'administrator'),
            'email' => env('ADMIN_EMAIL', 'administrator@sample.com'),
            'password' => Hash::make(env('ADMIN_PASSWORD', 'administrator')),
        ]);
    }
} 