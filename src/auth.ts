import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

import { authorizeCredentials } from "@/lib/auth-credentials";
import { prisma } from "@/lib/db";
import { env, flags } from "@/lib/env";

const providers = [];

if (flags.hasGitHubAuth) {
  providers.push(
    GitHub({
      clientId: env.githubId!,
      clientSecret: env.githubSecret!,
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  );
}

providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email =
        typeof credentials?.email === "string" ? credentials.email : "";
      const password =
        typeof credentials?.password === "string" ? credentials.password : "";

      if (!email || !password) {
        return null;
      }

      return authorizeCredentials(email, password);
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: flags.hasDatabase ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers,
  trustHost: true,
  secret: env.nextAuthSecret,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { id?: string }).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const tokenId = (token as { id?: string }).id;
      if (session.user && tokenId) {
        session.user.id = String(tokenId);
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
