import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Registrer deg" />
            <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <svg className="h-10 w-10 text-wine-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                            </svg>
                            <span className="text-2xl font-bold text-white">VinApp</span>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Opprett konto</h2>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Navn</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="input-field"
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-post</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="input-field"
                                />
                                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passord</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="input-field"
                                />
                                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bekreft passord</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <button type="submit" disabled={processing} className="btn-wine w-full py-3">
                                {processing ? 'Oppretter konto...' : 'Registrer deg'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Har du allerede konto?{' '}
                            <Link href="/login" className="text-wine-600 hover:text-wine-800 font-medium">
                                Logg inn
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
