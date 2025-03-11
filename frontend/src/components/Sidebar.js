export default function LeftSidebar() {
    return (
        <aside className="w-64 bg-gray-50 p-4 shadow-2xl">
            <h2 className="text-lg font-bold text-[#800000] mb-4">JCBUST</h2>
            <ul className="space-y-2">
                <li><a href="/" className="block hover:bg-gray-300 p-2 text-[#800000] rounded">Dashboard</a></li>
                <li><a href="/departments" className="block hover:bg-gray-300 text-[#800000] p-2 rounded">Departments</a></li>
                <li><a href="/courses" className="block hover:bg-gray-300 text-[#800000] p-2 rounded">Courses</a></li>
                <li><a href="/syllabi" className="block hover:bg-gray-300 text-[#800000] p-2 rounded">Syllabi</a></li>
            </ul>
        </aside>
    );
}