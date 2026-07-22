import { describe, expect, it } from "vitest";
import {
  calculateCredit,
  calculateEligibility,
  formatDH,
} from "../src/services/credit.js";

describe("calculateCredit", () => {
  it("calcule le montant emprunté (prix - apport)", () => {
    const r = calculateCredit({
      propertyPrice: 1_000_000,
      downPayment: 200_000,
      duration: 20,
      annualRate: 4.3,
    });
    expect(r.loanAmount).toBe(800_000);
  });

  it("mensualité sans intérêt = capital / nombre de mois", () => {
    const r = calculateCredit({
      propertyPrice: 1200,
      downPayment: 0,
      duration: 1,
      annualRate: 0,
    });
    expect(r.monthlyPayment).toBeCloseTo(100, 5);
  });

  it("les intérêts sont positifs quand le taux > 0", () => {
    const r = calculateCredit({
      propertyPrice: 1_000_000,
      downPayment: 0,
      duration: 25,
      annualRate: 4.3,
    });
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalCost).toBeGreaterThan(r.loanAmount);
  });

  it("apport >= prix => montant emprunté 0", () => {
    const r = calculateCredit({
      propertyPrice: 500_000,
      downPayment: 600_000,
      duration: 10,
      annualRate: 4,
    });
    expect(r.loanAmount).toBe(0);
  });
});

describe("calculateEligibility", () => {
  it("revenu élevé + gros apport => éligible", () => {
    const r = calculateEligibility({
      monthlyIncome: 30_000,
      existingDebts: 0,
      downPayment: 500_000,
      duration: 25,
      loanAmount: 800_000,
    });
    expect(r.status).toBe("eligible");
    expect(r.score).toBeGreaterThanOrEqual(70);
  });

  it("revenu faible + fortes dettes => insuffisant", () => {
    const r = calculateEligibility({
      monthlyIncome: 4_000,
      existingDebts: 3_000,
      downPayment: 0,
      duration: 25,
      loanAmount: 1_000_000,
    });
    expect(r.status).toBe("insufficient");
  });

  it("le taux d'endettement max suit la règle des 33%", () => {
    const r = calculateEligibility({
      monthlyIncome: 10_000,
      existingDebts: 0,
      downPayment: 100_000,
      duration: 20,
    });
    // maxMonthly = 33% du revenu quand aucune dette
    expect(r.maxMonthly).toBeCloseTo(3300, 5);
  });
});

describe("formatDH", () => {
  it("formate un montant en DH", () => {
    expect(formatDH(1234)).toContain("DH");
    expect(formatDH(1234.6)).toContain("1");
  });
});
