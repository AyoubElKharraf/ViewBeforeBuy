import type { Request, Response, NextFunction } from "express";
import { listBanks } from "../services/credit.js";

export async function getBanksHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const banks = await listBanks();
    res.json(banks);
  } catch (err) {
    next(err);
  }
}
