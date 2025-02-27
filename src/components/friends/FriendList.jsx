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
            const res = await fetch('/api/friends/list');
            const data = await res.json();
            console.log("debug data: ", data);
            setFriends(data.friends? data.friends : []);
        }

        fetchFriends();
        // console.log("debug friends: ", friends);
    }, [session]);

    return (
    <div className="p-4">
        <h2 className="text-xl font-bold">Friends</h2>
        {Array.isArray(friends) && friends.length > 0 ? (
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