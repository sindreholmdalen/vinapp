import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { searchVinmonopolet, addToCellar } from '@/Services/api';
import toast from 'react-hot-toast';

function SearchResultCard({ product, onAdd }) {
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const handleAdd = async () => {
        setAdding(true);
        try {
            await onAdd(product, quantity);
            setQuantity(1);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-14 h-20 object-contain rounded flex-shrink-0" />
                ) : (
                    <div className="w-14 h-20 bg-wine-100 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="h-8 w-8 text-wine-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                        </svg>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.producer}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {product.type && <span className="text-xs px-2 py-0.5 rounded-full bg-wine-100 text-wine-700">{product.type}</span>}
                        {product.year && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.year}</span>}
                        {product.country && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.country}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-wine-700">
                            {product.price ? `${Number(product.price).toLocaleString('nb-NO')} kr` : 'Ukjent pris'}
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="text-sm rounded-lg border-gray-300 py-1 px-2"
                            >
                                {[1, 2, 3, 4, 5, 6, 12].map(n => (
                                    <option key={n} value={n}>{n} fl.</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAdd}
                                disabled={adding}
                                className="btn-wine text-sm py-1.5 px-4"
                            >
                                {adding ? 'Legger til...' : 'Legg til'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WineSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim() || query.trim().length < 2) {
            toast.error('Skriv minst 2 tegn for C� søke');
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const response = await searchVinmonopolet(query.trim());
            setResults(response.data.data || []);
            if (response.data.data?.length === 0) {
                toast('Ingen treff. Prøv et annet søkeord.');
            }
        } catch (err) {
            toast.error('Søket feilet. Sjekk API-nøkkelen.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCellar = async (product, quantity) => {
        try {
            await addToCellar({
                vinmonopolet_id: product.vinmonopolet_id,
                quantity,
                purchase_price: product.price,
                purchase_date: new Date().toISOString().split('T')[0],
            });
            toast.success(`${quantity} flaske(r) av ${product.name} lagt til!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Kunne ikke legge til');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Søk vin" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Søk på Vinmonopolet</h1>
                <p className="text-gray-500 mt-1">Finn vin og legg den til i kjelleren din</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Søk etter vin, produsent, land..."
                    className="input-field flex-1"
                    autoFocus
                />
                <button type="submit" disabled={loading} className="btn-wine px-6">
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                        'Søk'
                    )}
                </button>
            </form>

            {/* Hurtigsøk-forslag */}
            {!searched && (
                <div className="mb-8">
                    <p className="text-sm text-gray-400 mb-3">Populære søk:</p>
                    <div className="flex flex-wrap gap-2">
                        {['Barolo', 'Champagne', 'Chablis', 'Riesling', 'Ripasso', 'Brunello', 'Sancerre', 'Châteauneuf'].map((term) => (
                            <button
                                key={term}
                                onClick={() => { setQuery(term); }}
                                className="text-sm px-3 py-1.5 rounded-full bg-wine-100 text-wine-700 hover:bg-wine-200 transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Resultater */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-700" />
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">{results.length} treff</p>
                    {results.map((product, index) => (
                        <SearchResultCard
                            key={product.vinmonopolet_id || index}
                            product={product}
                            onAdd={handleAddToCellar}
                        />
                    ))}
                </div>
            ) : searched ? (
                <div className="text-center py-16">
                    <p className="text-gray-500">Ingen resultater for "{query}"</p>
                    <p className="text-sm text-gray-400 mt-2">Prøv med et annet søkeord eller scan strekkoden</p>
                </div>
            ) : null}
        </AuthenticatedLayout>
    );
}
