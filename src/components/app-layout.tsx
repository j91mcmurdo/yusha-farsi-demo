
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Footer from '@/components/footer';
import AppSidebar from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppSidebar />
            <div className={cn(
                "flex flex-1 flex-col",
                "md:pl-64" // Always apply padding for the fixed-width sidebar on desktop
            )}>
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
