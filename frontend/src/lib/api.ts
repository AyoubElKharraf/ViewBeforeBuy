const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
