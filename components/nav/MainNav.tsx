"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MainNav() {
    return (
        <header className="w-full border-b bg-white">
            <div className="mx-auto max-w-7xl flex items-center justify-between py-4 px-6">
                <Link href="/" className="text-xl font-semibold text-blue-600">
                    Direct Link Systems
                </Link>

                <nav className="space-x-4 hidden sm:flex">
                    <Link href="/about" className="text-sm text-gray-600 hover:text-blue-600">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">
                        Contact
                    </Link>
                </nav>

                <div className="flex items-center space-x-3">
                    <Button asChild variant="outline">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
