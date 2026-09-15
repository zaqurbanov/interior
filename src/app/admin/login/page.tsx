import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const safe = callbackUrl?.startsWith("/admin") ? callbackUrl : "/admin";
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="font-serif text-3xl">A&amp;V Interiors</p>
        <p className="mt-1 text-sm text-graphite">Sign in to the admin panel</p>
        <LoginForm callbackUrl={safe} />
      </div>
    </main>
  );
}
