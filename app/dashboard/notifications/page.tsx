export default function NotificationsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <p className="text-gray-600 mb-6">
                Alerts about new bills, survey results, and system updates.
            </p>

            <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-gray-500">No notifications.</p>
            </div>
        </div>
    );
}
