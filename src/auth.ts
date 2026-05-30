import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/db";
import { env, flags } from "@/lib/env";
import { demoViewer } from "@/lib/mock-data";

const providers = [];

if (flags.hasGitHubAuth) {
  providers.push(
    GitHub({
      clientId: env.githubId!,
      clientSecret: env.githubSecret!,
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

      if (
        flags.isDemoMode &&
        email === demoViewer.email &&
        password === "Launchly123!"
      ) {
        return {
          id: demoViewer.id,
          email: demoViewer.email,
          name: demoViewer.name,
          image: demoViewer.image,
        };
      }

      if (!flags.hasDatabase) {
        return null;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
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
