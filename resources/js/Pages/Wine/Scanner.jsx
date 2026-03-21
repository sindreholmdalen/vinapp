import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { lookupBarcode, addToCellar } from '@/Services/api';
import toast from 'react-hot-toast';

function BarcodeScanner({ onDetected, active }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const readerRef = useRef(null);

    useEffect(() => {
        if (!active) {
            stopCamera();
            return;
        }

        startCamera();

        return () => stopCamera();
    }, [active]);

    const startCamera = async () => {
        try {
            // Kamera-API krever HTTPS
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('Kamera krever HTTPS. Bruk manuell inntasting av strekkoden i stedet.', { duration: 8000 });
                return;
            }

            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            const reader = new BrowserMultiFormatReader();
            readerRef.current = reader;

            const videoElement = videoRef.current;
            if (!videoElement) return;

            // Bruk decodeFromConstraints â lar zxing hÃ¥ndtere kamera-stream korrekt
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
            };

            await reader.decodeFromConstraints(constraints, videoElement, (result, error) => {
                if (result) {
                    onDetected(result.getText());
                }
            });

            if (videoElement.srcObject) {
                streamRef.current = videoElement.srcObject;
            }
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                toast.error('Kameratilgang ble nektet. Gi tillatelse i nettleserinnstillingene.');
            } else if (err.name === 'NotFoundError') {
                toast.error('Fant ikke kamera. Sjekk at enheten har et kamera.');
            } else if (!navigator.mediaDevices) {
                toast.error('Kamera krever HTTPS. Bruk manuell inntasting i stedet.', { duration: 8000 });
            } else {
                toast.error('Kunne ikke starte kameraet: ' + err.message);
            }
        }
    };

    const stopCamera = () => {
        if (readerRef.current) {
            readerRef.current.reset();
            readerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    return (
        <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] max-w-lg mx-auto">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanner overlay */}
            <div className="scanner-overlay">
                <div className="scanner-frame">
                    <div className="scanner-line" />
                </div>
            </div>

            {/* Status indicator */}
            {active && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <span className="bg-black/60 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                        Skanner...
                    </span>
                </div>
            )}
        </div>
    );
}

