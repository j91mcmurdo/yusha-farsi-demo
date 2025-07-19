"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FlaskConical, PanelLeft, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode, children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            passHref
            className={cn(
                "flex h-12 items-center gap-4 rounded-lg px-4 text-lg font-semibold transition-colors",
                isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
        >
            {icon}
            <span className="truncate">{children}</span>
        </Link>
    );
};

const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar-background">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-headline font-bold text-sidebar-foreground pt-4 pb-2">Yusha's Journey</h2>
            <Image
                src="https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/sidebar.png?alt=media&token=fbe19c01-1bfb-4d26-a94d-d95fdc415284"
                alt="Yusha Farsi Journey logo"
                width={256}
                height={171}
                className="w-full h-auto -mt-24"
                priority
            />
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-2 p-3">
            <NavLink href="/" icon={<Home />}>Home</NavLink>
            <NavLink href="/lessons" icon={<BookOpen />}>All Lessons</NavLink>
            <NavLink href="/testing" icon={<FlaskConical />}>Testing</NavLink>
            <NavLink href="/practice" icon={<MessageCircle />}>Practice</NavLink>
        </nav>
        <Image
                src="https://firebasestorage.googleapis.com/v0/b/yusha-farsi.firebasestorage.app/o/sidebar.png?alt=media&token=fbe19c01-1bfb-4d26-a94d-d95fdc415284"
                alt="Yusha Farsi Journey logo"
                width={256}
                height={171}
                className="w-full h-auto  rotate-180"
                priority
            />
    </div>
);


const AppSidebar = () => {
    const isMobile = useIsMobile();
    const pathname = usePathname();

    if (isMobile) {
        return (
            <header>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-background/50 backdrop-blur-sm md:hidden">
                            <PanelLeft />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px] bg-sidebar-background text-sidebar-foreground border-r-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </header>
        );
    }

    return (
        <aside className={cn(
            "hidden md:fixed md:inset-y-0 md:flex md:flex-col md:z-50",
            "w-64 bg-sidebar-background border-r border-sidebar-border shadow-lg"
        )}>
             <SidebarContent />
        </aside>
    );
};

export default AppSidebar;
