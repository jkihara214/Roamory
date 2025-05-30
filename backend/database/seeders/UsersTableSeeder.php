<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'kakikukeko',
            'email' => 'kakikukeko@sample.com',
            'password' => Hash::make('kakikukeko'),
        ]);
    }
} 