import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { clientIp } from "@/lib/client-ip";
import { connectDB } from "@/lib/db";
import { clearLoginFailures, isLoginBlocked, loginKeys, recordLoginFailure } from "@/lib/login-limit";
import { User } from "@/models";

/** Too many failed attempts; the login form shows its own message for it. */
export class LoginLimited extends CredentialsSignin {
  code = "rate_limited";
}

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = "$2b$12$0poV1Lm7R1NQinS4SSFigO42y.UZ8NtJUaPLS84m137s/r4wxWvzq"; // cost 12, like the seed

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        await connectDB();
        const keys = loginKeys(clientIp(request.headers), parsed.data.email);
        if (await isLoginBlocked(keys)) throw new LoginLimited();
        const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).lean();
        const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !ok) {
          await recordLoginFailure(keys);
          return null;
        }
        await clearLoginFailures(keys);
        return { id: String(user._id), email: user.email, name: user.name };
      },
    }),
  ],
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
