import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [fullName, setFullName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  return (
    <UserContext.Provider
      value={{ fullName, setFullName, selectedId, setSelectedId }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserFullName = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
