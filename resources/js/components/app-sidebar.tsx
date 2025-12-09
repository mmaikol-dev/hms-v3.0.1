import { usePage } from '@inertiajs/react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import {
    BookOpen,
    BoxesIcon,
    FileSpreadsheetIcon,
    Waypoints,
    HandCoins,
    Folder,
    LayoutGrid,
    ListCheckIcon,
    UserRoundIcon,
    SquareArrowDownLeftIcon,
    Smartphone,
    FileAxis3DIcon,
    BookmarkXIcon,
    FileX,
    MessagesSquareIcon,
    PlusIcon,
    PackagePlusIcon,
    BrainCircuitIcon,
    ReplaceAllIcon,
    SendHorizonalIcon,
    SendToBackIcon,
    Store,
    StoreIcon,
    WarehouseIcon,
    Scale3DIcon,
    ChartBarIncreasing,
    GitGraphIcon,
    LineChartIcon,
    PersonStanding,
    StethoscopeIcon,
    ListChecksIcon,
    FlaskConicalIcon,
    FlaskRound,
    DoorOpenIcon,
    Bed,
    PillIcon,
    FoldHorizontalIcon,
    File,
    SquareArrowDownRightIcon,
    FileBadge2Icon,
} from 'lucide-react';

// --- grouped nav items by department ---
const departmentNav = [
    {
        label: "General",
        items: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Patients', href: '/patients', icon: PersonStanding },
            { title: 'Doctors', href: '/doctors', icon: StethoscopeIcon },
            { title: 'Appointments', href: '/appointments', icon: ListChecksIcon },
            { title: 'Labtest', href: '/labtests', icon: FlaskConicalIcon },
            { title: 'Labtest Request', href: '/labtestrequests', icon: FlaskRound },
            { title: 'Wards', href: '/wards', icon: DoorOpenIcon },
            { title: 'Beds', href: '/beds', icon: Bed },
            { title: 'Prescriptions', href: '/prescriptions', icon: FileAxis3DIcon },
            { title: 'Medicines', href: '/medicines', icon: PillIcon },
            { title: 'inventoryItems', href: '/inventoryitems', icon: BoxesIcon },
            { title: 'departments', href: '/departments', icon: SquareArrowDownRightIcon },
            { title: 'invoice', href: '/invoices', icon: FileBadge2Icon },

            { title: 'users', href: '/users', icon: UserRoundIcon },


        ],
    },
    {
        label: "Finance",
        items: [
            { title: 'Transactions', href: '/transactions', icon: HandCoins },
            { title: 'Reports', href: '/report', icon: FileAxis3DIcon },
            { title: 'Undelivered Orders', href: '/undelivered', icon: BookmarkXIcon },
            { title: 'Unremitted Orders', href: '/unremitted', icon: FileX },
            { title: 'STK push', href: '/stk', icon: Smartphone },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth?.user;

    // 👇 Apply role-based filtering
    const filteredNav = departmentNav
        .map((dept) => {
            // If the user is an agent:
            if (user?.roles === 'agent') {
                // Hide Operations and Inventory completely
                if (dept.label === 'Operations' || dept.label === 'Inventory') return null;

                // Show only STK push in Finance
                if (dept.label === 'Finance') {
                    return {
                        ...dept,
                        items: dept.items.filter((item) => item.title === 'STK push'),
                    };
                }
            }

            // Default: show all
            return dept;
        })
        .filter(Boolean); // remove null values

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* LOGO */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* NAVIGATION */}
            <SidebarContent className="scrollbar-custom overflow-y-auto">
                {filteredNav.map((dept) => (
                    <div key={dept.label} className="mb-4">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider 
              transition-all duration-200
              group-data-[state=collapsed]:hidden">
                            {dept.label}
                        </p>
                        <NavMain items={dept.items} />
                    </div>
                ))}
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}