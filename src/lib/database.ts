import { Prisma } from "@prisma/client";

const UNREACHABLE_CODES = new Set(["P1000", "P1001", "P1017"]);

export function isDatabaseUnreachableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return UNREACHABLE_CODES.has(error.code);
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: string }).code);
    return UNREACHABLE_CODES.has(code);
  }

  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Can't reach database server");
}

export function logDatabaseFallback(context: string) {
  console.warn(
    `[launchly] ${context}: Postgres is not reachable. Using demo workspace data. ` +
      "Run `npm run db:up` or set DEMO_MODE=true in .env.",
  );
}
