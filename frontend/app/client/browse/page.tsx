import { getProperties, type Property } from "@/lib/api";
import BrowseClient from "./BrowseClient";

export default async function BrowsePage() {
  let properties: Property[] = [];
  try {
    properties = await getProperties();
  } catch {
    properties = [];
  }

  return <BrowseClient properties={properties} />;
}
