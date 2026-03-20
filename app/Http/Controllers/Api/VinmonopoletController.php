<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VinmonopoletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VinmonopoletController extends Controller
{
    public function __construct(
        private VinmonopoletService $vinmonopoletService
    ) {}

    /**
     * Søk etter produkter på Vinmonopolet
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2|max:200',
            'limit' => 'integer|min:1|max:50',
        ]);

        $results = $this->vinmonopoletService->searchProducts(
            $request->input('query'),
            $request->input('limit', 20)
        );

        return response()->json([
            'data' => $results,
            'count' => count($results),
        ]);
    }

    /**
     * Slå opp produkt via strekkode
     */
    public function barcodeLookup(Request $request): JsonResponse
    {
        $request->validate([
            'barcode' => 'required|string|min:8|max:20',
        ]);

        $product = $this->vinmonopoletService->getProductByBarcode(
            $request->input('barcode')
        );

        if (!$product) {
            return response()->json([
                'message' => 'Ingen produkt funnet for denne strekkoden.',
                'barcode' => $request->input('barcode'),
            ], 404);
        }

        return response()->json(['data' => $product]);
    }

    /**
     * Hent produktdetaljer via Vinmonopolet ID
     */
    public function show(string $productId): JsonResponse
    {
        $product = $this->vinmonopoletService->getProductById($productId);

        if (!$product) {
            return response()->json([
                'message' => 'Produkt ikke funnet.',
            ], 404);
        }

        return response()->json(['data' => $product]);
    }
}
