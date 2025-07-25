import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";
import Inbox from "./Inbox";
import { UserInfo } from "./context/UserContext";
import CompanyInfo from "./CompanyInfo";
import Portfolios from "./Portfolios";
import PortfolioInfo from "./PortfolioInfo";
import Footer from "./Footer";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"; // material ui Sidebar
import AppSidebar from "./components/AppSidebar";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings";

const LoggedInPage = ({ isLoggedIn, children }) => {
  const { fullName } = UserInfo();
  const navigate = useNavigate();
  return isLoggedIn ? (
    <SidebarProvider>
      <AppSidebar />
      <div className="relative h-full flex flex-col justify-center">
        <SidebarTrigger className="fixed top-1/2" />
      </div>
      <header className="bg-indigo-50 fixed top-0 w-full pt-4 flex flex-col items-center h-16 z-10">
        <h2
          className="fixed top-0 left-4 text-4xl pt-3 font-medium hover:cursor-pointer"
          onClick={() => {
            navigate("/home");
          }}
        >
          Alpha-Edge
        </h2>
        <h4 className="fixed top-0 right-4 pt-5">
          Good day,{" "}
          <span
            className="font-bold hover:cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            {" "}
            {fullName}{" "}
          </span>
        </h4>
      </header>
      {children}
    </SidebarProvider>
  ) : (
    <Login />
  );
};

const App = () => {
  const { isLoggedIn, authChecked } = UserInfo();

  if (!authChecked) {
    return null;
  }

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
            path="/Inbox"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <Inbox />
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
          <Route
            path="/settings"
            element={
              <LoggedInPage isLoggedIn={isLoggedIn}>
                <Settings />
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
