import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NetworkStatusToast() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const updateStatus = () => setIsOffline(!navigator.onLine);

        updateStatus();
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[110] flex w-[min(92vw,28rem)] flex-col gap-3">
            <Alert className="pointer-events-auto border shadow-lg" variant="destructive">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Connection lost</AlertTitle>
                <AlertDescription className="pr-6">
                    You are offline. Please check your internet connection.
                </AlertDescription>
            </Alert>
        </div>
    );
}
