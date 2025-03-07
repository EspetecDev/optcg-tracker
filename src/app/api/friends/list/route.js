import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { dbAdmin } from "@/lib/firebaseAdmin";

export async function GET(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userID = session.user.id;
    const userRef = dbAdmin.collection("users").doc(userID);
    const userDoc = await userRef.get();
    const friendsIDs = userDoc.data().friends ? userDoc.data().friends : [];
    // var friends = [];
    const isValid = Array.isArray(friendsIDs) && friendsIDs.length > 0;
            
        const friends = await Promise.all(friendsIDs.map(friendID => dbAdmin.collection("users").doc(friendID).get())).then(
            d => d.map(doc => ({ id: doc.id, name: doc.data().name, image: doc.data().image }))
        );

    return Response.json({ message: "Get user "+userID+" friends: "+friends, success: true, friends: friends }, {status: 200});
}