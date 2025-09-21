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
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'sasisuseso',
            'email' => 'sasisuseso@sample.com',
            'password' => Hash::make('sasisuseso'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'tatituteto',
            'email' => 'tatituteto@sample.com',
            'password' => Hash::make('tatituteto'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'naninuneno',
            'email' => 'naninuneno@sample.com',
            'password' => Hash::make('naninuneno'),
        ]);

        User::create([
            'name' => 'hahihuheho',
            'email' => 'hahihuheho@sample.com',
            'password' => Hash::make('hahihuheho'),
        ]);
    }
} 