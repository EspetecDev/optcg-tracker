"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      const data = await res.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
      setFriends(data.friends);
      setRequests(data.requests);
    }

    fetchData();
  }, [session]);

  // 🔎 Handle search input
  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(query))
      );
    }
  }

  async function sendFriendRequest(recipientId) {
    await fetch("/api/friends/request", {
      method: "POST",
      body: JSON.stringify({ recipientId }),
    });
  }

  async function acceptFriendRequest(requesterId) {
    await fetch("/api/friends/accept", {
      method: "POST",
      body: JSON.stringify({ requesterId }),
    });
  }

  async function removeFriend(friendId) {
    await fetch("/api/friends/remove", {
      method: "POST",
      body: JSON.stringify({ friendId }),
    });
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Friends</h2>

      <Card className="mb-4">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Your Friends</h3>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex justify-between p-2 border-b">
                <span>{friend.name}</span>
                <Button variant="destructive" onClick={() => removeFriend(friend.id)}>
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
            requests.map((request) => (
              <div key={request.id} className="flex justify-between p-2 border-b">
                <span>{request.name}</span>
                <Button variant="success" onClick={() => acceptFriendRequest(request.id)}>
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
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex justify-between p-2 border-b">
                <span>{user.name}</span>
                <Button variant="default" onClick={() => sendFriendRequest(user.id)}>
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
