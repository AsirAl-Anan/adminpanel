import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const ErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage = 'An unexpected error occurred.';
    let errorDetails = '';

    if (isRouteErrorResponse(error)) {
        // Handle specific status codes if needed
        errorMessage = error.statusText || error.message;
        if (error.status === 404) {
            errorMessage = "Page not found";
            errorDetails = "The page you are looking for does not exist.";
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-slate-600 text-sm">
                        We encountered an error while loading this page.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-sm font-medium text-red-600 break-words font-mono">
                            {errorMessage}
                        </p>
                        {process.env.NODE_ENV === 'development' && errorDetails && (
                            <details className="mt-2 text-xs text-slate-500 overflow-auto max-h-40">
                                <summary className="cursor-pointer hover:text-slate-700">View Stack Trace</summary>
                                <pre className="mt-2 whitespace-pre-wrap">{errorDetails}</pre>
                            </details>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Reload
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
                        >
                            <Home size={16} />
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorBoundary;
