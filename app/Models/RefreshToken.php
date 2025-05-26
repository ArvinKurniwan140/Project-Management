<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RefreshToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public static function generateToken($userId)
    {
        // Hapus refresh token lama untuk user ini
        self::where('user_id', $userId)->delete();

        return self::create([
            'user_id' => $userId,
            'token' => bin2hex(random_bytes(64)),
            'expires_at' => Carbon::now()->addDays(14), // 14 hari
        ]);
    }
}
