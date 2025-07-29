import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "../lib/utils";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [fullName, setFullName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [numberOfNotifications, setNumberOfNotifications] = useState(0);

  useEffect(() => {
    const checkLogin = async () => {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
        method: "GET",
      });
      const data = await response.json();
      if (data.isGuest) {
        setIsGuest(true);
      } else {
        setFullName(data.name);
        setIsLoggedIn(true);
      }
      setAuthChecked(true);
    };
    checkLogin();
  }, []);
  return (
    <UserContext.Provider
      value={{
        fullName,
        setFullName,
        selectedId,
        setSelectedId,
        isLoggedIn,
        setIsLoggedIn,
        authChecked,
        numberOfNotifications,
        setNumberOfNotifications,
        isGuest,
        setIsGuest,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserInfo = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
