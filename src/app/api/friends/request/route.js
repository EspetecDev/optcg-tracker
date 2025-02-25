import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/firebase";
//  import * as admin from "firebase-admin";

//  const db = admin.firestore();

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverID } = await req.json();
  if (!receiverID)
    return Response.json({ error: "Missing receiverID" }, { status: 400 });

  const senderID = session.user.id;
  const recipientRef = db.collection("users").doc(receiverID);
  await recipientRef.update({
    requests: admin.firestore.FieldValue.arrayUnion(senderID),
  });

  return Response.json(
    { message: "Friend request sent!", success: true },
    { status: 200 }
  );
}
