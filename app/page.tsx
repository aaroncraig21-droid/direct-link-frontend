export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-5xl font-bold text-blue-600 mb-6">
                Direct Link Systems
            </h1>
            <p className="text-lg text-gray-700 max-w-xl text-center mb-10">
                Empowering constituents and representatives with clear, real-time
                communication and actionable insights.
            </p>

            <div className="flex gap-4">
                <a
                    href="#"
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                    Get Started
                </a>

                <a
                    href="#"
                    className="px-6 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition"
                >
                    Learn More
                </a>
            </div>
        </main>
    );
}
