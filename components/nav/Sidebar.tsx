"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/bills", label: "Bills" },
    { href: "/dashboard/surveys", label: "Surveys" },
    { href: "/dashboard/notifications", label: "Notifications" },
    { href: "/dashboard/profile", label: "Profile" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 border-r bg-white">
            <div className="p-6 text-xl font-semibold text-blue-600">Dashboard</div>

            <nav className="px-3 space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                            pathname === link.href
                                ? "bg-gray-200 text-blue-700"
                                : "text-gray-700"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
