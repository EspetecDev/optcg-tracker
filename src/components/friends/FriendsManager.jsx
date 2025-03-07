"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FriendsManager() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchData() {
      const res = await fetch("/api/friends/list");
      const allfrriendsRes = await fetch("/api/users/");
      const requestRes = await fetch("/api/friends/request");
      const data = await res.json();
      const allData = await allfrriendsRes.json();
      const requestData = await requestRes.json();
      
      setUsers(allData.data.filter((user) => user.id !== session.user.id || data.friends.has(user.id)));
      setFilteredUsers(users);
      setFriends(data.friends);
      setRequests(requestData.requests);
    }

    const userRef = doc(db, "users", session.user.id); 
    const unsuscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
          const data = docSnap.data();
          setFriends(Array.isArray(data.friends) ? data.friends : []);
          const newRequests = data.requests || [];

          if (newRequests.length > requests.length) {
            toast("You have a new friend request.");
          }

          setRequests(newRequests);
      }
    });

    fetchData();

    return () => unsuscribe();

  }, [session]);

  // 🔎 Handle search input
  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(query) && !friends.includes(user.id))
      );
    }
  }

  async function sendFriendRequest(targetID) {
    await fetch("/api/friends/request", {
      method: "POST",
      body: JSON.stringify({ targetID }),
    });

    
  }

  async function acceptFriendRequest(requesterID) {
    await fetch("/api/friends/accept", {
      method: "POST",
      body: JSON.stringify({ requesterID }),
    });

    // Router.reload();
  }

  async function removeFriend(toDeleteID) {
    await fetch("/api/friends/remove", {
      method: "POST",
      body: JSON.stringify({ toDeleteID }),
    });
    
    // Router.reload();
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Friends</h2>

      <Card className="mb-4">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Your Friends</h3>
          {friends.length > 0 ? (
            friends.map((friend, idx) => (
              <div key={friend.id || idx} className="flex justify-between p-2 border-b">
                <Avatar>
                  <AvatarImage src={friend.image} />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <span>{friend.name}</span>
                <Button variant="destructive" onClick={() => removeFriend(friend.id).then(() => window.location.reload())}>
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p>No friends yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Pending Friend Requests</h3>
          {requests.length > 0 ? (
            requests.map((request, idx) => (
              <div key={request.id || idx} className="flex justify-between p-2 border-b">
                <Avatar>
                  <AvatarImage src={request.image} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{request.name}</span>
                <Button variant="success" onClick={() => acceptFriendRequest(request.id).then(() => window.location.reload())}>
                  Accept
                </Button>
              </div>
            ))
          ) : (
            <p>No pending requests.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Add Friends</h3>
          <Input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={handleSearch}
            className="mb-3"
          />
          { filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex justify-between p-2 border-b">
                <span>{user.name}</span>
                <Button variant="default" onClick={() => sendFriendRequest(user.id).then(() => window.location.reload())}>
                  Add Friend
                </Button>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
