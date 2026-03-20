import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartIcon },
    { name: 'Vinkjeller', href: '/cellar', icon: WineIcon },
    { name: 'Søk', href: '/search', icon: SearchIcon },
    { name: 'Scanner', href: '/scanner', icon: CameraIcon },
    { name: 'Matpairing', href: '/pairing', icon: FoodIcon },
];

function ChartIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    );
}

function WineIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5m-4.5 0V3m4.5 3.75V3M12 17v4m-3 0h6" />
        </svg>
    );
}

function SearchIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    );
}

function CameraIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
    );
}

function FoodIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
        </svg>
    );
}

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Desktop sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-wine-950 pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-6">
                        <WineIcon className="h-8 w-8 text-wine-400" />
                        <span className="ml-3 text-xl font-bold text-white">VinApp</span>
                    </div>
                    <nav className="mt-8 flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = currentPath.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-wine-800 text-white'
                                            : 'text-wine-200 hover:bg-wine-900 hover:text-white'
                                    }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-wine-300' : 'text-wine-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex-shrink-0 px-4 py-4 border-t border-wine-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-9 w-9 rounded-full bg-wine-700 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {auth?.user?.name?.charAt(0)?.toUpperCase() || 'V'}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{auth?.user?.name}</p>
                                <Link href="/logout" method="post" as="button" className="text-xs text-wine-300 hover:text-white">
                                    Logg ut
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile top bar */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center bg-wine-950 px-4 py-3 shadow-lg">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-wine-200 hover:text-white"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <div className="flex items-center ml-4">
                    <WineIcon className="h-6 w-6 text-wine-400" />
                    <span className="ml-2 text-lg font-bold text-white">VinApp</span>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-wine-950 p-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <WineIcon className="h-7 w-7 text-wine-400" />
                                <span className="ml-2 text-lg font-bold text-white">VinApp</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-wine-200">
                                <svg className="h6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = currentPath.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                                            isActive
                                                ? 'bg-wine-800 text-white'
                                                : 'text-wine-200 hover:bg-wine-900'
                                        }`}
                                    >
                                        <item.icon className={`mf-3 h-6 w-6 ${isActive ? 'text-wine-300' : 'text-wine-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Mobile bottom navigation */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
                <div className="flex justify-around py-2">
                    {navigation.map((item) => {
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center py-1 px-2 text-xs ${
                                    isActive ? 'text-wine-700 dark:text-wine-400' : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                <item.icon className="h-5 w-5 mb-0.5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main content */}
            <main className="lg:pl-64 pb-20 lg:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
