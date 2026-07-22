const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TOKEN_KEY = "vbb_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

export type Property = {
  id: string;
  name: string;
  type: string;
  city: string;
  neighborhood: string;
  price: number;
  superficie: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  locationScore: number;
  status: string;
  description: string;
  imageUrl?: string | null;
};

export type ConversationMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: ConversationMessage[];
};

export type Bank = {
  id?: string;
  name: string;
  rate: number;
  maxDuration: number;
  minDownPayment: number;
  logo: string;
  recommended: boolean;
  features: string[];
};

export type ChatRole = "agency" | "client" | "report";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  provider: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function register(input: { email: string; password: string; name?: string }) {
  const res = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(res.token);
  return res;
}

export async function login(input: { email: string; password: string }) {
  const res = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(res.token);
  return res;
}

export function getMe() {
  return request<{ user: AuthUser }>("/api/auth/me");
}

export function logout() {
  clearToken();
}

export function googleLoginUrl() {
  return `${API_URL}/api/auth/google`;
}

export type CheckoutResponse = {
  id: string;
  url: string | null;
  amount: number;
  currency: string;
};

export function createCheckout(input: { propertyId: string; amount?: number }) {
  return request<CheckoutResponse>("/api/payments/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadPropertyImage(propertyId: string, file: File) {
  const token = getToken();
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/api/properties/${propertyId}/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) {
    let message = `Upload échoué (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as Property;
}

export function getProperties(filters?: { type?: string; city?: string }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.city) params.set("city", filters.city);
  const qs = params.toString();
  return request<Property[]>(`/api/properties${qs ? `?${qs}` : ""}`);
}

export function getProperty(id: string) {
  return request<Property>(`/api/properties/${id}`);
}

export function getConversations() {
  return request<Conversation[]>("/api/conversations");
}

export function getConversation(id: string) {
  return request<Conversation>(`/api/conversations/${id}`);
}

export function postMessage(
  conversationId: string,
  message: { role: "user" | "assistant"; content: string; timestamp: string },
) {
  return request<Conversation>(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(message),
  });
}

export function getBanks() {
  return request<Bank[]>("/api/banks");
}

export function postChat(input: { message: string; role?: ChatRole; context?: string }) {
  return request<{ text: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
