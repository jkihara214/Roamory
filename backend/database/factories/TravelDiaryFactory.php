<?php

namespace Database\Factories;

use App\Models\TravelDiary;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TravelDiaryFactory extends Factory
{
    protected $model = TravelDiary::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'latitude' => $this->faker->latitude(-90, 90),
            'longitude' => $this->faker->longitude(-180, 180),
            'title' => $this->faker->sentence(3),
            'content' => $this->faker->paragraphs(2, true),
        ];
    }
} 