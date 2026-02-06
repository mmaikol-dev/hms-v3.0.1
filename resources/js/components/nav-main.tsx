import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => {
        const removeFinish = router.on('finish', () => setPendingHref(null));
        const removeCancel = router.on('cancel', () => setPendingHref(null));
        const removeError = router.on('error', () => setPendingHref(null));

        return () => {
            removeFinish();
            removeCancel();
            removeError();
        };
    }, []);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    (() => {
                        const itemHref = resolveUrl(item.href);
                        const isPending = pendingHref === itemHref;
                        return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(
                                itemHref,
                            )}
                            tooltip={{ children: item.title }}
                        >
                            <Link
                                href={item.href}
                                prefetch
                                onClick={() => setPendingHref(itemHref)}
                            >
                                {isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    item.icon && <item.icon className="size-4" />
                                )}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                        );
                    })()
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
