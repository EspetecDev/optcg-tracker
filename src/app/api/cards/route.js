import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { dbAdmin } from "@/lib/firebaseAdmin";

export async function GET(req){

    const session = await getServerSession(authOptions);
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });   

    // Get query parameters
    const url = new URL(req.url);
    const cardId = url.searchParams.get('id');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const page = parseInt(url.searchParams.get('page') || '0');
    
    try {
        // If a specific card ID is provided, return just that card
        if (cardId) {
            const cardDoc = await dbAdmin.collection('cards').doc(cardId).get();
            
            if (!cardDoc.exists) {
                return Response.json({ error: "Card not found" }, { status: 404 });
            }
            
            return Response.json({ 
                card: { id: cardDoc.id, ...cardDoc.data() }
            });
        }
        
        // Otherwise, return paginated list of cards
        let query = dbAdmin.collection('cards');
        
        // Apply pagination
        query = query.limit(limit).offset(page * limit);
        
        const snapshot = await query.get();
        const cards = [];
        
        snapshot.forEach(doc => {
            cards.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return Response.json({ 
            cards,
            pagination: {
                page,
                limit,
                total: cards.length
            }
        });
    } catch (error) {
        console.error("Error fetching cards:", error);
        return Response.json({ error: "Failed to fetch cards" }, { status: 500 });
    }
}