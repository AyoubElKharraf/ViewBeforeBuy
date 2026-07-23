import { getProperties, type Property } from "@/lib/api";
import LibraryClient from "./LibraryClient";

export default async function AgencyLibraryPage() {
  let properties: Property[] = [];
  try {
    properties = await getProperties();
  } catch {
    properties = [];
  }

  return <LibraryClient properties={properties} />;
}
