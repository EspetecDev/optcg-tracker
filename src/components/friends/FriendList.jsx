"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState} from "react";

export default function FriendList(){
    const { data: session } = useSession();
    const [ friends, setFriends ] = useState([]);

    useEffect( () => {
        if (!session?.user?.id)
            return;

        async function fetchFriends(){
            const res = await fetch('/api/friends/get');
            const data = await res.json();
            setFriends(data.friends);
        }

        fetchFriends();
    }, [session]);

    return (
    <div className="p-4">
        <h2 className="text-xl font-bold">Friends</h2>
        {friends.length > 0 ? (
        <ul>
            {friends.map((friend) => (
            <li key={friend.id} className="p-2 border-b">
                {friend.name}
            </li>
            ))}
        </ul>
        ) : (
        <p>No friends yet.</p>
        )}
    </div>
    );
}