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

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n) + " DH";
}
