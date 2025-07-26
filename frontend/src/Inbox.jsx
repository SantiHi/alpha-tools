import SearchBar from "./components/SearchBar";
import NotificationsList from "./components/NotificationsList";
import { BASE_URL } from "./lib/utils";
import { useEffect } from "react";
import { UserInfo } from "./context/UserContext";
const Inbox = () => {
  const { setNumberOfNotifications } = UserInfo();
  useEffect(() => {
    setNumberOfNotifications(0);
    const resetNotifications = () => {
      fetch(`${BASE_URL}/notifications/reset`, {
        method: "POST",
        credentials: "include",
      });
    };
    resetNotifications();
  }, []);
  return (
    <>
      <main className="w-full">
        <div className="flex flex-col items-center">
          <SearchBar />
          <NotificationsList />
        </div>
      </main>
    </>
  );
};

export default Inbox;
