import { getProperties, type Property } from "@/lib/api";
import PropertiesClient from "./PropertiesClient";

export default async function PropertiesPage() {
  let properties: Property[] = [];
  try {
    properties = await getProperties();
  } catch {
    properties = [];
  }

  return <PropertiesClient properties={properties} />;
}
