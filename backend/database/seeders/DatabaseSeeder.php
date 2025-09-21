<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // 必要なSeederをここで呼び出す
        $this->call([
            CountriesTableSeeder::class,
            AdminsTableSeeder::class,
            UsersTableSeeder::class,
            UsageHistoriesTableSeeder::class,
            // 他にも必要なSeederがあればここに追加
        ]);
    }
}
