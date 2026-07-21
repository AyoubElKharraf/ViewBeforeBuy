import { getProperties, type Property } from "@/lib/api";
import ClientHomeClient from "./ClientHomeClient";

export default async function ClientHomePage() {
  let properties: Property[] = [];
  try {
    properties = await getProperties();
  } catch {
    properties = [];
  }

  return <ClientHomeClient properties={properties} />;
}
