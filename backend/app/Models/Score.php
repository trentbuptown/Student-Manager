<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $fillable = [
        'student_id',
        'subject_id'
    ];

    protected $appends = ['average_score', 'classification', 'pass_status'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function scoreDetails()
    {
        return $this->hasMany(ScoreDetail::class);
    }
    
    public function getAverageScoreAttribute()
    {
        $details = $this->scoreDetails;
        
        if ($details->isEmpty()) {
            return null;
        }
        
        $weights = [
            'mieng' => 1,
            '15_phut' => 1,
            '1_tiet' => 2,
            'giua_ky' => 2,
            'cuoi_ky' => 3
        ];
        
        $totalScore = 0;
        $totalWeight = 0;
        
        foreach ($details as $detail) {
            $type = $detail->type;
            $weight = $weights[$type] ?? 1; // Mặc định trọng số 1 nếu loại không được định nghĩa
            
            $totalScore += $detail->score * $weight;
            $totalWeight += $weight;
        }
        
        if ($totalWeight === 0) {
            return null;
        }
        
        return round($totalScore / $totalWeight, 2);
    }
    
    public function getClassificationAttribute()
    {
        $average = $this->getAverageScoreAttribute();
        
        if ($average === null) {
            return null;
        }
        
        if ($average >= 8.5) {
            return 'Giỏi';
        } elseif ($average >= 7.0) {
            return 'Khá';
        } elseif ($average >= 5.0) {
            return 'Trung bình';
        } elseif ($average >= 3.5) {
            return 'Yếu';
        } else {
            return 'Kém';
        }
    }
    
    public function getPassStatusAttribute()
    {
        $average = $this->getAverageScoreAttribute();
        
        if ($average === null) {
            return null;
        }
        
        return $average >= 5.0 ? 'Đạt' : 'Không đạt';
    }
} 