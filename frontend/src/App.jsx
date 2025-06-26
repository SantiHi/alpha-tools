import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";
import { useState, useEffect } from "react";
import { BASE_URL } from "./utils/reused";

const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const attemptLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setLoggedIn(true);
      }
    } catch {
      return;
    }
  };

  attemptLogin();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn === true ? (
                <Navigate to="/home" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn === true ? (
                <Navigate to="/home" />
              ) : (
                <Login attemptLogin={attemptLogin} />
              )
            }
          />
          <Route
            path="/home"
            element={isLoggedIn === true ? <Home /> : <Navigate to="/login" />}
          />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
      <footer className="fixed flex flex-row justify-center bottom-0 text-center text-2xl self-center w-full bg-indigo-50 h-15 pt-3 font-medium object-center">
        Santiago Criado |
        <a href="https://github.com/Capston-Meta-Project-Santiago-Criado/Capstone-Project">
          <img
            className="h-5 w-5 m-1.75 transition-transform duration-200 ease-in-out hover:scale-125 hover:cursor-pointer "
            src={
              "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
            }
            alt="GitHub"
          />
        </a>
      </footer>
    </>
  );
};
export default App;
