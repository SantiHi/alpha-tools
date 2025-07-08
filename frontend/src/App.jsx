import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";
import { useEffect } from "react";
import { BASE_URL } from "./lib/utils";
import { UserInfo } from "./context/UserContext";
import CompanyInfo from "./CompanyInfo";
import Portfolios from "./Portfolios";
import PortfolioInfo from "./PortfolioInfo";
import Footer from "./Footer";

const LoggedInPage = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Login />;
};

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

  useEffect(() => {
    attemptLogin();
  }, []);

  return (
    <div className="flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route
            path="/CompanyInfo/:selectedId"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <CompanyInfo />
              </LoggedInPage>
            }
          />
          <Route
            path="/"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <Home />
              </LoggedInPage>
            }
          />
          <Route
            path="/login"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <Home />
              </LoggedInPage>
            }
          />
          <Route
            path="/home"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <Home />
              </LoggedInPage>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/portfolios"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <Portfolios />
              </LoggedInPage>
            }
          />
          <Route
            path="/portfolios/:id"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <PortfolioInfo />
              </LoggedInPage>
            }
          />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
};
export default App;
