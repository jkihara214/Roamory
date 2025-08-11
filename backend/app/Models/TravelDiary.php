<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelDiary extends Model
{
    use HasFactory;
    
    protected $table = 'travel_diaries';
    
    protected $fillable = [
        'user_id',
        'latitude',
        'longitude',
        'title',
        'content',
        'visited_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'visited_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(TravelDiaryImage::class);
    }
} 