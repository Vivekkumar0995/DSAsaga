import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/user_model";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          let existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            existingUser = await UserModel.create({
              name: user.name,
              email: user.email,
              password: Math.random().toString(36).slice(-8),
              profileImage: user.image || "",
              isAccountVerified: true,
            });
          }

          user.id = existingUser._id.toString();
          return true;
        } catch (error) {
          console.error("Error saving Google user:", error);
          return false;
        }
      }
      return true; 
    },
    async jwt({ token, user }) {
      // Pass the MongoDB user ID to the JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the MongoDB user ID to the session object
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
