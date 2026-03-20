<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CellarItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wine_id',
        'quantity',
        'purchase_price',
        'purchase_date',
        "location",
        'rack',
        "shelf",
        'rating',
        'personal_notes',
        'drink_before',
        'drink_after',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'purchase_date' => 'date',
        'drink_before' => 'date',
        'drink_after' => 'date',
        'quantity' => 'integer',
        'rating' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wine(): BelongsTo
    {
        return $this->belongsTo(Wine::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CellarTransaction::class);
    }

    public function getCurrentValueAttribute(): float
    {
        return $this->quantity * ($this->wine->price ?? $this->purchase_price ?? 0);
    }

    public function getPurchaseValueAttribute(): float
    {
        return $this->quantity * ($this->purchase_price ?? 0);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }
}
