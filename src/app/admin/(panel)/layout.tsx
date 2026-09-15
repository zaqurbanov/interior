import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";
import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/site/Logo";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="md:flex">
      <aside className="border-b border-black/5 bg-white md:sticky md:top-0 md:h-svh md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-5">
          <Link href="/admin" className="block">
            <Logo brandName="Vladimir - Fasij" className="text-sm" />
            <span className="mt-1 block text-xs text-graphite">Admin panel</span>
          </Link>
          <AdminNav />
          <div className="mt-4 space-y-3 md:mt-auto border-t border-black/5 pt-4 text-sm md:block">
            <p className="truncate text-graphite">{session.user.email}</p>
            <Link href="/" target="_blank" className="block text-graphite hover:text-ink">View site ↗</Link>
            <form action={logout}>
              <button className="text-red-700 hover:underline">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
