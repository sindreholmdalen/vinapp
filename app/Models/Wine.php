<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wine extends Model
{
    use HasFactory;

    protected $fillable = [
        'vinmonopolet_id',
        'barcode',
        'name',
        'producer',
        'country',
        'region',
        'sub_region',
        'type',
        'grape_variety',
        'year',
        'alcohol_percentage',
        'price',
        'volume_ml',
        'taste_note',
        'description',
        'image_url',
        'product_url',
        'food_pairings',
        'sweetness',
        'freshness',
        'tannins',
        'fullness',
        'bitterness',
        'color',
        'aroma',
        'taste',
        'storage_potential',
    ];

    protected $casts = [
        'food_pairings' => 'array',
        'price' => 'decimal:2',
        'alcohol_percentage' => 'decimal:1',
        'volume_ml' => 'decimal:1',
        'year' => 'integer',
    ];

    public function cellarItems(): HasMany
    {
        return $this->hasMany(CellarItem::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CellarTransaction::class);
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2, ',', ' ') . ' kr';
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('producer', 'like', "%{$term}%")
              ->orWhere('country', 'like', "%{$term}%")
              ->orWhere('region', 'like', "%{$term}%")
              ->orWhere('grape_variety', 'like', "%{$term}%")
              ->orWhere('type', 'like', "%{$term}%");
        });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCountry($query, string $country)
    {
        return $query->where('country', $country);
    }

    public function scopeByYear($query, int $year)
    {
        return $query->where('year', $year);
    }
}
