<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    /**
     * Tên bảng liên kết với model
     */
    protected $table = 'students';

    /**
     * Các thuộc tính có thể được gán giá trị hàng loạt
     */
    protected $fillable = [
        'name',
        'birth_date',
        'gender',
        'phone',
        'user_id',
        'class_id'
    ];

    /**
     * Định nghĩa mối quan hệ với model User
     * Một sinh viên thuộc về một người dùng
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Định nghĩa mối quan hệ với model Class
     * Một sinh viên thuộc về một lớp học
     */
    public function class()
    {
        return $this->belongsTo(Classes::class);
    }

    /**
     * Định dạng lại ngày tháng khi lấy ra
     */
    protected $casts = [
        'birth_date' => 'date',
    ];
}
