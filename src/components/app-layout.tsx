"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Home,
  FileText,
  Users,
  Building2,
  GanttChartSquare,
  Film,
  Paintbrush,
  ChevronDown,
  ClipboardList,
  AreaChart,
} from "lucide-react";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";

const departments = [
  { name: 'Pregger', href: '/report/pregger', icon: Building2 },
  { name: 'Tapeheads', href: '/report/tapeheads', icon: Users },
  { name: 'Gantry', href: '/report/gantry', icon: GanttChartSquare },
  { name: 'Films', href: '/report/films', icon: Film },
  { name: 'Graphics', href: '/report/graphics', icon: Paintbrush },
];

const analyticsDepartments = [
  { name: 'Pregger', href: '/analytics/pregger', icon: Building2 },
  { name: 'Tapeheads', href: '/analytics/tapeheads', icon: Users },
  { name: 'Gantry', href: '/analytics/gantry', icon: GanttChartSquare },
  { name: 'Films', href: '/analytics/films', icon: Film },
  { name: 'Graphics', href: '/analytics/graphics', icon: Paintbrush },
];


function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/40x40" alt="@shadcn" />
            <AvatarFallback>SL</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Shift Lead</p>
            <p className="text-xs leading-none text-muted-foreground">
              lead@northsails.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MainSidebar() {
  const pathname = usePathname();
  const { open, setOpen, state } = useSidebar();
  const [isReportsOpen, setReportsOpen] = React.useState(false);
  const [isAnalyticsOpen, setAnalyticsOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (pathname.startsWith('/report')) {
      setReportsOpen(true);
    }
    if (pathname.startsWith('/analytics')) {
      setAnalyticsOpen(true);
    }
  }, [pathname]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-sidebar-primary" />
          <span className="text-lg font-semibold font-headline text-sidebar-primary-foreground">
            ShiftView
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard"}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setReportsOpen(!isReportsOpen)}
              isActive={pathname.startsWith("/report")}
            >
              <FileText />
              <span>Report Entry</span>
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform duration-200",
                  isReportsOpen && "rotate-180"
                )}
              />
            </SidebarMenuButton>
            {isReportsOpen && (
              <SidebarMenuSub>
                {departments.map((dept) => (
                  <SidebarMenuSubItem key={dept.name}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === dept.href}
                    >
                      <Link href={dept.href}>
                        <dept.icon />
                        <span>{dept.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setAnalyticsOpen(!isAnalyticsOpen)}
              isActive={pathname.startsWith("/analytics")}
            >
              <AreaChart />
              <span>Analytics</span>
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform duration-200",
                  isAnalyticsOpen && "rotate-180"
                )}
              />
            </SidebarMenuButton>
            {isAnalyticsOpen && (
              <SidebarMenuSub>
                {analyticsDepartments.map((dept) => (
                  <SidebarMenuSubItem key={dept.name}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === dept.href}
                    >
                      <Link href={dept.href}>
                        <dept.icon />
                        <span>{dept.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/review/tapeheads"}
              tooltip="Review"
            >
              <Link href="/review/tapeheads">
                <ClipboardList />
                <span>Tapeheads Review</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-3 p-2 border-t border-sidebar-border">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40" alt="@shadcn" />
            <AvatarFallback>SL</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">Shift Lead</span>
            <span className="text-xs text-muted-foreground">lead@northsails.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="hidden md:block">
            {/* Can add breadcrumbs here */}
          </div>
          <UserNav />
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
