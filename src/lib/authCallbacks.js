import { dbAdmin } from "./firebaseAdmin";


// If user does not exist, initialize the fields
export async function signIn({ user }) {

  const userRef = dbAdmin.collection("users").doc(user.id);
  const doc = await userRef.get();
  const data = doc.data();
  const friendsFieldExists = "friends" in data;
  
  if (!doc.exists) {

    await userRef.set({
      name: user.name,
      email: user.email,
      image: user.image,
      friends: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  else if (!friendsFieldExists) {
    
    await userRef.update({
      friends: [],
    });
  }
  return true;
}

// Check if session is from this user
export async function session({ session, user }) {
  session.user.id = user?.id;
  return session;
}
