import '../css/app.css';
import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'VinApp';

class ErrorBoundary extends React.Component {
        constructor(props) {
                    super(props);
                    this.state = { hasError: false, error: null };
        }
        static getDerivedStateFromError(error) {
                    return { hasError: true, error };
        }
        componentDidCatch(error, info) {
                    console.error('VinApp error boundary caught:', error, info);
        }
        render() {
                    if (this.state.hasError) {
                                    return (
                                                        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                                                                                <h2 style={{ color: '#7a1b3d' }}>Noe gikk galt</h2>h2>
                                                                                <p style={{ color: '#666', marginBottom: '1rem' }}>
                                                                                    {this.state.error?.message || 'En uventet feil oppstod.'}
                                                                                    </p>p>
                                                                                <a href="/" style={{ color: '#7a1b3d', textDecoration: 'underline' }}>
                                                                                                            Ga tilbake til forsiden
                                                                                    </a>a>
                                                        </div>div>
                                                    );
                    }
                    return this.props.children;
        }
}

createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
                    resolvePageComponent(
                                    `./Pages/${name}.jsx`,
                                    import.meta.glob('./Pages/**/*.jsx')
                                ),
        setup({ el, App, props }) {
                    const root = createRoot(el);
                    root.render(
                                    <ErrorBoundary>
                                                    <App {...props} />
                                                    <Toaster
                                                                            position="top-right"
                                                                            toastOptions={{
                                                                                                        duration: 3000,
                                                                                                        style: {
                                                                                                                                        background: '#1f2937',
                                                                                                                                        color: '#f9fafb',
                                                                                                            },
                                                                            }}
                                                                        />
                                    </ErrorBoundary>ErrorBoundary>
                                );
        },
        progress: {
                    color: '#7a1b3d',
        },
});</ErrorBoundary>
