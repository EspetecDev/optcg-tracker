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
    var friends = [];
    if (Array.isArray(friendsIDs) && friendsIDs.length > 0)
    {
        for (const friendID of friendsIDs)
        {
            const friendRef = dbAdmin.collection("users").doc(friendID);
            const friendDoc = await friendRef.get();
            if (!friendDoc.exists)
                return Response.json({ error: "User: " + friendID + " not found" }, { status: 400 });
            friends.push({ id: friendID, name: friendDoc.data().name, image: friendDoc.data().image });
        }
    }

    return Response.json({ message: "Get user "+userID+" friends: "+friends, success: true, friends: friends }, {status: 200});
}