"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Auth() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center space-y-4">
      {session ? (
        <>
          <p>Welcome, {session.user?.name}!</p>
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => signOut()}>
            Sign Out
          </button>
        </>
      ) : (
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => signIn("google")}>
          Sign In with Google
        </button>
      )}
    </div>
  );
}
