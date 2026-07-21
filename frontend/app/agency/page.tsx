import { getConversations, type Conversation } from "@/lib/api";
import AgencyDashboardClient from "./AgencyDashboardClient";

export default async function AgencyDashboardPage() {
  let initialConversations: Conversation[] = [];
  try {
    initialConversations = await getConversations();
  } catch {
    initialConversations = [];
  }

  return <AgencyDashboardClient initialConversations={initialConversations} />;
}
