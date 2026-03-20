import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { getCellar, removeFromCellar } from '@/Services/api';
import toast from 'react-hot-toast';

function WineCard({ item, onRemove }) {
    const wine = item.wine;
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        if (!confirm(`Ta ut 1 flaske av ${wine.name}?`)) return;
        setRemoving(true);
        try {
            await onRemove(item.id);
        } finally {
            setRemoving(false);
        }
    };

    const typeColors = {
        'Rødvin': 'bg-red-100 text-red-800',
        'Hvitvin': 'bg-yellow-100 text-yellow-800',
        'Rosévin': 'bg-pink-100 text-pink-800',
        'Musserende': 'bg-emerald-100 text-emerald-800',
        'Dessertvin': 'bg-purple-100 text-purple-800',
    };

    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {wine.image_url ? (
                    <img
                        src={wine.image_url}
                        alt={wine.name}
                        className="w-16 h-24 object-contain rounded flex-shrink-0"
                    />
                ) : (
                    <div className="w-16 h-24 bg-wine-100 dark:bg-wine-900 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="h-8 w-8 text-wine-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                        </svg>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {wine.name}
                            </h3>
                            <p className="text-sm text-gray-500">{wine.producer}</p>
                        </div>
                        <span className="text-lg font-bold text-wine-700 ml-2">{item.quantity}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {wine.type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[wine.type] || 'bg-gray-100 text-gray-800'}`}>
                                {wine.type}
                            </span>
                        )}
                        {wine.year && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {wine.year}
                            </span>
                        )}
                        {wine.country && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {wine.country}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="text-sm text-gray-500">
                            {wine.price && <span>{Number(wine.price).toLocaleString('nb-NO')} kr</span>}
                            {item.rating && (
                                <span className="ml-2">
                                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/cellar/${item.id}`}
                                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                                Detaljer
                            </Link>
                            <button
                                onClick={handleRemove}
                                disabled={removing}
                                className="text-xs px-3 py-1.5 rounded-lg bg-wine-100 hover:bg-wine-200 text-wine-700 transition-colors disabled:opacity-50"
                            >
                                {removing ? '...' : 'Ta ut'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CellarIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const loadCellar = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, sort: sortBy, dir: 'desc' };
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;

            const response = await getCellar(params);
            setItems(response.data.data);
            setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total,
            });
        } catch (err) {
            toast.error('Kunne ikke laste vinkjelleren');
        } finally {
            setLoading(false);
        }
    }, [page, search, typeFilter, sortBy]);

    useEffect(() => {
        loadCellar();
    }, [loadCellar]);

    const handleRemove = async (itemId) => {
        try {
            await removeFromCellar(itemId, { quantity: 1, reason: 'consumed' });
            toast.success('Flaske tatt ut av kjelleren');
            loadCellar();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Noe gikk galt');
        }
    };

    // Debounce search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    return (
        <AuthenticatedLayout>
            <Head title="Vinkjeller" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vinkjelleren</h1>
                    <p className="text-gray-500 mt-1">
                        {pagination ? `${pagination.total} flasker totalt` : 'Laster...'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/scanner" className="btn-wine flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        </svg>
                        Scan
                    </Link>
                    <Link href="/search" className="btn-wine-outline flex items-center gap-2">
                        + Legg til
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Sør i kjelleren..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="input-field flex-1"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="input-field sm:w-40"
                >
                    <option value="">Alle typer</option>
                    <option value="Rødvin">Rødvin</option>
                    <option value="Hvitvin">Hvitvin</option>
                    <option value="Rosévin">Rosévin</option>
                    <option value="Musserende">Musserende</option>
                    <option value="Dessertvin">Dessertvin</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field sm:w-44"
                >
                    <option value="created_at">Nyligst lagt til</option>
                    <option value="name">Navn</option>
                    <option value="quantity">Antall</option>
                    <option value="purchase_price">Pris</option>
                    <option value="rating">Rating</option>
                </select>
            </div>

            {/* Wine list */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-700" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16">
                    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Tom kjeller</h3>
                    <p className="mt-2 text-gray-500">Begyn� med á scanne eller søke opp en vin!</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link href="/scanner" className="btn-wine">Scan strekkode</Link>
                        <Link href="/search" className="btn-wine-outline">Søk etter vin</Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item) => (
                            <WineCard key={item.id} item={item} onRemove={handleRemove} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.lastPage > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Forrige
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-500">
                                Side {pagination.currentPage} av {pagination.lastPage}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(pagination.lastPage, page + 1))}
                                disabled={page >= pagination.lastPage}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Neste
                            </button>
                        </div>
                    )}
                </>
            )}
        </AuthenticatedLayout>
    );
}
