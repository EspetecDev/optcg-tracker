import { SessionContext } from "next-auth/react";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { db, admin } from "@/lib/firebase";



export async function GET(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userID = session.user.id;
    const userRef = db.collection("users").doc(userID);
    const friends = userRef.friends ? userRef.friends : [];
    // console.log(friends);

    return Response.json({ message: "Get user "+userID+" friends: "+friends, success: true, data: friends }, {status: 200});
}