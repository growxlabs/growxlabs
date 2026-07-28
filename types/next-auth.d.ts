import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      organisation_id?: string;
      permissions?: string[];
      allowed_paths?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    organisation_id?: string;
    permissions?: string[];
    allowed_paths?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    organisation_id?: string;
    permissions?: string[];
    allowed_paths?: string[];
  }
}
