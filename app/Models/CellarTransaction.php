<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CellarTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wine_id',
        'cellar_item_id',
        'type',
        'quantity',
        'price_per_unit',
        'reason',
        'notes',
    ];

    protected $casts = [
        'price_per_unit' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wine(): BelongsTo
    {
        return $this->belongsTo(Wine::class);
    }

    public function cellarItem(): BelongsTo
    {
        return $this->belongsTo(CellarItem::class);
    }

    public function getTotalValueAttribute(): float
    {
        return $this->quantity * ($this->price_per_unit ?? 0);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeIncoming($query)
    {
        return $query->where('type', 'in');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('type', 'out');
    }
}
