import { describe, expect, it } from "vitest";
import { calculateCredit, calculateEligibility, formatDH } from "./creditCalculator";

describe("calculateCredit (frontend)", () => {
  it("montant emprunté = prix - apport", () => {
    const r = calculateCredit({
      propertyPrice: 1_200_000,
      downPayment: 240_000,
      duration: 25,
      annualRate: 4.3,
    });
    expect(r.loanAmount).toBe(960_000);
  });

  it("sans intérêt : mensualité = capital / mois", () => {
    const r = calculateCredit({
      propertyPrice: 2400,
      downPayment: 0,
      duration: 1,
      annualRate: 0,
    });
    expect(r.monthlyPayment).toBeCloseTo(200, 5);
  });

  it("coût total > capital quand taux > 0", () => {
    const r = calculateCredit({
      propertyPrice: 800_000,
      downPayment: 0,
      duration: 20,
      annualRate: 5,
    });
    expect(r.totalCost).toBeGreaterThan(r.loanAmount);
    expect(r.totalInterest).toBeGreaterThan(0);
  });
});

describe("calculateEligibility (frontend)", () => {
  it("profil solide => éligible", () => {
    const r = calculateEligibility({
      monthlyIncome: 25_000,
      existingDebts: 0,
      downPayment: 400_000,
      duration: 25,
      loanAmount: 700_000,
    });
    expect(r.status).toBe("eligible");
  });

  it("profil fragile => insuffisant", () => {
    const r = calculateEligibility({
      monthlyIncome: 5_000,
      existingDebts: 2_500,
      downPayment: 0,
      duration: 25,
      loanAmount: 1_000_000,
    });
    expect(r.status).toBe("insufficient");
  });
});

describe("formatDH", () => {
  it("ajoute le suffixe DH", () => {
    expect(formatDH(1000)).toContain("DH");
  });
});
