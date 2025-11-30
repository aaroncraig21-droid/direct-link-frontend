import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MainNav } from "@/components/nav/MainNav";

const inter = Inter({ subsets: ["latin"] });

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
            <body className={`${inter.className} bg-gray-50`}>
                <MainNav />
                <main className="pt-6">{children}</main>
            </body>
        </html>
    );
}
