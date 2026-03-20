<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CellarItem;
use App\Models\CellarTransaction;
use App\Models\Wine;
use App\Services\VinmonopoletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CellarController extends Controller
{
    public function __construct(
        private VinmonopoletService $vinmonopoletService
    ) {}

    /**
     * Hent hele vinkjelleren for innlogget bruker
     */
    public function index(Request $request): JsonResponse
    {
        $query = CellarItem::with('wine')
            ->forUser($request->user()->id)
            ->inStock();

        // Filtrering
        if ($request->has('type')) {
            $query->whereHas('wine', fn($q) => $q->byType($request->input('type')));
        }
        if ($request->has('country')) {
            $query->whereHas('wine', fn($q) => $q->byCountry($request->input('country')));
        }
        if ($request->has('search')) {
            $query->whereHas('wine', fn($q) => $q->search($request->input('search')));
        }

        // Sortering
        $sortBy = $request->input('sort', 'created_at');
        $sortDir = $request->input('dir', 'desc');
        $allowedSorts = ['created_at', 'quantity', 'purchase_price', 'rating'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } elseif ($sortBy === 'name') {
            $query->join('wines', 'cellar_items.wine_id', '=', 'wines.id')
                  ->orderBy('wines.name', $sortDir)
                 ->select('cellar_items.*);
        }

        $items = $query->paginate($request->input('per_page', 25));

        return response()->json($items);
    }

    /**
     * Legg til vin i kjelleren
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wine_id' => 'nullable|exists:wines,id',
            'vinmonopolet_id' => 'nullable|string',
            'barcode' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'location' => 'nullable|string|max:100',
            'rack' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:50',
            'personal_notes' => 'nullable|string|max:1000',
            'drink_before' => 'nullable|date',
            'drink_after' => 'nullable|date',
        ]);

        // Finn eller opprett vin
        $wine = null;
        if (!empty($validated['wine_id'])) {
            $wine = Wine::find($validated['wine_id']);
        } elseif (!empty($validated['vinmonopolet_id'])) {
            $wine = Wine::where('vinmonopolet_id', $validated['vinmonopolet_id'])->first();
            if (!$wine) {
                $productData = $this->vinmonopoletService->getProductById($validated['vinmonopolet_id']);
                if ($productData) {
                    $wine = $this->vinmonopoletService->upsertWine($productData);
                }
            }
        }

        if (!$wine) {
            return response()->json(['message' => 'Vin ikke funnet. SÃ¸k fÃ¸rst eller oppgi en gyldig vin-ID.'], 422);
        }

        // Opprett eller oppdater cellar item
        $cellarItem = CellarItem::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'wine_id' => $wine->id,
                'location' => $validated['location'] ?? null,
            ],
            [
                'quantity' => \DB::raw('quantity + ' . $validated['quantity']),
                'purchase_price' => $validated['purchase_price'] ?? $wine->price,
                'purchase_date' => $validated['purchase_date'] ?? now(),
                'rack' => $validated['rack'] ?? null,
                'shelf' => $validated['shelf'] ?? null,
                'personal_notes' => $validated['personal_notes'] ?? null,
                'drink_before' => $validated['drink_before'] ?? null,
                'drink_after' => $validated['drink_after'] ?? null,
            ]
        );

        // Logg transaksjonen
        CellarTransaction::create([
            'user_id' => $request->user()->id,
            'wine_id' => $wine->id,
            'cellar_item_id' => $cellarItem->id,
            'type' => 'in',
            'quantity' => $validated['quantity'],
            'price_per_unit' => $validated['purchase_price'] ?? $wine->price,
            'reason' => 'purchased',
        ]);

        $cellarItem->load('wine');

        return response()->json([
            'message' => "Lagt til {$validated['quantity']} flaske(r) av {$wine->name}",
            'data' => $cellarItem,
        ], 201);
    }

    /**
     * Vis en spesifikk kjeller-item
     */
    public function show(Request $request, CellarItem $cellarItem): JsonResponse
    {
        if ($cellarItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Ikke tilgang.'], 403);
        }

        $cellarItem->load(['wine', 'transactions']);

        return response()->json(['data' => $cellarItem]);
    }

    /**
     * Oppdater en kjeller-item (rating, notater, etc.)
     */
    public function update(Request $request, CellarItem $cellarItem): JsonResponse
    {
        if ($cellarItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Ikke tilgang.'], 403);
        }

        $validated = $request->validate([
            'location' => 'nullable|string|max:100',
            'rack' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:50',
            'rating' => 'nullable|integer|min:1|max:5',
            'personal_notes' => 'nullable|string|max:1000',
            'drink_before' => 'nullable|date',
            'drink_after' => 'nullable|date',
        ]);

        $cellarItem->update($validated);
        $cellarItem->load('wine');

        return response()->json([
            'message' => 'Oppdatert.',
            'data' => $cellarItem,
        ]);
    }

    /**
     * Ta ut vin fra kjelleren (drikk, gi bort, etc.)
     */
    public function removeBottle(Request $request, CellarItem $cellarItem): JsonResponse
    {
        if ($cellarItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Ikke tilgang.'], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|in:consumed,gift_given,broken,sold,other',
            'notes' => 'nullable|string|max:500',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        if ($validated['quantity'] > $cellarItem->quantity) {
            return response()->json([
                'message' => "Du har ${$cellarItem->quantity} flasker) igjen.",
            ], 422);
        }

        // Oppdater antall
        $cellarItem->decrement('quantity', $validated['quantity']);

        // Oppdater rating hvis oppgitt
        if (isset($validated['rating'])) {
            $cellarItem->update(['rating' => $validated['rating']]
NÂˆB‚ˆËÈÙÙÈ˜[œØZÜÚ›Û™[‚ˆÙ[\•˜[œØXÝ[ÛŽŽ˜Ü™X]JÂˆ	Ý\Ù\—ÚY	ÈOˆ	™\]Y\ÝO\Ù\Š
KOšYˆ	ÝÚ[™WÚY	ÈOˆ	Ù[\’][KOÚ[™WÚYˆ	ØÙ[\—Ú][WÚY	ÈOˆ	Ù[\’][KOšYˆ	Ý\IÈOˆ	ÛÝ]	Ëˆ	Ü]X[]IÈOˆ	˜[Y]YÉÜ]X[]I×Kˆ	ÜšXÙWÜ\—Ý[š]	ÈOˆ	Ù[\’][KOœ\˜Ú\ÙWÜšXÙHÏÈ	Ù[\’][KOÚ[™KOœšXÙKˆ	Ü™X\ÛÛ‰ÈOˆ	˜[Y]YÉÜ™X\ÛÛ‰×HÏÈ	ØÛÛœÝ[YY	Ëˆ	Û›Ý\ÉÈOˆ	˜[Y]YÉÛ›Ý\É×HÏÈ[ˆJNÂ‚ˆ	Ù[\’][KO›ØY
	ÝÚ[™IÊNÂ‚ˆ™]\›ˆ™\ÜÛœÙJ
KOšœÛÛŠÂˆ	ÛY\ÜØYÙIÈOˆ‘š™\›™]É˜[Y]YÉÜ]X[]I×_H›\ÚÙJŠKˆ‹ˆ	Ù]IÈOˆ	Ù[\’][KˆJNÂˆB‚ˆÊŠ‚ˆ
ˆÛ][ˆÚ™[\‹Z][H[ˆ
‹ÂˆX›XÈ[˜Ý[Ûˆ\Ý›ÞJ™\]Y\Ý	™\]Y\ÝÙ[\’][H	Ù[\’][JNˆœÛÛ”™\ÜÛœÙBˆÂˆYˆ
	Ù[\’][KO\Ù\—ÚYOOH	™\]Y\ÝO\Ù\Š
KOšY
HÂˆ™]\›ˆ™\ÜÛœÙJ
KOšœÛÛŠÉÛY\ÜØYÙIÈOˆ	ÒZÚÙH[Ø[™Ë‰×KÊNÂˆB‚ˆ	Ù[\’][KO™[]J
NÂ‚ˆ™]\›ˆ™\ÜÛœÙJ
KOšœÛÛŠÉÛY\ÜØYÙIÈOˆ	ÔÛ]]œ˜HÚš™[\™[‹‰×JNÂˆB‚ˆÊŠ‚ˆ
ˆ[˜[œØZÜÚ›ÛœÚ\ÝÜšZÚÂˆ
‹ÂˆX›XÈ[˜Ý[Ûˆ˜[œØXÝ[ÛœÊ™\]Y\Ý	™\]Y\Ý
NˆœÛÛ”™\ÜÛœÙBˆÂˆ	˜[œØXÝ[ÛœÈHÙ[\•˜[œØXÝ[ÛŽŽÚ]
	ÝÚ[™IÊBˆO™›Ü•\Ù\Š	™\]Y\ÝO\Ù\Š
KOšY
BˆO›Ü™\žJ	ØÜ™X]YØ]	Ë	Ù\ØÉÊBˆOœYÚ[˜]J	™\]Y\ÝOš[œ]
	Ü\—ÜYÙIËL
JNÂ‚ˆ™]\›ˆ™\ÜÛœÙJ
KOšœÛÛŠ	˜[œØXÝ[ÛœÊNÂˆBŸB