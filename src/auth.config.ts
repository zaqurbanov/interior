import type { NextAuthConfig } from "next-auth";

// Edge-safe config shared by middleware and the full auth setup.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin/login")) return true;
      if (pathname.startsWith("/admin")) return Boolean(auth?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
