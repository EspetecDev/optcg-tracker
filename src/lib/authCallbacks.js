import { db } from "@/app/api/auth/[...nextauth]/route";

// If user does not exist, initialize the fields
export async function signIn({ user }) {
  const userRef = db.collection("users").doc(user.id);
  const doc = await userRef.get();
  console.log('doc ', doc);
  if (!doc.exists) {
    await userRef.set({
      name: user.name,
      email: user.email,
      image: user.image,
      friends: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  return true;
}

// Check if session is from this user
export async function session({ session, user }) {
  session.user.id = user?.id;
  return session;
}
