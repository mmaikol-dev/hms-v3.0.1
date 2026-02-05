import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function PWAUpdatePrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            import('virtual:pwa-register').then(({ registerSW }) => {
                const update = registerSW({
                    onNeedRefresh() {
                        setShowPrompt(true);
                    },
                    onOfflineReady() {
                        console.log('App ready to work offline');
                    },
                });
                setUpdateSW(() => update);
            });
        }
    }, []);

    const handleUpdate = () => {
        if (updateSW) {
            updateSW(true);
        }
        setShowPrompt(false);
    };

    return (
        <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Available</DialogTitle>
                    <DialogDescription>
                        A new version of the app is available. Would you like to update now?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPrompt(false)}>
                        Later
                    </Button>
                    <Button onClick={handleUpdate}>
                        Update Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}