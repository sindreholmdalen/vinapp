import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { getDashboardStats, getValueHistory } from '@/Services/api';
import toast from 'react-hot-toast';

function StatCard({ title, value, subtitle, icon }) {
    return (
        <div className="stat-card">
            <div className="text-wine-600 mb-2">{icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}

function TypeChart({ data }) {
    if (!data || data.length === 0) return null;

    const colors = {
        'Rødvin': '#ab1d4a',
        'Hvitvin': '#f4c542',
        'Rosévin': '#ed7693',
        'Musserende': '#6ee7b7',
        'Dessertvin': '#c084fc',
    };

    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vintyper</h3>
            <div className="space-y-3">
                {data.map((item) => {
                    const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
                    const color = colors[item.type] || '#9ca3af';
                    return (
                        <div key={item.type}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-gray-300">{item.type || 'Annet'}</span>
                                <span className="text-gray-500">{item.count} fl. ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RecentTransactions({ transactions }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Siste aktivitet</h3>
                <p className="text-gray-500 text-sm">Ingen transaksjoner ennå. Begynn med å scanne en flaske!</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Siste aktivitet</h3>
            <div className="space-y-3">
                {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full mr-3 ${
                                t.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {t.type === 'in' ? '+' : '-'}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.wine?.name}</p>
                                <p className="text-xs text-gray-500">
                                    {t.quantity} fl. &middot; {new Date(t.created_at).toLocaleDateString('nb-NO')}
                                </p>
                            </div>
                        </div>
                        {t.price_per_unit && (
                            <span className="text-sm text-gray-500">
                                {Number(t.price_per_unit).toLocaleString('nb-NO')} kr
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CountryChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Topp land</h3>
            <div className="space-y-2">
                {data.map((item, i) => (
                    <div key={item.country} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 w-5">{i + 1}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{item.country || 'Ukjent'}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count} fl.</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DashboardIndex() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await getDashboardStats();
            setStats(response.data);
        } catch (err) {
            toast.error('Kunne ikke laste dashboard-data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('nb-NO', { minimumFractionDigits: 0 }) + ' kr';
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-700" />
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 mt-1">Oversikt over vinkjelleren din</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Flasker"
                    value={stats?.total_bottles || 0}
                    subtitle={`${stats?.unique_wines || 0} unike viner`}
                    icon={
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                        </svg>
                    }
                />
                <StatCard
                    title="Nåverdi"
                    value={formatCurrency(stats?.current_value || 0)}
                    subtitle={stats?.value_change > 0 ? `+${formatCurrency(stats.value_change)} fra kjøp` : ''}
                    icon={
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Innkjøpsverdi"
                    value={formatCurrency(stats?.purchase_value || 0)}
                    icon={
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Snittpris"
                    value={formatCurrency(stats?.average_price || 0)}
                    subtitle="per flaske"
                    icon={
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                        </svg>
                    }
                />
            </div>

            {/* Charts and activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TypeChart data={stats?.type_distribution} />
                <CountryChart data={stats?.country_distribution} />
                <RecentTransactions transactions={stats?.recent_transactions} />
            </div>
        </AuthenticatedLayout>
    );
}
