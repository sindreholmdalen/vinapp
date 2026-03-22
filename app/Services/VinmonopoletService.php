<?php

namespace App\Services;

use App\Models\Wine;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VinmonopoletService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.vinmonopolet.base_url', 'https://apis.vinmonopolet.no');
        $this->apiKey = config('services.vinmonopolet.api_key', '');
    }

    /**
     * Søk etter produkter på Vinmonopolet
     */
    public function searchProducts(string $query, int $limit = 20): array
    {
        $cacheKey = "vinmonopolet_search_" . md5($query . $limit);

        return Cache::remember($cacheKey, 300, function () use ($query, $limit) {
            try {
                $response = Http::withHeaders([
                    'Ocp-Apim-Subscription-Key' => $this->apiKey,
                    'Accept' => 'application/json',
                ])->get("{$this->baseUrl}/products/v0/details-normal", [
                    'maxResults' => $limit,
                    'query' => $query,
                ]);

                if ($response->successful()) {
                    return $this->transformProducts($response->json());
                }

                Log::warning('Vinmonopolet API search failed', [
                    'status' => $response->status(),
                    'query' => $query,
                ]);

                return [];
            } catch (\Exception $e) {
                Log::error('Vinmonopolet API error', ['message' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Hent produkt via strekkode (EAN/GTIN)
     */
    public function getProductByBarcode(string $barcode): ?array
    {
        $cacheKey = "vinmonopolet_barcode_{$barcode}";

        return Cache::remember($cacheKey, 3600, function () use ($barcode) {
            try {
                // Søk via GTIN/barcode
                $response = Http::withHeaders([
                    'Ocp-Apim-Subscription-Key' => $this->apiKey,
                    'Accept' => 'application/json',
                ])->get("{$this->baseUrl}/products/v0/details-normal", [
                    'maxResults' => 1,
                    'query' => $barcode,
                ]);

                if ($response->successful()) {
                    $products = $this->transformProducts($response->json());
                    return !empty($products) ? $products[0] : null;
                }

                return null;
            } catch (\Exception $e) {
                Log::error('Vinmonopolet barcode lookup error', [
                    'barcode' => $barcode,
                    'message' => $e->getMessage(),
                ]);
                return null;
            }
        });
    }

    /**
     * Hent produkt via Vinmonopolet produkt-ID
     */
    public function getProductById(string $productId): ?array
    {
        $cacheKey = "vinmonopolet_product_{$productId}";

        return Cache::remember($cacheKey, 3600, function () use ($productId) {
            try {
                $response = Http::withHeaders([
                    'Ocp-Apim-Subscription-Key' => $this->apiKey,
                    'Accept' => 'application/json',
                ])->get("{$this->baseUrl}/products/v0/details-normal", [
                    'maxResults' => 1,
                    'productId' => $productId,
                ]);

                if ($response->successful()) {
                    $products = $this->transformProducts($response->json());
                    return !empty($products) ? $products[0] : null;
                }

                return null;
            } catch (\Exception $e) {
                Log::error('Vinmonopolet product lookup error', [
                    'productId' => $productId,
                    'message' => $e->getMessage(),
                ]);
                return null;
            }
        });
    }

    /**
     * Hent oppdaterte priser for produkter i kjelleren
     */
    public function refreshPrices(array $vinmonopoletIds): array
    {
        $updated = [];

        foreach (array_chunk($vinmonopoletIds, 10) as $chunk) {
            foreach ($chunk as $id) {
                $product = $this->getProductById($id);
                if ($product && isset($product['price'])) {
                    Wine::where('vinmonopolet_id', $id)->update([
                        'price' => $product['price'],
                    ]);
                    $updated[] = $id;
                }
            }
        }

        return $updated;
    }

    /**
     * Opprett eller oppdater en vin fra Vinmonopolet-data
     */
    public function upsertWine(array $productData): Wine
    {
        return Wine::updateOrCreate(
            ['vinmonopolet_id' => $productData['vinmonopolet_id'] ?? null],
            $productData
        );
    }

    /**
     * Transformer Vinmonopolet API-respons til vårt format
     */
    private function transformProducts(array $apiResponse): array
    {
        $products = [];

        foreach ($apiResponse as $item) {
            $products[] = [
                'vinmonopolet_id' => $item['basic']['productId'] ?? null,
                'barcode' => $item['basic']['productId'] ?? null,
                'name' => $item['basic']['productShortName'] ?? $item['basic']['productLongName'] ?? 'Ukjent',
                'producer' => $item['basic']['producerName'] ?? null,
                'country' => $item['origins']['origin']['country'] ?? null,
                'region' => $item['origins']['origin']['region'] ?? null,
                'sub_region' => $item['origins']['origin']['subRegion'] ?? null,
                'type' => $item['classification']['productTypeName'] ?? null,
                'grape_variety' => $this->extractGrapes($item),
                'year' => isset($item['basic']['vintage']) ? (int) $item['basic']['vintage'] : null,
                'alcohol_percentage' => isset($item['basic']['alcoholContent']) ? (float) $item['basic']['alcoholContent'] : null,
                'price' => isset($item['prices'][0]['salesPrice']) ? (float) $item['prices'][0]['salesPrice'] : null,
                'volume_ml' => isset($item['basic']['volume']) ? (float) $item['basic']['volume'] : null,
                'description' => $item['description']['characteristics']['colour'] ?? null,
                'image_url' => $item['basic']['productImage']['url'] ?? null,
                'product_url' => "https://www.vinmonopolet.no/p/" . ($item['basic']['productId'] ?? ''),
                'food_pairings' => $this->extractFoodPairings($item),
                'sweetness' => $item['description']['characteristics']['sweetness'] ?? null,
                'freshness' => $item['description']['characteristics']['freshness'] ?? null,
                'tannins' => $item['description']['characteristics']['tannins'] ?? null,
                'fullness' => $item['description']['characteristics']['fullness'] ?? null,
                'bitterness' => $item['description']['characteristics']['bitterness'] ?? null,
                'color' => $item['description']['characteristics']['colour'] ?? null,
                'aroma' => $item['description']['characteristics']['odour'] ?? null,
                'taste' => $item['description']['characteristics']['taste'] ?? null,
                'storage_potential' => $item['properties']['storagePotential'] ?? null,
            ];
        }

        return $products;
    }

    private function extractGrapes(array $item): ?string
    {
        $rawMaterials = $item['rawMaterial']['ingredients'] ?? [];
        $grapes = array_map(fn($r) => $r['readableValue'] ?? '', $rawMaterials);
        $filtered = array_filter($grapes);
        return !empty($filtered) ? implode(', ', $filtered) : null;
    }

    private function extractFoodPairings(array $item): ?array
    {
        $pairings = $item['description']['recommendedFood'] ?? [];
        if (empty($pairings)) {
            return null;
        }
        return array_map(fn($p) => $p['foodDesc'] ?? $p, $pairings);
    }
}
