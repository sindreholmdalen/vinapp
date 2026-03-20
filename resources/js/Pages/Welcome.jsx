import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Velkommen" />
            <div className="min-h-screen bg-gradient-to-br from-wine-950 via-wine-900 to-wine-800 flex flex-col items-center justify-center px-4">
                <div className="text-center max-w-2xl">
                    <div className="flex justify-center mb-6">
                        <svg className="h-20 w-20 text-wine-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5m-4.5 0V3m5 18.25at73m-2V3M12 17v4m-3 0h6" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">VinApp</h1>
                    <p className="text-xl text-wine-200 mb-8">
                        Din personlige vinkjeller. Scan, søk, organiser og nyt.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="btn-wine text-lg px-8 py-3"
                            >
                                Gå til dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="btn-wine text-lg px-8 py-3"
                                >
                                    Logg inn
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn-wine-outline text-lg px-8 py-3 border-wine-400 text-wine-200 hover:bg-wine-800"
                                >
                                    Registrer deg
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                        <div className="bg-wine-900/50 rounded-xl p-5 backdrop-blur">
                            <h3 className="text-wine-300 font-semibold mb-2">Scan strekkode</h3>
                            <p className="text-wine-200/70 text-sm">Bruk kameraet til å skanne vinflasker direkte fra Vinmonopolet.</p>
                        </div>
                        <div className="bg-wine-900/50 rounded-xl p-5 backdrop-blur">
                            <h3 className="text-wine-300 font-semibold mb-2">Hold oversikt</h3>
                            <p className="text-wine-200/70 text-sm">Se hva du har i kjelleren, verdien, og når du bør drikke.</p>
                        </div>
                        <div className="bg-wine-900/50 rounded-xl p-5 backdrop-blur">
                            <h3 className="text-wine-300 font-semibold mb-2">Matpairing</h3>
                            <p className="text-wine-200/70 text-sm">Finn den perfekte vinen til middagen med smarte anbefalinger.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
