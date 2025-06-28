import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "./components/ui/Sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import { BASE_URL } from "./lib/utils";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UserFullName } from "./context/UserContext";

const CompanyInfo = () => {
  const [title, setTitle] = useState(null);
  const location = useLocation();
  const { selectedId, fullName } = UserFullName();

  useEffect(() => {
    const getAllInfo = async () => {
      const response = await fetch(
        `${BASE_URL}/getters/companyById/${selectedId}`
      );
      const data = await response.json();
      setTitle(data.name);
    };
    getAllInfo();
  }, [location]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col justify-center">
        <SidebarTrigger className="fixed" />
      </div>
      <header className="bg-indigo-50 fixed top-0 w-full pt-4 flex flex-col items-center h-16">
        <h2 className="fixed top-0 left-4 text-4xl pt-3 font-medium">
          Alpha-Edge
        </h2>
        <h4 className="fixed top-0 right-4 pt-5">
          Good day, <span className="font-bold"> {fullName} </span>
        </h4>
      </header>
      <main className="w-full">
        <div className="flex flex-col items-center">
          <SearchBar />
          <p className="text-white text-4xl mt-30">{title}</p>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default CompanyInfo;
