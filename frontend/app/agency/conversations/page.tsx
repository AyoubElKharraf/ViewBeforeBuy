import { getConversations, type Conversation } from "@/lib/api";
import ConversationsClient from "./ConversationsClient";

export default async function ConversationsPage() {
  let initialConversations: Conversation[] = [];
  try {
    initialConversations = await getConversations();
  } catch {
    initialConversations = [];
  }

  return <ConversationsClient initialConversations={initialConversations} />;
}
