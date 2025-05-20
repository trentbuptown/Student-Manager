<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherSubject extends Model
{
    protected $table = 'teacher_subject';

    protected $fillable = [
        'teacher_id',
        'subject_id',
        'class_id',
        'lesson_period',
        'day_of_week',
        'room',
        'semester',
        'school_year'
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function class()
    {
        return $this->belongsTo(Classes::class);
    }
} 