import { getConversations, getProperties, type Conversation, type Property } from "@/lib/api";
import AgencyDashboardClient from "./AgencyDashboardClient";

export default async function AgencyDashboardPage() {
  let initialConversations: Conversation[] = [];
  let properties: Property[] = [];
  try {
    [initialConversations, properties] = await Promise.all([getConversations(), getProperties()]);
  } catch {
    initialConversations = [];
    properties = [];
  }

  return (
    <AgencyDashboardClient initialConversations={initialConversations} properties={properties} />
  );
}
