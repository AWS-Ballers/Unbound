import { z } from "zod";

export const chatReferenceKinds = ["workspace", "source", "clip", "image"] as const;

export const chatReferenceSchema = z.object({
  kind: z.enum(chatReferenceKinds),
  id: z.string().min(1),
  label: z.string().min(1),
});

export type ChatReference = z.infer<typeof chatReferenceSchema>;

export type ChatReferenceOption = ChatReference & {
  description?: string;
};

export function formatReferenceToken(label: string) {
  return `/${label.replace(/\s+/g, " ").trim()}`;
}

export function extractReferencesFromMessage(message: string, references: ChatReference[]) {
  if (!references.length) {
    return { displayMessage: message, activeReferences: [] as ChatReference[] };
  }

  const activeReferences = references.filter((reference) =>
    message.includes(formatReferenceToken(reference.label)),
  );

  return { displayMessage: message, activeReferences };
}
