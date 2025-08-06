import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { authApi } from "@/lib/authApi";

const providers: Provider[] = [
  // GitHub({
  //   clientId: process.env.GITHUB_CLIENT_ID,
  //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
  // }),
  // Google({
  //   clientId: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // }),
  Credentials({
    credentials: {
      email: { label: "Email Address", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(c) {
      try {
        // Call backend login API using authApi
        const user = await authApi.login({
          email: c.email as string,
          password: c.password as string,
        });

        return {
          id: user._id || user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        console.error("Login error:", error);
        return null;
      }
    },
  }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublicPage = nextUrl.pathname.startsWith("/public");
      const isDashboardRoute = nextUrl.pathname === "/";
      const isUsersRoute = nextUrl.pathname.startsWith("/users");
      const isAppsRoute = nextUrl.pathname.startsWith("/apps");
      const isAdmin = session?.user?.role?.toLowerCase() === "admin";

      // Check if user is trying to access /users routes
      if (
        (isAppsRoute || isUsersRoute || isDashboardRoute) &&
        isLoggedIn &&
        !isAdmin
      ) {
        // Redirect non-admin users to dashboard
        return Response.redirect(new URL("/logs", nextUrl));
      }

      if (isPublicPage || isLoggedIn) {
        return true;
      }

      return false; // Redirect unauthenticated users to login page
    },
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
