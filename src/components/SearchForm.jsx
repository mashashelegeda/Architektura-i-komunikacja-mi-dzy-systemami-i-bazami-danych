export default function SearchForm() {
    return (
        <div className="max-w-md mx-auto mt-6 p-4 shadow rounded bg-gray-200">
            <h3 className="text-lg font-semibold mb-4">Sprawdź dostępność</h3>
            <p className="text-sm mb-2">Data przyjazdu:</p>
            <input type="date" className="w-full mb-2 p-2 border rounded" />
            <p className="text-sm mb-2">Data wyjazdu:</p>
            <input type="date" className="w-full mb-4 p-2 border rounded" />

            <button className="w-full bg-blue-500 text-white py-2 rounded">
                Szukaj
            </button>
        </div>
    );
}