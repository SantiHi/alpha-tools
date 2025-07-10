import { createContext, useContext, useState } from "react";

const SignUpContext = createContext();
const INIT_VALUE = 0;

const SignUpContextProvider = ({ children }) => {
  const [numberSectorsSelected, setNumberSectorsSelected] =
    useState(INIT_VALUE);
  const [numberIndustriesSelected, setNumberIndustriesSelected] =
    useState(INIT_VALUE);
  const [sectorsSelected, setSectorsSelected] = useState([]);
  const [industriesSelected, setIndustriesSelected] = useState([]);
  return (
    <SignUpContext.Provider
      value={{
        numberSectorsSelected,
        setNumberSectorsSelected,
        numberIndustriesSelected,
        setNumberIndustriesSelected,
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

export const SignUpInfo = () => {
  return useContext(SignUpContext);
};

export default SignUpContextProvider;
