"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuthTokens } from "@/lib/api";
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
    const router = useRouter();

    const handleSignOut = () => {
        clearAuthTokens();
        router.replace("/login");
    };

    return (
        <aside className="flex w-60 shrink-0 flex-col border-r bg-white">
            <div className="p-6 text-xl font-semibold text-blue-700">Direct Link</div>

            <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                            pathname === link.href
                                ? "bg-gray-100 text-blue-800"
                                : "text-gray-700"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <button
                type="button"
                onClick={handleSignOut}
                className="m-3 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
                Sign out
            </button>
        </aside>
    );
}
