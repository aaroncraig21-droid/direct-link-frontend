import "./globals.css";
import type { Metadata } from "next";
import { MainNav } from "@/components/nav/MainNav";

export const metadata: Metadata = {
    title: "Direct Link Systems",
    description: "Constituent → Representative communication built for the modern era.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50 font-sans">
                <MainNav />
                <main className="pt-6">{children}</main>
            </body>
        </html>
    );
}
