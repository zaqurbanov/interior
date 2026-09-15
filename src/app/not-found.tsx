import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x grid min-h-svh place-content-center text-center">
      <p className="eyebrow text-bronze">404</p>
      <h1 className="mt-4 font-serif text-6xl font-light">This room is still empty</h1>
      <p className="mt-4 text-graphite">The page you are looking for does not exist.</p>
      <Link href="/" className="mx-auto mt-8 rounded-full bg-ink px-7 py-3 text-sm text-ivory">Back home</Link>
    </main>
  );
}
