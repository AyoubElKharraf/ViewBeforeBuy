import { getConversations, getProperties, type Conversation, type Property } from "@/lib/api";
import StatsClient from "./StatsClient";

export default async function AgencyStatsPage() {
  let properties: Property[] = [];
  let conversations: Conversation[] = [];
  try {
    [properties, conversations] = await Promise.all([getProperties(), getConversations()]);
  } catch {
    properties = [];
    conversations = [];
  }

  return <StatsClient properties={properties} conversations={conversations} />;
}
