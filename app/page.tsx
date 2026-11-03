import Link from "next/link";

export default function Home() {
    return (
        <main className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Civic participation, made clearer
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-950 sm:text-6xl">
                Know what your representatives are doing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                Follow legislation, share your position, and see how your representatives respond.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                    href="/signup"
                    className="rounded-md bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800"
                >
                    Create an account
                </Link>
                <Link
                    href="/login"
                    className="rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-gray-800 hover:bg-gray-50"
                >
                    Sign in
                </Link>
            </div>
        </main>
    );
}
