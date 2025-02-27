import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { db } from "@/lib/firebase";
import admin from "firebase-admin";

export async function POST(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { requesterID } = await req.json();
    if (!requesterID)
        return Response.json({ error: "Missing receiverID" }, { status: 400 });

    const userID = session.user.id;
    const userRef = db.collection("users").doc(userID);
    const requesterRef = db.collection("users").doc(requesterID);
    const requesterDoc = await requesterRef.get();
    if (!requesterDoc.exists)
        return Response.json({ error: "User: "+requesterID+" not found" }, { status: 400 });

    await userRef.update({
        friends: admin.firestore.FieldValue.arrayUnion(requesterID),
        requests: admin.firestore.FieldValue.arrayRemove(requesterID),
    });

    await requesterRef.update({
        friends: admin.firestore.FieldValue.arrayUnion(userID),
    });

    return Response.json({ message: "Friend request accepted for " + requesterID, success: true }, {status: 200});
}