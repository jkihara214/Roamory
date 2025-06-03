<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsageHistory extends Model
{
    protected $table = 'usage_histories';
    protected $fillable = [
        'user_id', 'feature_id',
    ];
} 