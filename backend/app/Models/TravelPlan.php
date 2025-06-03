<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TravelPlan extends Model
{
    protected $table = 'travel_plans';
    protected $fillable = [
        'user_id',
        'country_id',
        'start_date',
        'end_date',
        'budget',
        'must_go_places',
        'plan_json',
    ];
    protected $casts = [
        'must_go_places' => 'array',
        'plan_json' => 'array',
    ];
} 