function ManualInput({ onSubmit }) {
    const [barcode, setBarcode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (barcode.trim()) {
            onSubmit(barcode.trim());
            setBarcode('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Skriv inn strekkode manuelt..."
                className="input-field flex-1"
                inputMode="numeric"
                pattern="[0-9]*"
            />
            <button type="submit" className="btn-wine px-4">SÃ¸k</button>
        </form>
    );
}

function ProductResult({ product, onAdd, onDismiss }) {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        setAdding(true);
        try {
            await onAdd(product, quantity);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="card border-2 border-wine-200">
            <div className="flex items-start gap-4">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-20 h-28 object-contain rounded" />
                ) : (
                    <div className="w-20 h-28 bg-wine-100 rounded flex items-center justify-center">
                        <svg className="h-10 w-10 text-wine-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v3.75m0 0L6 12.75c-.94 1.88.47 4.25 2.63 4.25h6.74c2.16 0 3.57-2.37 2.63-4.25L14.25 6.75m-4.5 0h4.5" />
                        </svg>
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.producer}</p>
                        </div>
                        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 p-1">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {product.type && <span className="text-xs px-2 py-0.5 rounded-full bg-wine-100 text-wine-700">{product.type}</span>}
                        {product.year && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.year}</span>}
                        {product.country && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.country}</span>}
                        {product.grape_variety && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.grape_variety}</span>}
                    </div>

                    <p className="text-2xl font-bold text-wine-700 mt-3">
                        {product.price ? `${Number(product.price).toLocaleString('nb-NO')} kr` : 'Ukjent pris'}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                        <select
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="rounded-lg border-gray-300 py-2 px-3"
                        >
                            {[1, 2, 3, 4, 5, 6, 12, 24].map(n => (
                                <option key={n} value={n}>{n} flaske{n > 1 ? 'r' : ''}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAdd}
                            disabled={adding}
                            className="btn-wine flex-1 py-2.5"
                        >
                            {adding ? 'Legger til...' : 'Legg i kjelleren'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WineScanner() {
    const [scanning, setScanning] = useState(false);
    const [product, setProduct] = useState(null);
    const [lookingUp, setLookingUp] = useState(false);
    const [lastBarcode, setLastBarcode] = useState('');

    const handleBarcodeDetected = useCallback(async (barcode) => {
        // UnngÃ¥ Ã¥ sÃ¸ke opp samme strekkode flere ganger
        if (barcode === lastBarcode || lookingUp) return;
        setLastBarcode(barcode);
        setScanning(false);
        setLookingUp(true);

        toast.loading('SÃ¸ker opp strekkode...', { id: 'barcode-lookup' });

        try {
            const response = await lookupBarcode(barcode);
            setProduct(response.data.data);
            toast.success('Vin funnet!', { id: 'barcode-lookup' });
        } catch (err) {
            if (err.response?.status === 404) {
                toast.error('Fant ingen vin med denne strekkoden. PrÃ¸v manuelt sÃ¸k.', { id: 'barcode-lookup' });
            } else {
                toast.error('Oppslag feilet. PrÃ¸v igjen.', { id: 'barcode-lookup' });
            }
        } finally {
            setLookingUp(false);
        }
    }, [lastBarcode, lookingUp]);

    const handleAddToCellar = async (product, quantity) => {
        try {
            await addToCellar({
                vinmonopolet_id: product.vinmonopolet_id,
                quantity,
                purchase_price: product.price,
                purchase_date: new Date().toISOString().split('T')[0],
            });
            toast.success(`${quantity} flaske(r) lagt til i kjelleren!`);
            setProduct(null);
            setLastBarcode('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Kunne ikke legge til');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Strekkodescanner" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scan strekkode</h1>
                <p className="text-gray-500 mt-1">Scan vinflasken med kameraet for Ã¥ legge den i kjelleren</p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
                {/* Scanner */}
                {!product && (
                    <>
                        {scanning ? (
                            <div>
                                <BarcodeScanner onDetected={handleBarcodeDetected} active={scanning} />
                                <button
                                    onClick={() => setScanning(false)}
                                    className="w-full mt-4 py-3 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                                >
                                    Stopp kamera
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setScanning(true); setLastBarcode(''); }}
                                disabled={lookingUp}
                                className="w-full py-12 border-2 border-dashed border-wine-300 rounded-xl text-wine-600 hover:bg-wine-50 transition-colors flex flex-col items-center gap-3"
                            >
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                </svg>
                                <span className="text-lg font-medium">Start kamera</span>
                                <span className="text-sm text-gray-400">Pek kameraet mot strekkoden pÃ¥ flasken</span>
                            </button>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-gray-50 dark:bg-gray-900 px-3 text-gray-400">eller</span>
                            </div>
                        </div>

                        <ManualInput onSubmit={handleBarcodeDetected} />

                        <div className="text-center">
                            <Link href="/search" className="text-sm text-wine-600 hover:text-wine-800">
                                SÃ¸k etter vin manuelt i stedet
                            </Link>
                        </div>
                    </>
                )}

                {/* Loading */}
                {lookingUp && !product && (
                    <div className="flex flex-col items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-700" />
                        <p className="text-gray-500 mt-4">SÃ¸ker i Vinmonopolets database...</p>
                    </div>
                )}

                {/* Product result */}
                {product && (
                    <div className="space-y-4">
                        <ProductResult
                            product={product}
                            onAdd={handleAddToCellar}
                            onDismiss={() => { setProduct(null); setLastBarcode(''); }}
                        />
                        <button
                            onClick={() => { setProduct(null); setLastBarcode(''); setScanning(true); }}
                            className="w-full py-3 text-sm text-wine-600 hover:text-wine-800 border border-wine-200 rounded-lg"
                        >
                            Scan en ny flaske
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
