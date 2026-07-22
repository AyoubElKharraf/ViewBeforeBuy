import { prisma } from "@viewbeforebuy/database";
import { cached } from "../shared/redis.js";

export interface CreditInput {
  propertyPrice: number;
  downPayment: number;
  duration: number;
  annualRate: number;
}

export interface CreditResult {
  loanAmount: number;
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
}

export function calculateCredit(input: CreditInput): CreditResult {
  const loanAmount = Math.max(0, input.propertyPrice - input.downPayment);
  const monthlyRate = input.annualRate / 100 / 12;
  const months = input.duration * 12;

  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / months
      : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1);

  const totalCost = monthlyPayment * months;
  const totalInterest = totalCost - loanAmount;

  return { loanAmount, monthlyPayment, totalCost, totalInterest };
}

export function formatDH(n: number): string {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n)) + " DH"
  );
}

export interface EligibilityInput {
  monthlyIncome: number;
  existingDebts: number;
  downPayment: number;
  duration: number;
  loanAmount?: number;
}

export interface EligibilityResult {
  score: number;
  status: "eligible" | "borderline" | "insufficient";
  maxLoan: number;
  debtRatio: number;
  maxMonthly: number;
}

export function calculateEligibility(input: EligibilityInput): EligibilityResult {
  const maxDebtRatio = 0.33;
  const maxMonthly = Math.max(0, input.monthlyIncome * maxDebtRatio - input.existingDebts);
  const monthlyRate = 0.043 / 12;
  const months = input.duration * 12;
  const maxLoan =
    monthlyRate === 0
      ? maxMonthly * months
      : (maxMonthly * (Math.pow(1 + monthlyRate, months) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, months));

  const target = input.loanAmount ?? maxLoan;
  const loanRatio = target > 0 ? Math.min(1, maxLoan / target) : 1;
  const downRatio = target > 0 ? input.downPayment / target : 0;
  const score = Math.round(Math.min(100, loanRatio * 70 + Math.min(30, downRatio * 100 * 1.5)));

  const debtRatio =
    input.monthlyIncome > 0 ? ((input.existingDebts + maxMonthly) / input.monthlyIncome) * 100 : 0;

  return {
    score,
    status: score >= 70 ? "eligible" : score >= 40 ? "borderline" : "insufficient",
    maxLoan,
    debtRatio,
    maxMonthly,
  };
}

export type BankDto = {
  id: string;
  name: string;
  rate: number;
  maxDuration: number;
  minDownPayment: number;
  logo: string;
  recommended: boolean;
  features: string[];
};

export async function listBanks(): Promise<BankDto[]> {
  return cached("banks:list", 300, async () => {
    const banks = await prisma.bank.findMany({
      orderBy: { rate: "asc" },
    });

    return banks.map((bank: {
    id: string;
    name: string;
    rate: number;
    maxDuration: number;
    minDownPayment: number;
    logo: string;
    recommended: boolean;
    features: string[];
  }) => ({
      id: bank.id,
      name: bank.name,
      rate: bank.rate,
      maxDuration: bank.maxDuration,
      minDownPayment: bank.minDownPayment,
      logo: bank.logo,
      recommended: bank.recommended,
      features: bank.features,
    }));
  });
}
