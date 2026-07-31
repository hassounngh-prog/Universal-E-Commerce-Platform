import type { NextAuthConfig, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authConfig = {
  providers: [],
  session: { strategy: "jwt" } as const,
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User;
    }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any;
      token: JWT;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
