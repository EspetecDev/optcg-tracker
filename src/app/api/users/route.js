import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { dbAdmin } from "@/lib/firebaseAdmin";

export async function GET(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const usersRef = dbAdmin.collection("users");
    const usersCollection = await usersRef.get();
    var users = [];
    usersCollection.forEach( u => {
        if (u.id === session.user.id) return;
        users.push({ id: u.id, ...u.data() });
    });
    
    return Response.json({ message: "Get all users", success: true, data: users }, {status: 200});
}