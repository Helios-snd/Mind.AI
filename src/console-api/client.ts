import type {
  CounsellorOut,
  EscalationCase,
  QueueItem,
  SafetyCase,
} from "./types";

/**
 * The counsellor console's own client -- deliberately not an extension of
 * src/api/client.ts's ApiClient. That interface exists to support the
 * student app's mock/offline mode; the console has no offline mode, a
 * completely different auth (console_session, not mind_session), and a
 * completely different data shape, so bolting it on would mean threading a
 * principal type through an interface never designed for it.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export class ConsoleHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ConsoleHttpError";
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) throw new ConsoleHttpError(res.status, await readError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const consoleApi = {
  login: (email: string, password: string) =>
    request<CounsellorOut>("/console/auth/login", {
      method: "POST",
      body: json({ email, password }),
    }),

  refresh: () => request<CounsellorOut>("/console/auth/refresh", { method: "POST" }),

  logout: () => request<void>("/console/auth/logout", { method: "POST" }),

  me: () => request<CounsellorOut>("/console/auth/me"),

  getQueue: () => request<QueueItem[]>("/console/queue"),

  getSafetyCase: (id: string) => request<SafetyCase>(`/console/cases/safety/${id}`),

  getEscalationCase: (id: string) =>
    request<EscalationCase>(`/console/cases/escalation/${id}`),

  reviewSafetyCase: (id: string) =>
    request<void>(`/console/cases/safety/${id}/review`, { method: "POST" }),

  reviewEscalationCase: (id: string) =>
    request<void>(`/console/cases/escalation/${id}/review`, { method: "POST" }),
};
