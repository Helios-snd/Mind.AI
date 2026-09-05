import type { ApiClient } from "./client";
import type {
  CheckIn,
  CheckInDraft,
  CrisisPlan,
  EscalationBrief,
  OnboardingProgress,
  TalkConversation,
  TalkStreamEvent,
  TrendRange,
  Trends,
  TrustedContact,
  AssessmentAnswer,
  AssessmentInstrument,
  AssessmentResult,
} from "./types";

/**
 * The real backend client. Same interface as mockClient, so no component
 * changes when this is swapped in at hooks.ts.
 *
 * Auth is entirely in httpOnly cookies — nothing here reads or stores a token,
 * and nothing is readable from JavaScript. `credentials: "include"` is what
 * carries the session; requests go to a same-origin path that next.config.mjs
 * proxies to FastAPI.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail || body?.title || res.statusText;
  } catch {
    return res.statusText;
  }
}

async function raw(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}

/**
 * Recover a session, then let the caller retry once.
 *
 * Order matters: refresh is tried before minting. Going straight to
 * /auth/anonymous on a 401 would hand a returning student a brand-new empty
 * account and silently orphan everything they had.
 */
async function recoverSession(): Promise<boolean> {
  const refreshed = await raw("/auth/refresh", { method: "POST" });
  if (refreshed.ok) return true;

  const minted = await raw("/auth/anonymous", { method: "POST" });
  return minted.ok;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await raw(path, init);

  if (res.status === 401) {
    const recovered = await recoverSession();
    if (recovered) res = await raw(path, init);
  }

  if (!res.ok) throw new HttpError(res.status, await readError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const httpClient: ApiClient = {
  getOnboardingProgress: () =>
    request<OnboardingProgress>("/onboarding"),

  saveOnboardingStep: (patch) =>
    request<OnboardingProgress>("/onboarding", {
      method: "PATCH",
      body: json(patch),
    }),

  completeOnboarding: () =>
    request<OnboardingProgress>("/onboarding/complete", { method: "POST" }),

  getCrisisPlan: () => request<CrisisPlan | null>("/crisis-plan"),

  getContact: () => request<TrustedContact | null>("/trusted-contact"),

  saveCrisisPlan: (plan) =>
    request<CrisisPlan>("/crisis-plan", { method: "PUT", body: json(plan) }),

  saveContact: (contact) =>
    request<TrustedContact>("/trusted-contact", {
      method: "PUT",
      body: json(contact),
    }),

  deleteAllData: () => request<void>("/me/data", { method: "DELETE" }),

  listCheckIns: () => request<CheckIn[]>("/checkins"),

  getCheckIn: (date) => request<CheckIn | null>(`/checkins/${date}`),

  saveCheckIn: (draft) =>
    request<CheckIn>("/checkins", { method: "POST", body: json(draft) }),

  deleteCheckIn: (date) =>
    request<void>(`/checkins/${date}`, { method: "DELETE" }),

  getTrends: (range) => request<Trends>(`/trends?range=${range}`),

  completeAssessment: (instrument: AssessmentInstrument, answers: AssessmentAnswer[]) =>
    request<AssessmentResult>("/screenings/complete", {
      method: "POST",
      body: json({ instrument, language: "en", answers }),
    }),

  getConversation: () => request<TalkConversation>("/talk/conversation"),

  deleteConversation: () =>
    request<void>("/talk/conversation", { method: "DELETE" }),

  getPendingEscalation: () =>
    request<EscalationBrief | null>("/escalations/pending"),

  approveEscalation: (id) =>
    request<void>(`/escalations/${id}/approve`, { method: "POST" }),

  declineEscalation: (id) =>
    request<void>(`/escalations/${id}/decline`, { method: "POST" }),

  cancelCountdown: (safetyAssessmentId) =>
    request<void>(`/talk/safety/${safetyAssessmentId}/cancel`, {
      method: "POST",
    }),

  expireCountdown: (safetyAssessmentId) =>
    request<void>(`/talk/safety/${safetyAssessmentId}/expire`, {
      method: "POST",
    }),
};

function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice("event:".length).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice("data:".length).trim());
  }
  return dataLines.length ? { event, data: dataLines.join("\n") } : null;
}

/**
 * Streams a Companion reply over Server-Sent Events. Sending a message
 * doesn't fit the Promise-returning ApiClient shape (same reasoning as
 * authApi below), so this sits alongside it rather than on the interface —
 * see `streamTalkMessage` in ./hooks for the client-selection point.
 */
export function httpTalkStream(
  text: string,
  conversationId: string | null,
  onEvent: (event: TalkStreamEvent) => void,
): { cancel: () => void } {
  const controller = new AbortController();

  const post = () =>
    raw("/talk/messages", {
      method: "POST",
      body: json({ text, conversation_id: conversationId }),
      signal: controller.signal,
    });

  (async () => {
    let res = await post();

    if (res.status === 401) {
      const recovered = await recoverSession();
      if (recovered) res = await post();
    }

    if (!res.ok || !res.body) {
      onEvent({ type: "error", message: await readError(res) });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const parsed = parseSseBlock(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (!parsed) continue;

        const payload = JSON.parse(parsed.data);
        if (parsed.event === "meta") {
          onEvent({
            type: "meta",
            conversationId: payload.conversation_id,
            messageId: payload.message_id,
            tier3Kind: payload.tier3_kind ?? null,
            safetyAssessmentId: payload.safety_assessment_id ?? null,
          });
        } else if (parsed.event === "token") {
          onEvent({ type: "token", text: payload.text });
        } else if (parsed.event === "done") {
          onEvent({ type: "done", messageId: payload.message_id });
        } else if (parsed.event === "error") {
          onEvent({ type: "error", message: payload.message });
        }
      }
    }
  })().catch((err) => {
    if (controller.signal.aborted) return;
    onEvent({
      type: "error",
      message: err instanceof Error ? err.message : "network error",
    });
  });

  return { cancel: () => controller.abort() };
}

/** Auth calls that sit outside the ApiClient surface, used by /login and the
 *  onboarding claim step. */
export const authApi = {
  async claim(destination: string): Promise<{ devCode: string | null }> {
    const body = await request<{ ok: boolean; dev_code: string | null }>(
      "/auth/claim",
      { method: "POST", body: json({ destination }) },
    );
    return { devCode: body.dev_code };
  },

  async login(destination: string): Promise<{ devCode: string | null }> {
    const body = await request<{ ok: boolean; dev_code: string | null }>(
      "/auth/login",
      { method: "POST", body: json({ destination }) },
    );
    return { devCode: body.dev_code };
  },

  async verify(destination: string, code: string): Promise<{ onboarded: boolean }> {
    const body = await request<{ onboarded: boolean }>("/auth/verify", {
      method: "POST",
      body: json({ destination, code }),
    });
    return { onboarded: body.onboarded };
  },
};

export { HttpError };
