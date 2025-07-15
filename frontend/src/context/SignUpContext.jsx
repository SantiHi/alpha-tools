import { createContext, useContext, useState } from "react";

const SignUpContext = createContext();
const SignUpContextProvider = ({ children }) => {
  const [sectorsSelected, setSectorsSelected] = useState([]);
  const [industriesSelected, setIndustriesSelected] = useState([]);
  return (
    <SignUpContext.Provider
      value={{
        sectorsSelected,
        setSectorsSelected,
        industriesSelected,
        setIndustriesSelected,
      }}
    >
      {children}
    </SignUpContext.Provider>
  );
};

export const SignUpInfoContext = () => {
  return useContext(SignUpContext);
};

export default SignUpContextProvider;
