import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { env, flags } from "@/lib/env";
import { demoViewer } from "@/lib/mock-data";

const DEMO_PASSWORD = "Launchly123!";

export function isDemoCredentialLogin(email: string, password: string) {
  return email.trim().toLowerCase() === demoViewer.email.toLowerCase() && password === DEMO_PASSWORD;
}

async function ensureDemoUserInDatabase() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  return prisma.user.upsert({
    where: { email: demoViewer.email },
    update: {
      name: demoViewer.name,
      image: demoViewer.image,
      passwordHash,
    },
    create: {
      email: demoViewer.email,
      name: demoViewer.name,
      image: demoViewer.image,
      passwordHash,
    },
  });
}

export async function authorizeCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const demoLogin = isDemoCredentialLogin(normalizedEmail, password);

  if (flags.isDemoMode && demoLogin) {
    return {
      id: demoViewer.id,
      email: demoViewer.email,
      name: demoViewer.name,
      image: demoViewer.image,
    };
  }

  if (!flags.hasDatabase) {
    return demoLogin
      ? {
          id: demoViewer.id,
          email: demoViewer.email,
          name: demoViewer.name,
          image: demoViewer.image,
        }
      : null;
  }

  try {
    if (demoLogin) {
      const user = await ensureDemoUserInDatabase();
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

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
  } catch (error) {
    console.error("[auth] credentials authorize failed:", error);

    if (demoLogin && env.nodeEnv === "development") {
      return {
        id: demoViewer.id,
        email: demoViewer.email,
        name: demoViewer.name,
        image: demoViewer.image,
      };
    }

    return null;
  }
}
