import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateUser, updateLastLogin } from "@/lib/pg-auth"
import { auditAuth } from "@/lib/security/audit-log"

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  trustHost: true, // Required for Vercel and other proxied environments
  logger: {
    error(error: Error) {
      console.error('NextAuth Error:', error)
    },
    warn(code: string) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code: string, metadata: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const email = (credentials.email as string).toLowerCase().trim()
          const password = credentials.password as string

          // Use raw PostgreSQL authentication (bypasses Prisma Data Proxy issue)
          const user = await authenticateUser(email, password)

          if (!user) {
            // Audit failed login attempt (non-blocking)
            auditAuth.loginFailed(email, 'Invalid credentials').catch(() => {})
            return null
          }

          // Get user locations from staff profile
          let locationIds: string[] = []
          if (user.staffProfile?.locations) {
            locationIds = user.staffProfile.locations
              .filter(sl => sl.location?.id)
              .map(sl => sl.location.id)
          }

          // Update last login
          await updateLastLogin(user.id)

          // Audit successful login (non-blocking)
          auditAuth.loginSuccess(user.id, user.email, user.role).catch(() => {})

          return {
            id: user.id,
            name: user.staffProfile?.name || user.email.split('@')[0],
            email: user.email,
            role: user.role,
            locations: user.role === "ADMIN" ? ["all"] : locationIds,
          }
        } catch (error) {
          console.error("Auth error:", error)
          // Audit authentication error (non-blocking)
          if (credentials?.email && typeof credentials.email === 'string') {
            auditAuth.loginFailed(
              credentials.email,
              'Authentication system error'
            ).catch(() => {})
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id
          token.role = user.role
          token.locations = user.locations
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.locations = token.locations as string[]
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
})