import { db } from "./firebase";


// If user does not exist, initialize the fields
export async function signIn({ user }) {

  console.log("signIn from: "+user.email);
  const userRef = db.collection("users").doc(user.id);
  const doc = await userRef.get();
  const data = doc.data();
  const friendsFieldExists = "friends" in data;

  console.log("userRef null: ",userRef == null);
  console.log("doc null: ",doc == null);
  console.log("friends exists: ", friendsFieldExists);
  
  if (!doc.exists) {
    console.log("user: "+user.id+" was not registered... initializing");

    await userRef.set({
      name: user.name,
      email: user.email,
      image: user.image,
      friends: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  else if (!friendsFieldExists) {
    
    console.log("user: "+user.id+" has no field friends... updating");
    await userRef.update({
      friends: [],
    });
  }
  return true;
}

// Check if session is from this user
export async function session({ session, user }) {
  console.log("session from: "+user.email);
  console.log(session)
  console.log(user)
  session.user.id = user?.id;
  return session;
}
