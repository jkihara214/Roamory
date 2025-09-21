<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitedCountry extends Model
{
    protected $table = 'visited_countries';
    
    protected $fillable = [
        'user_id',
        'country_id',
        'diary_count',
        'source_image_path',
        'detected_info',
        'verified_at',
    ];

    protected $casts = [
        'detected_info' => 'array',
        'verified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
} 