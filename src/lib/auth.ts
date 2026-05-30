import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";
import type { Provider } from "next-auth/providers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
}

/** Only register OAuth providers that have valid credentials */
function getProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    );
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })
    );
  }

  return providers;
}

const providers = getProviders();
const hasDatabase = !!process.env.DATABASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: hasDatabase
    ? (PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>)
    : undefined,
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/en/auth/signin",
    error: "/en/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
      } else if (token.id && hasDatabase) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          if (dbUser) token.role = dbUser.role;
        } catch {
          // DB unavailable — keep existing token role
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "USER";
      }
      return session;
    },
  },
  trustHost: true,
});

/** Whether OAuth sign-in is configured */
export const isAuthConfigured = providers.length > 0 && !!process.env.AUTH_SECRET;
