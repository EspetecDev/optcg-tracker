import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    return Response.json({ message: "Friend request accepted for " + requesterID, success: true }, {status: 200});
}

export async function GET(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });   

    // todo
    return Response.json();
}