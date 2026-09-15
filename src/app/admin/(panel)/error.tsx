"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-800">Something went wrong</h1>
      <p className="mt-2 text-sm text-red-700">{error.message || "Could not load data. Check MONGODB_URI and that the database is reachable."}</p>
      <button onClick={reset} className="btn mt-4">Try again</button>
    </div>
  );
}
