import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Por enquanto, vamos usar um usuário hardcoded para testes
// Em produção, isso viria do banco de dados
const DEMO_USER = {
  id: "1",
  email: "admin@inboxrecovery.com",
  name: "Admin",
  password: "$2b$10$VfmXiCRdvKxbNUURFAbfKuAnhEuTixAoVQe2JWhPGyDpPVC4EuKk2", // senha: admin123
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Em produção, buscar usuário do banco
        if (credentials.email !== DEMO_USER.email) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          DEMO_USER.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}; 