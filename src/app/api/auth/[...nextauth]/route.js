import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { signIn, session } from "@/lib/authCallbacks";
import * as admin from "firebase-admin";

var serviceAccount = require("@/config/serviceAccountKey.json");




// export const db = admin.firestore();
// export default admin;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: FirestoreAdapter(db), // Store users in Firestore
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: { signIn, session },
};

const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
