<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function cellarItems(): HasMany
    {
        return $this->hasMany(CellarItem::class);
    }

    public function cellarTransactions(): HasMany
    {
        return $this->hasMany(CellarTransaction::class);
    }

    /**
     * Hent total verdi av vinkjelleren
     */
    public function getCellarValueAttribute(): float
    {
        return $this->cellarItems()
            ->inStock()
            ->join('wines', 'cellar_items.wine_id', '=', 'wines.id')
            ->selectRaw('SUM(cellar_items.quantity * COALESCE(wines.price, cellar_items.purchase_price, 0)) as total')
            ->value('total') ?? 0;
    }

    /**
     * Hent totalt antall flasker
     */
    public function getTotalBottlesAttribute(): int
    {
        return (int) $this->cellarItems()->inStock()->sum('quantity');
    }
}
