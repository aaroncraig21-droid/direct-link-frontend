export default function DashboardOverview() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
            <p className="text-gray-600 mb-8">
                This is where constituents and representatives will see insights,
                notifications, and more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="font-semibold mb-2">Active Bills</h2>
                    <p className="text-sm text-gray-500">0 active bills (loading soon)</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="font-semibold mb-2">Survey Response Rate</h2>
                    <p className="text-sm text-gray-500">No data yet</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="font-semibold mb-2">New Notifications</h2>
                    <p className="text-sm text-gray-500">None</p>
                </div>
            </div>
        </div>
    );
}
