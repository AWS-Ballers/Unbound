"use client";

import { Loader2, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  type ChatReference,
  type ChatReferenceOption,
  extractReferencesFromMessage,
  formatReferenceToken,
} from "@/lib/chat-references";
import { ChatReferenceMenu } from "@/components/workspace/chat-reference-menu";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  citations?: unknown;
};

function getSlashState(value: string, cursor: number) {
  const beforeCursor = value.slice(0, cursor);
  const slashIndex = beforeCursor.lastIndexOf("/");

  if (slashIndex === -1) {
    return null;
  }

  const charBefore = slashIndex > 0 ? beforeCursor[slashIndex - 1] : " ";
  if (charBefore !== " " && charBefore !== "\n") {
    return null;
  }

  const query = beforeCursor.slice(slashIndex + 1);
  if (query.includes(" ") || query.includes("\n")) {
    return null;
  }

  return { slashIndex, query };
}

type ChatGenerationPayload = {
  kind: "image" | "video";
  label?: string;
  status?: string;
  outputUrl?: string | null;
};

export function ChatPanel({
  projectId,
  initialThreadId,
  initialMessages,
  header = {
    title: "Source assistant",
    detail: "Type / to reference a workspace file or source.",
  },
  quickPrompts = [
    "Find missing sources",
    "Suggest templates",
    "Image direction",
    "Summarize repo",
  ],
  onAssistantReply,
}: {
  projectId: string;
  initialThreadId?: string;
  initialMessages: ChatMessage[];
  header?: { title: string; detail: string };
  quickPrompts?: string[];
  onAssistantReply?: (payload: { generation?: ChatGenerationPayload | null }) => void;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [threadId, setThreadId] = useState(initialThreadId);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [referenceOptions, setReferenceOptions] = useState<ChatReferenceOption[]>([]);
  const [pickedReferences, setPickedReferences] = useState<ChatReference[]>([]);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashStart, setSlashStart] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void fetch(`/api/chat/references?projectId=${encodeURIComponent(projectId)}`)
      .then((response) => response.json())
      .then((payload) => {
        if (Array.isArray(payload?.options)) {
          setReferenceOptions(payload.options);
        }
      })
      .catch(() => {
        /* references are optional; chat still works */
      });
  }, [projectId]);

  const filteredOptions =
    slashQuery === null
      ? []
      : referenceOptions.filter((option) => {
          if (!slashQuery.trim()) return true;
          const haystack = `${option.label} ${option.description ?? ""}`.toLowerCase();
          return haystack.includes(slashQuery.trim().toLowerCase());
        });

  const syncSlashMenu = useCallback((value: string, cursor: number) => {
    const state = getSlashState(value, cursor);
    if (!state) {
      setSlashQuery(null);
      setSlashStart(null);
      setHighlightedIndex(0);
      return;
    }
    setSlashQuery(state.query);
    setSlashStart(state.slashIndex);
    setHighlightedIndex(0);
  }, []);

  function insertReference(option: ChatReferenceOption) {
    if (slashStart === null || !textareaRef.current) return;

    const token = formatReferenceToken(option.label);
    const before = message.slice(0, slashStart);
    const after = message.slice(textareaRef.current.selectionStart);
    const nextMessage = `${before}${token} ${after}`;
    const nextCursor = before.length + token.length + 1;

    setMessage(nextMessage);
    setPickedReferences((current) => {
      if (current.some((item) => item.kind === option.kind && item.id === option.id)) {
        return current;
      }
      return [...current, { kind: option.kind, id: option.id, label: option.label }];
    });
    setSlashQuery(null);
    setSlashStart(null);
    setHighlightedIndex(0);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  async function sendMessage() {
    if (!message.trim()) return;

    const text = message.trim();
    const { activeReferences } = extractReferencesFromMessage(text, pickedReferences);
    setPending(true);
    setMessages((current) => [
      ...current,
      { id: `local-${Date.now()}`, role: "USER", content: text },
    ]);
    setMessage("");
    setPickedReferences([]);
    setSlashQuery(null);
    setSlashStart(null);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        threadId,
        message: text,
        references: activeReferences,
      }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to send message");
      return;
    }

    const payload = await response.json();
    setThreadId(payload.thread?.id ?? threadId);
    setMessages((current) => [
      ...current,
      {
        id: payload.assistantMessage.id,
        role: payload.assistantMessage.role,
        content: payload.assistantMessage.content,
        citations: payload.assistantMessage.citations,
      },
    ]);
    onAssistantReply?.({ generation: payload.generation ?? null });
  }

  return (
    <div className="right-panel">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{header.title}</p>
            <p className="text-xs text-[var(--muted)]">{header.detail}</p>
          </div>
        </div>
      </div>

      <div className="right-panel-body space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted)]">
            Ask what files, repos, or websites to add before generating images or video. Use{" "}
            <span className="font-medium text-[var(--foreground)]">/</span> to ground answers in a
            specific workspace or source.
          </div>
        ) : null}
        {messages.map((item) => (
          <div
            key={item.id}
            className={`chat-bubble ${
              item.role === "USER" ? "chat-bubble-user" : "chat-bubble-assistant"
            }`}
          >
            <p>{item.content}</p>
            {Array.isArray(item.citations) && item.citations.length ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {(item.citations as string[]).slice(0, 4).map((citation) => (
                  <span
                    key={citation}
                    className="rounded-full border border-[var(--border)] px-2 py-1 text-[var(--muted)]"
                  >
                    {citation}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <div className="mb-3 grid grid-cols-2 gap-2">
          {quickPrompts.map((quickPrompt) => (
              <button
                key={quickPrompt}
                type="button"
                onClick={() => setMessage(quickPrompt)}
                className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {quickPrompt}
              </button>
            ),
          )}
        </div>
        {pickedReferences.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {pickedReferences.map((reference) => (
              <span
                key={`${reference.kind}:${reference.id}`}
                className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs text-[var(--foreground)]"
              >
                {formatReferenceToken(reference.label)}
              </span>
            ))}
          </div>
        ) : null}
        <div className="relative">
          {slashQuery !== null ? (
            <ChatReferenceMenu
              options={referenceOptions}
              query={slashQuery}
              highlightedIndex={highlightedIndex}
              onSelect={insertReference}
            />
          ) : null}
          <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-white p-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                syncSlashMenu(event.target.value, event.target.selectionStart);
              }}
              onClick={(event) => {
                syncSlashMenu(event.currentTarget.value, event.currentTarget.selectionStart);
              }}
              onKeyDown={(event) => {
                if (slashQuery !== null && filteredOptions.length) {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setHighlightedIndex((index) =>
                      index + 1 >= filteredOptions.length ? 0 : index + 1,
                    );
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setHighlightedIndex((index) =>
                      index - 1 < 0 ? filteredOptions.length - 1 : index - 1,
                    );
                    return;
                  }
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    insertReference(filteredOptions[highlightedIndex] ?? filteredOptions[0]);
                    return;
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setSlashQuery(null);
                    setSlashStart(null);
                    return;
                  }
                }

                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask what sources to add next… type / to reference"
              className="min-h-20 flex-1 resize-none bg-transparent text-sm text-[var(--foreground)] outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={pending || !message.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
