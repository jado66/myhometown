// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "src/utils/auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const isValidUsername =
          credentials.username === process.env.ADMIN_USERNAME;
        if (!isValidUsername) {
          console.log("Username mismatch");
          return null;
        }

        try {
          const isValidPassword = await verifyPassword(
            credentials.password,
            process.env.ADMIN_PASSWORD_HASH.replace(/#/g, "$")
          );
          console.log("Password verification result:", isValidPassword);

          if (isValidUsername && isValidPassword) {
            return {
              id: "1",
              name: process.env.ADMIN_USERNAME,
              role: "admin",
            };
          }
        } catch (error) {
          console.error("Error during password verification:", error);
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/admin-dashboard/classes/login", // Custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
