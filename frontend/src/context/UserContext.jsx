import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [fullName, setFullName] = useState("");
  return (
    <UserContext.Provider value={{ fullName, setFullName }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserFullName = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
