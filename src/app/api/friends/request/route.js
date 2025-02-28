import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { targetID } = await req.json();
  if (!targetID)
    return Response.json({ error: "Missing receiverID" }, { status: 400 });

  const senderID = session.user.id;
  const recipientRef = dbAdmin.collection("users").doc(targetID);
  await recipientRef.update({
    requests: admin.firestore.FieldValue.arrayUnion(senderID),
  });

  return Response.json(
    { message: "Friend request sent!", success: true },
    { status: 200 }
  );
}


export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userID = session.user.id;
  const userRef = dbAdmin.collection("users").doc(userID);
  const userDoc = await userRef.get();
  const requestIDs = userDoc.data().requests ? userDoc.data().requests : [];
  var requests = [];
  if (Array.isArray(requestIDs) && requestIDs.length > 0)
  {
    for (const reqId of requestIDs)
    {
      const userReqRef = dbAdmin.collection("users").doc(reqId);
      const userReqDoc = await userReqRef.get();
      if (!userReqDoc.exists)
        return Response.json({ error: "User: " + reqId + " not found" }, { status: 400 });

      requests.push({ id: reqId, name: userReqDoc.data().name, image: userReqDoc.data().image });
    }
  }
  console.log(requests);
  
  return Response.json(
    { message: "Get user " + userID + " requests: " + requests, success: true, requests: requests },
    { status: 200 }
  );
}