import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ToastItem = {
    id: number;
    type: 'success' | 'error';
    message: string;
};

export function FlashToaster() {
    const { flash, errors } = usePage<{
        flash?: { success?: string; error?: string };
        errors?: Record<string, string>;
    }>().props;

    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const errorMessage = useMemo(() => {
        if (!errors) {
            return null;
        }

        const firstKey = Object.keys(errors)[0];
        return firstKey ? errors[firstKey] : null;
    }, [errors]);

    useEffect(() => {
        const next: ToastItem[] = [];

        if (flash?.success) {
            next.push({ id: Date.now(), type: 'success', message: flash.success });
        }

        if (flash?.error) {
            next.push({ id: Date.now() + 1, type: 'error', message: flash.error });
        }

        if (errorMessage && !flash?.error) {
            next.push({ id: Date.now() + 2, type: 'error', message: errorMessage });
        }

        if (next.length > 0) {
            setToasts((previous) => [...previous, ...next]);
        }
    }, [flash?.success, flash?.error, errorMessage]);

    useEffect(() => {
        if (toasts.length === 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            setToasts((previous) => previous.slice(1));
        }, 4500);

        return () => window.clearTimeout(timer);
    }, [toasts]);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,28rem)] flex-col gap-3">
            {toasts.map((toast) => {
                const isSuccess = toast.type === 'success';

                return (
                    <Alert
                        key={toast.id}
                        className="pointer-events-auto border shadow-lg"
                        variant={isSuccess ? 'default' : 'destructive'}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                            {isSuccess ? 'Success' : 'Something went wrong'}
                        </AlertTitle>
                        <AlertDescription className="pr-6">{toast.message}</AlertDescription>
                        <button
                            type="button"
                            aria-label="Dismiss notification"
                            onClick={() => {
                                setToasts((previous) =>
                                    previous.filter((item) => item.id !== toast.id),
                                );
                            }}
                            className="absolute right-3 top-3 rounded p-1 opacity-70 transition hover:opacity-100"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </Alert>
                );
            })}
        </div>
    );
}
