import { getBanks, type Bank } from "@/lib/api";
import SimulatorClient from "./SimulatorClient";

export default async function SimulatorPage() {
  let banks: Bank[] = [];
  try {
    banks = await getBanks();
  } catch {
    banks = [];
  }

  return <SimulatorClient banks={banks} />;
}
