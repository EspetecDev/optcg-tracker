import Auth from "@/components/auth/Auth";
import FriendsManager from "@/components/friends/FriendsManager";

export default function AuthTest() {
  return (
      <div className="">
        <div className="flex justify-center items-center">
          <Auth />
        </div>

      <div className="flex justify-center items-center">
        <FriendsManager />
      </div>  
    </div>
  );
}

