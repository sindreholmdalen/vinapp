import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { getPairingsForFood } from '@/Services/api';
import toast from 'react-hot-toast';

const foodCategories = [
    { name: 'Biff', emoji: '🥩', query: 'biff' },
    { name: 'Lam', emoji: '🍖', query: 'lam' },
    { name: 'Kylling', emoji: '🍗', query: 'kylling' },
    { name: 'Fisk', emoji: '🐟', query: 'fisk' },
    { name: 'Sushi', emoji: '🍣', query: 'sushi' },
    { name: 'Pasta', emoji: '🍝', query: 'pasta' },
    { name: 'Pizza', emoji: '🍕', query: 'pizza' },
    { name: 'Ost', emoji: '🧀', query: 'ost' },
    { name: 'Dessert', emoji: '🍰', query: 'dessert' },
    { name: 'Vilt', emoji: '🦌', query: 'vilt' },
    { name: 'Thai', emoji: '🥘', query: 'thai' },
    { name: 'Sjømat', emoji: '🦐', query: 'sjømat' },
];

function RecommendationCard({ rec, cellarMatch }) {
    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{rec.type}</h3>
                    <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    rec.type.includes('Rød') ? 'bg-red-100 text-red-800' :
                    rec.type.includes('Hvit') ? 'bg-yellow-100 text-yellow-800' :
                    rec.type.includes('Rosé') ? 'bg-pink-100 text-pink-800' :
                    rec.type.includes('Muss') ? 'bg-emerald-100 text-emerald-800' :
                    'bg-purple-100 text-purple-800'
                }`}>
                    {rec.type}
                </span>
            </div>

            {cellarMatch && cellarMatch.from_cellar?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-medium text-green-600 mb-2">Du har i kjelleren:</p>
                    <div className="space-y-2">
                        {cellarMatch.from_cellar.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{item.wine?.name}</span>
                                <span className="text-gray-400">{item.quantity} fl.</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WinePairing() {
    const [food, setFood] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query) => {
        const searchTerm = query || food;
        if (!searchTerm.trim()) return;

        setLoading(true);
        setFood(searchTerm);
        try {
            const response = await getPairingsForFood(searchTerm);
            setResults(response.data);
        } catch (err) {
            toast.error('Kunne ikke hente anbefalinger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Matpairing" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matpairing</h1>
                <p className="text-gray-500 mt-1">Finn den perfekte vinen til maten din</p>
            </div>

            {/* Søkefelt */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3 mb-6">
                <input
                    type="text"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                    placeholder="Hva skal du spise? F.eks. 'lammegryte', 'grillet laks'..."
                    className="input-field flex-1"
                />
                <button type="submit" disabled={loading} className="btn-wine px-6">
                    {loading ? '...' : 'Finn vin'}
                </button>
            </form>

            {/* Hurtigvalg */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
                {foodCategories.map((cat) => (
                    <button
                        key={cat.query}
                        onClick={() => handleSearch(cat.query)}
                        className="flex flex-col items-center py-3 px-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-wine-300 hover:shadow-sm transition-all"
                    >
                        <span className="text-2xl mb-1">{cat.emoji}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Resultater */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-700" />
                </div>
            ) : results ? (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Anbefalinger til <span className="text-wine-600">{results.food}</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.recommendations?.map((rec, i) => (
                            <RecommendationCard
                                key={i}
                                rec={rec}
                                cellarMatch={results.cellar_matches?.find(m =>
                                    m.recommendation.type === rec.type
                                )}
                            />
                        ))}
                    </div>

                    {results.cellar_matches?.length > 0 && (
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <p className="text-green-700 dark:text-green-300 font-medium">
                                Du har passende viner i kjjelleren din!
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Se forslagene markert med "Du har i kjelleren" ovenfor.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg">Vel� en mattype ovenfor eller skriv inn hva du skal spise</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
