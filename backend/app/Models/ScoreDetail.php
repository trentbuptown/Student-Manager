<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScoreDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'score_id',
        'type',
        'score'
    ];

    public function score()
    {
        return $this->belongsTo(Score::class);
    }
} 