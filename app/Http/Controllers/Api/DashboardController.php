<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CellarItem;
use App\Models\CellarTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Hent dashboard-statistikk for vinkjelleren
     */
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Totalt antall flasker
        $totalBottles = CellarItem::forUser($userId)->inStock()->sum('quantity');

        // Totalt antall unike viner
        $uniqueWines = CellarItem::forUser($userId)->inStock()->distinct('wine_id')->count('wine_id');

        // Total verdi (basert på nåvårende Vinmonopolet-pris)
        $currentValue = CellarItem::forUser($userId)
            ->inStock()
            ->join('wines', 'cellar_items.wine_id', '=', 'wines.id')
            ->selectRaw('SUM(cellar_items.quantity * COALESCE(wines.price, cellar_items.purchase_price, 0)) as total')
            ->value('total') ?? 0;

        // Total innkjøpsverdi
        $purchaseValue = CellarItem::forUser($userId)
            ->inStock()
            ->selectRaw('SUM quantity * COALESCE(purchase_price, 0)) as total')
            ->value('total') ?? 0;

        // Fordeling per vintype
        $typeDistribution = CellarItem::forUser($userId)
            ->inStock()
            ->join('wines', 'cellar_items.wine_id', '=', 'wines.id')
            ->groupBy('wines.type')
            ->selectRaw('wines.type, SUM(cellar_items.quantity) as count')
            ->orderByDesc('count')
            ->get();

        // Fordeling per land
        $countryDistribution = CellarItem::forUser($userId)
            ->inStock()
            ->join('wines', 'cellar_items.wine_id', '=', 'wines.id')
            ->groupBy('wines.country')
            ->selectRaw('wines.country, SUM(cellar_items.quantity) as count')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Siste transaksjoner
        $recentTransactions = CellarTransaction::with('wine')
            ->forUser($userId)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Mánedsstatistikk (siste 12 måneder)
        $monthlyStats = CellarTransaction::forUser($userId)
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"), 'type')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, type, SUM quantity) as count, SUM quantity * COALESCE(price_per_unit, 0)) as value")
            ->orderBy('month')
            ->get()
            ->groupBy('month');

        // Topp-viner (mest på lager)
        $topWines = CellarItem::with('wine')
            ->forUser($userId)
            ->inStock()
            ->orderByDesc('quantity')
            ->limit(5)
            ->get();

        // Gjennomsnittlig flaskepris
        $avgPrice = CellarItem::forUser($userId)
            ->inStock()
            ->where('purchase_price', '>', 0)
            ->avg('purchase_price') ?? 0;

        return response()->json([
            'total_bottles' => (int) $totalBottles,
            'unique_wines' => (int) $uniqueWines,
            'current_value' => round((float) $currentValue, 2),
            'purchase_value' => round((float) $purchaseValue, 2),
            'value_change' => round((float) $currentValue - (float) $purchaseValue, 2),
            'average_price' => round((float) $avgPrice, 2),
            'type_distribution' => $typeDistribution,
            'country_distribution' => $countryDistribution,
            'recent_transactions' => $recentTransactions,
            'monthly_stats' => $monthlyStats,
            'top_wines' => $topWines,
        ]);
    }

    /**
     * Hent verdi-oversikt over tid
     */
    public function valueHistory(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $months = $request->input('months', 12);

        // Kalkuler verdien per måned basert på transaksjoner
        $history = [];
        $runningValue = 0;
        $runningBottles = 0;

        $transactions = CellarTransaction::forUser($userId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->orderBy('created_at')
            ->get()
            ->groupBy(fn($t) => $t->created_at->format('Y-m'));

        foreach ($transactions as $month => $monthTransactions) {
            foreach ($monthTransactions as $t) {
                $value = $t->quantity * ($t->price_per_unit ?? 0);
                if ($t->type === 'in') {
                    $runningValue += $value;
                    $runningBottles += $t->quantity;
                } else {
                    $runningValue -= $value;
                    $runningBottles -= $t->quantity;
                }
            }

            $history[] = [
                'month' => $month,
                'value' => round(max(0, $runningValue), 2),
                'bottles' => max(0, $runningBottles),
            ];
        }

        return response()->json(['data' => $history]);
    }
}
