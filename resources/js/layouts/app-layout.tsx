import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { FlashToaster } from '@/components/flash-toaster';
import { NetworkStatusToast } from '@/components/network-status-toast';
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <>
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
        <FlashToaster />
        <NetworkStatusToast />
        <PWAUpdatePrompt />
    </>
);
