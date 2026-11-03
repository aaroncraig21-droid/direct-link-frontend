"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/nav/Sidebar";
import { apiGet, clearAuthTokens, API_TOKEN_STORAGE_KEY } from "@/lib/api";
import "@/app/globals.css";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        let active = true;

        if (!localStorage.getItem(API_TOKEN_STORAGE_KEY)) {
            router.replace("/login");
            return () => {
                active = false;
            };
        }

        apiGet("/me")
            .then(() => {
                if (active) setAuthenticated(true);
            })
            .catch(() => {
                clearAuthTokens();
                if (active) router.replace("/login");
            });

        return () => {
            active = false;
        };
    }, [router]);

    if (!authenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600" role="status">
                Checking your session…
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="min-w-0 flex-1 p-6">{children}</div>
        </div>
    );
}
