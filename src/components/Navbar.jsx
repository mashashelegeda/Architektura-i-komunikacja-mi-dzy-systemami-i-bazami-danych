export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-4 shadow-md">
            <h1 className="text-xl font-bold">FlyParking</h1>
            <div className="space-x-4">
                <button>Login</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    Register
                </button>
            </div>
        </nav>
    );
}