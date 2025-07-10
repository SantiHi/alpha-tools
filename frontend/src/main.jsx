import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import UserContextProvider from "./context/UserContext";
import SignUpContextProvider from "./context/SignUpContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserContextProvider>
      <SignUpContextProvider>
        <App />
      </SignUpContextProvider>
    </UserContextProvider>
  </StrictMode>
);
