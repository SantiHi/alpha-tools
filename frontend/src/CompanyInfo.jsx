import { SidebarProvider, SidebarTrigger } from "./components/ui/Sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import { BASE_URL } from "./lib/utils";
import { useState, useEffect } from "react";
import { UserInfo } from "./context/UserContext";
import TradingViewWidget from "./components/TradingViewWidget";
import NewsList from "./components/NewsList";
const logoKey = import.meta.env.VITE_LOGO_TOKEN;

const CompanyInfo = () => {
  const [info, setInfo] = useState(null);
  const { selectedId, fullName } = UserInfo();
  const [yahooFinanceData, setYahooFinanceData] = useState(null);
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    const getAll = async () => {
      // get basic info from database
      const response = await fetch(
        `${BASE_URL}/getters/companyById/${selectedId}`
      );
      const data = await response.json();
      setInfo(data);

      // get yfinance data!
      const stockResponse = await fetch(
        `${BASE_URL}/getters/stats/${data.ticker}`
      );
      const stockData = await stockResponse.json();
      setYahooFinanceData(stockData);

      // get newsAPI data!
      const newsResponse = await fetch(
        `${BASE_URL}/getters/news/${selectedId}`
      );
      const newsArticles = await newsResponse.json();
      setNewsData(newsArticles);
    };
    getAll();
  }, [selectedId]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="relative h-full flex flex-col justify-center">
        <SidebarTrigger className="fixed top-1/2" />
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
          <div className="flex flex-row p-4 mt-30 pt-0 rounded-sm mb-8">
            <p className="text-indigo-200 text-6xl mt-10 font-bold">
              {info ? info.name : "-"}
            </p>
            {info && (
              <img
                className="h-20 mt-8 ml-6 rounded-md"
                src={`https://img.logokit.com/ticker/${info.ticker}?token=${logoKey}`}
              />
            )}
          </div>
          {info != null && <TradingViewWidget key={info.ticker} info={info} />}
        </div>
        <div className="text-white text-center mt-5">
          {yahooFinanceData != null &&
            yahooFinanceData.averageAnalystRating && (
              <h2 className="font-semibold">
                Yahoo Finance Average Analyst Rating:{" "}
                <span
                  className={
                    yahooFinanceData.averageAnalystRating.includes("Buy")
                      ? "text-green-300 font-bold"
                      : "text-red-300 font-bold"
                  }
                >
                  {yahooFinanceData.averageAnalystRating}
                </span>
              </h2>
            )}
          <h2 className="text-white text-5xl font-bold text-center mt-10">
            Recent Company News
          </h2>
          <div>
            <NewsList newsData={newsData} />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default CompanyInfo;

// ?        <h2 className="text-white text-5xl font-bold text-center mt-10">
//           Recent Company News
//         </h2>
//         <NewsList newsData={newsData} />
