import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { signIn, session } from "@/lib/authCallbacks";
import { db } from "@/lib/firebase";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: FirestoreAdapter(db), // Store users in Firestore
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: { signIn, session },
};

const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
