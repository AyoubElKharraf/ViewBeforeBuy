import "express";

declare global {
  namespace Express {
    // Étend le type User utilisé par Passport (req.user)
    interface User {
      id: string;
      email: string;
      role: string;
    }
  }
}

export {};
