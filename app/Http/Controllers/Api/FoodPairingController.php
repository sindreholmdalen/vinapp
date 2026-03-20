<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wine;
use App\Services\FoodPairingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodPairingController extends Controller
{
    public function __construct(
        private FoodPairingService $foodPairingService
    ) {}

    /**
     * Hent matanbefalinger for en spesifikk vin
     */
    public function forWine(Wine $wine): JsonResponse
    {
        $pairings = $this->foodPairingService->getPairings($wine->toArray());

        return response()->json([
            'wine' => [
                'id' => $wine->id,
                'name' => $wine->name,
                'type' => $wine->type,
            ],
            'pairings' => $pairings,
        ]);
    }

    /**
     * Søk etter viner som passer til en matrett
     */
    public function forFood(Request $request): JsonResponse
    {
        $request->validate([
            'food' => 'required|string|min:2|max:200',
        ]);

        $recommendations = $this->foodPairingService->getWineForFood(
            $request->input('food')
        );

        // Finn matchende viner i brukerens kjjeller
        $cellarMatches = [];
        if ($request->user()) {
            foreach ($recommendations as $rec) {
                $matches = $request->user()->cellarItems()
                    ->inStock()
                    ->whereHas('wine', function ($q) use ($rec) {
                        $q->where('type', 'like', '%' . $rec['type'] . '%');
                    })
                    ->with('wine')
                    ->limit(3)
                    ->get();
                if ($matches->isNotEmpty()) {
                    $cellarMatches[] = [
                        'recommendation' => $rec,
                        'from_cellar' => $matches,
                    ];
                }
            }
        }

        return response()->json([
            'food' => $request->input('food'),
            'recommendations' => $recommendations,
            'cellar_matches' => $cellarMatches,
        ]);
    }
}
