import * as admin from "firebase-admin";



var serviceAccount = require("@/config/serviceAccountKey.json");
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
}

export const dbAdmin = admin.firestore(); // ✅ Firestore Admin (server-side only)
export default admin; // ✅ Firebase Admin (server-side only)