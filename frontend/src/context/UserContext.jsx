import { createContext, useContext, useState } from "react";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [fullName, setFullName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <UserContext.Provider
      value={{
        fullName,
        setFullName,
        selectedId,
        setSelectedId,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserFullName = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
