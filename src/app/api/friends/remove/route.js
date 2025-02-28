import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { toDeleteID } = await req.json();
    if (!toDeleteID)
        return Response.json({ error: "Missing toDeleteID" }, { status: 400 });

    const userID = session.user.id;
    const userRef = dbAdmin.collection("users").doc(userID);
    const toDeleteRef = dbAdmin.collection("users").doc(toDeleteID);
    const toDeleteDoc = await toDeleteRef.get();
    if (!toDeleteDoc.exists)
        return Response.json({ error: "User: "+toDeleteID+" not found" }, { status: 400 });

    await userRef.update({
        friends: admin.firestore.FieldValue.arrayRemove(toDeleteID)
    });

    await toDeleteRef.update({
        friends: admin.firestore.FieldValue.arrayRemove(userID)
    });

    return Response.json({ message: "Friend removed: " + toDeleteID, success: true }, {status: 200});
}