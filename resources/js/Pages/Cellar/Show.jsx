import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { getCellarItem, updateCellarItem, removeFromCellar, getPairingsForWine } from '@/Services/api';
import toast from 'react-hot-toast';

export default function CellarShow({ id }) {
    const [item, setItem] = useState(null);
    const [pairings, setPairings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        try {
            const response = await getCellarItem(id);
            setItem(response.data.data);
            setEditForm({
                rating: response.data.data.rating || '',
                personal_notes: response.data.data.personal_notes || '',
                location: response.data.data.location || '',
                rack: response.data.data.rack || '',
                shelf: response.data.data.shelf || '',
            });

            // Last matanbefalinger
            if (response.data.data.wine_id) {
                const pairingResponse = await getPairingsForWine(response.data.data.wine_id);
                setPairings(pairingResponse.data.pairings);
            }
        } catch (err) {
            toast.error('Kunne ikke laste vindetaljer');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await updateCellarItem(id, editForm);
            toast.success('Oppdatert!');
            setEditing(false);
            loadItem();
        } catch (err) {
            toast.error('Kunne ikke oppdatere');
        }
    };

    const handleRemoveBottle = async () => {
        if (!confirm('Ta ut 1 flaske?')) return;
        try {
            await removeFromCellar(id, { quantity: 1, reason: 'consumed' });
            toast.success('Flaske tatt ut');
            loadItem();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Feil');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <Head title="Laster..." />
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-700" />
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!item) {
        return (
            <AuthenticatedLayout>
                <Head title="Ikke funnet" />
                <p className="text-gray-500">Fant ikke denne vinen i kjelleren.</p>
            </AuthenticatedLayout>
        );
    }

    const wine = item.wine;

    return (
        <AuthenticatedLayout>
            <Head title={wine.name} />

            <Link href="/cellar" className="text-wine-600 hover:text-wine-800 text-sm mb-4 inline-flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Tilbake til kjelleren
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Main info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-start gap-6">
                            {wine.image_url ? (
                                <img src={wine.image_url} alt={wine.name} className="w-24 h-36 object-contain rounded" />
                            ) : (
                                <div className="w-24 h-36 bg-wine-100 rounded flex items-center justify-center">
                                    <svg className="h-12 w-12 text-wine-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{wine.name}</h1>
                                <p className="text-gray-500 mt-1">{wine.producer}</p>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                                    {wine.type && <div><span className="text-gray-400">Type:</span> <span className="text-gray-700 dark:text-gray-300">{wine.type}</span></div>}
                                    {wine.year && <div><span className="text-gray-400">Årgang:</span> <span className="text-gray-700 dark:text-gray-300">{wine.year}</span></div>}
                                    {wine.country && <div><span className="text-gray-400">Land:</span> <span className="text-gray-700 dark:text-gray-300">{wine.country}</span></div>}
                                    {wine.region && <div><span className="text-gray-400">Region:</span> <span className="text-gray-700 dark:text-gray-300">{wine.region}</span></div>}
                                    {wine.grape_variety && <div><span className="text-gray-400">Drue:</span> <span className="text-gray-700 dark:text-gray-300">{wine.grape_variety}</span></div>}
                                    {wine.alcohol_percentage && <div><span className="text-gray-400">Alkohol:</span> <span className="text-gray-700 dark:text-gray-300">{wine.alcohol_percentage}%</span></div>}
                                    {wine.volume_ml && <div><span className="text-gray-400">Volum:</span> <span className="text-gray-700 dark:text-gray-300">{wine.volume_ml} ml</span></div>}
                                    {wine.price && <div><span className="text-gray-400">Pris:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">{Number(wine.price).toLocaleString('nb-NO')} kr</span></div>}
                                </div>

                                {wine.product_url && (
                                    <a href={wine.product_url} target="_blank" rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1 mt-4 text-sm text-wine-600 hover:text-wine-800">
                                        Se på Vinmonopolet.no
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Smaksprofil */}
                    {(wine.aroma || wine.taste || wine.color) && (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Smaksprofil</h2>
                            <div className="space-y-2 text-sm">
                                {wine.color && <p><span className="text-gray-400">Farge:</span> {wine.color}</p>}
                                {wine.aroma && <p><span className="text-gray-400">Aroma:</span> {wine.aroma}</p>}
                                {wine.taste && <p><span className="text-gray-400">Smak:</span> {wine.taste}</p>}
                            </div>
                        </div>
                    )}

                    {/* Matpairing */}
                    {pairings && (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Passer til</h2>
                            {pairings.vinmonopolet_suggestions?.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Fra Vinmonopolet:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {pairings.vinmonopolet_suggestions.map((food, i) => (
                                            <span key={i} className="text-sm px-3 py-1 rounded-full bg-wine-100 text-wine-700">{food}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {pairings.general_pairings?.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Generelle anbefalinger:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {pairings.general_pairings.map((food, i) => (
                                            <span key={i} className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">{food}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {pairings.tips && <p className="text-sm text-gray-500 mt-2">{pairings.tips}</p>}
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div><span className="text-gray-400">Temperatur:</span> {pairings.temperature}</div>
                                <div><span className="text-gray-400">Glass:</span> {pairings.glass_type}</div>
                                {pairings.decanting?.should_decant && (
                                    <div className="col-span-2">
                                        <span className="text-gray-400">Dekantering:</span> {pairings.decanting.time} — {pairings.decanting.reason}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Transaksjonshistorikk */}
                    {item.transactions?.length > 0 && (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Historikk</h2>
                            <div className="space-y-2">
                                {item.transactions.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'in' ? '+' : '-'}{t.quantity}
                                            </span>
                                            <span className="text-sm text-gray-500 capitalize">{t.reason?.replace('_', ' ') || t.type}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(t.created_at).toLocaleDateString('nb-NO')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Kjeller-status */}
                    <div className="card text-center">
                        <p className="text-4xl font-bold text-wine-700">{item.quantity}</p>
                        <p className="text-gray-500 mt-1">flasker på lager</p>
                        <div className="mt-4 flex gap-2">
                            <button onClick={handleRemoveBottle} className="btn-wine flex-1">
                                Drikk en flaske
                            </button>
                        </div>
                        {item.purchase_price && (
                            <p className="text-sm text-gray-400 mt-3">
                                Verdi: {(item.quantity * item.purchase_price).toLocaleString('nb-NO')} kr
                            </p>
                        )}
                    </div>

                    {/* Notater og rating */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Mine notater</h3>
                            <button
                                onClick={() => setEditing(!editing)}
                                className="text-sm text-wine-600 hover:text-wine-800"
                            >
                                {editing ? 'Avbryt' : 'Rediger'}
                            </button>
                        </div>

                        {editing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-500">Rating</label>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setEditForm({ ...editForm, rating: star })}
                                                className={`text-2xl ${star <= (editForm.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Plassering</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="input-field mt-1"
                                        placeholder="F.eks. Kjeller, Rack 3"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Notater</label>
                                    <textarea
                                        value={editForm.personal_notes}
                                        onChange={(e) => setEditForm({ ...editForm, personal_notes: e.target.value })}
                                        className="input-field mt-1"
                                        rows={3}
                                        placeholder="Dine notater om denne vinen..."
                                    />
                                </div>
                                <button onClick={handleUpdate} className="btn-wine w-full">Lagre</button>
                            </div>
                        ) : (
                            <div className="space-y-2 text-sm">
                                {item.rating && (
                                    <p className="text-lg">
                                        {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                    </p>
                                )}
                                {item.location && <p><span className="text-gray-400">Plassering:</span> {item.location}</p>}
                                {item.rack && <p><span className="text-gray-400">Rack:</span> {item.rack}</p>}
                                {item.shelf && <p><span className="text-gray-400">Hylle:</span> {item.shelf}</p>}
                                {item.personal_notes && <p className="text-gray-600 mt-2">{item.personal_notes}</p>}
                                {!item.rating && !item.location && !item.personal_notes && (
                                    <p className="text-gray-400">Ingen notater ennå. Klikk "Rediger" for å legge til.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
