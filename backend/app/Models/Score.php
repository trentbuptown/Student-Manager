<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $fillable = [
        'student_id',
        'subject_id',
        'teacher_id',
        'class_id',
        'score_value',
        'score_type',
        'semester',
        'school_year'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function class()
    {
        return $this->belongsTo(Classes::class);
    }

    public function scoreDetails()
    {
        return $this->hasMany(ScoreDetail::class);
    }
} 