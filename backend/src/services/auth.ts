import { prisma } from "@viewbeforebuy/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/error.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  provider: string;
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  provider: string;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider,
  };
}

export function signToken(user: { id: string; email: string; role: string }): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
  role?: "CLIENT" | "AGENCY";
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, "Cet email est déjà utilisé");

  const password = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password,
      name: input.name ?? null,
      provider: "local",
      role: input.role ?? "CLIENT",
    },
  });

  return { user: toPublicUser(user), token: signToken(user) };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.password) throw new HttpError(401, "Identifiants invalides");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new HttpError(401, "Identifiants invalides");

  return { user: toPublicUser(user), token: signToken(user) };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, "Utilisateur introuvable");
  return toPublicUser(user);
}

export async function findOrCreateOAuthUser(input: {
  provider: string;
  providerId: string;
  email: string;
  name?: string;
  avatar?: string;
}) {
  let user = await prisma.user.findUnique({
    where: { provider_providerId: { provider: input.provider, providerId: input.providerId } },
  });

  if (!user && input.email) {
    // Rattache un compte local existant au fournisseur OAuth
    user = await prisma.user.findUnique({ where: { email: input.email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider: input.provider, providerId: input.providerId, avatar: input.avatar ?? user.avatar },
      });
    }
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name ?? null,
        avatar: input.avatar ?? null,
        provider: input.provider,
        providerId: input.providerId,
      },
    });
  }

  return { user: toPublicUser(user), token: signToken(user) };
}
