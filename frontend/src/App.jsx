import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";
import { useEffect } from "react";
import { BASE_URL } from "./lib/utils";
import { UserInfo } from "./context/UserContext";
import CompanyInfo from "./CompanyInfo";
<<<<<<< HEAD
import Portfolios from "./Portfolios";
import PortfolioInfo from "./PortfolioInfo";
import Footer from "./Footer";

=======
import Footer from "./footer";
>>>>>>> origin/main
const App = () => {
  const { setFullName, isLoggedIn, setIsLoggedIn } = UserInfo();

  const attemptLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFullName(data.name);
        setIsLoggedIn(true);
      }
    } catch {
      return;
    }
  };

  useEffect(() => attemptLogin, []);

  return (
    <div className="flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route
            path="/CompanyInfo/:selectedId"
            element={isLoggedIn === true ? <CompanyInfo /> : <Login />}
          />
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
          <Route
            path="/portfolios"
            element={isLoggedIn === true ? <Portfolios /> : <Login />}
          />
          <Route
            path="/portfolios/:id"
            element={isLoggedIn === true ? <PortfolioInfo /> : <Login />}
          />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
};
export default App;
