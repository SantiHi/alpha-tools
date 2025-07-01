import { SidebarProvider, SidebarTrigger } from "./components/ui/Sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import { BASE_URL } from "./lib/utils";
import { useState, useEffect } from "react";
import { UserFullName } from "./context/UserContext";
import TradingViewWidget from "./components/TradingViewWidget";

const CompanyInfo = () => {
  const [info, setInfo] = useState(null);
  const { selectedId, fullName } = UserFullName();

  useEffect(() => {
    const getAllInfo = async () => {
      const response = await fetch(
        `${BASE_URL}/getters/companyById/${selectedId}`
      );
      const data = await response.json();
      setInfo(data);
    };
    getAllInfo();
  }, [selectedId]);

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
          <div className="flex flex-row bg-indigo-950 p-4 mt-30 pt-0 rounded-sm border-2 border-white mb-8">
            <p className="text-white text-4xl mt-10 font-bold">
              {info ? info.name : "-"}
            </p>
            {info && (
              <img
                className="h-20 mt-5 ml-6 rounded-md"
                src={`https://img.logokit.com/ticker/${info.ticker}?token=pk_fr8a40387b3910cee522d6`}
              />
            )}
          </div>
          <TradingViewWidget info={info} />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default CompanyInfo;
