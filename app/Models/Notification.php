<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'content', 'is_read', 'notification_type', 'source_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
