import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import { BASE_URL } from "./lib/utils";
import { useState, useEffect } from "react";
import { UserInfo } from "./context/UserContext";
import TradingViewWidget from "./components/TradingViewWidget";
import NewsList from "./components/NewsList";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
const logoKey = import.meta.env.VITE_LOGO_TOKEN;
import cn from "classnames";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./components/ui/popover";

const AddToPortfolio = ({ companyId }) => {
  const [portfolios, setPortfolios] = useState(null);
  const [portfoliosToAddToo, setPortfoliosToAddToo] = useState([]);

  const AddToPortfolios = async () => {
    await fetch(`${BASE_URL}/portfolios/addMany/${companyId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: portfoliosToAddToo }),
    });
  };

  const getPortfolios = async () => {
    try {
      const response = await fetch(`${BASE_URL}/portfolios/`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
      }
    } catch {
      return;
    }
  };

  useEffect(() => {
    getPortfolios();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={getPortfolios}
          className="self-end border-black border-2 bg-green-400 ml-auto mr-5 pt-5 hover:brightness-75 mt-10 text-black"
        >
          Add To a Portfolio
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-green-200 ml-10 max-h-60 overflow-auto"
        side="right"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <h4 className="leading-none font-bold">Available Portfolios</h4>
            <p className="text-muted-foreground text-sm">choose portfolio</p>
          </div>
          {portfolios != null &&
            portfolios.map((value) => {
              if (value.companiesIds.includes(companyId)) {
                return;
              }

              // conditional class:
              const portfolioClass = cn(
                "text-center p-1 m-0 rounded-lg hover:cursor-pointer hover:scale-105 transition-transform duration-150 ease-in-out font-bold",
                {
                  "bg-green-300": portfoliosToAddToo.includes(value.id),
                  "bg-gray-300": !portfoliosToAddToo.includes(value.id),
                }
              );

              return (
                <div
                  key={value.id}
                  onClick={() => {
                    setPortfoliosToAddToo((self) =>
                      self.includes(value.id)
                        ? self.filter((id) => id !== value.id)
                        : [...self, value.id]
                    );
                  }}
                  className={portfolioClass}
                >
                  {value.name}
                </div>
              );
            })}
          {portfoliosToAddToo.length === 0 && (
            <p className="text-sm font-bold text-center">
              {" "}
              either no selected portfolios or this company is already in all
              portfolios
            </p>
          )}
          <PopoverClose asChild>
            {portfoliosToAddToo.length !== 0 && (
              <button
                onClick={() => {
                  AddToPortfolios();
                }}
                className="bg-green-600 text-white hover:scale-110 hover:brightness-120"
              >
                Add Selections
              </button>
            )}
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const CompanyInfo = () => {
  const [info, setInfo] = useState(null);
  const { fullName } = UserInfo();
  const [yahooFinanceData, setYahooFinanceData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const { selectedId } = useParams();
  const [isDetailRevealed, setIsDetailRevealed] = useState(null);

  const addToHistory = async () => {
    await fetch(`${BASE_URL}/company/companyhist/${selectedId}`, {
      method: "PUT",
      credentials: "include",
    });
  };

  useEffect(() => {
    const getAll = async () => {
      // get basic info from database
      const response = await fetch(
        `${BASE_URL}/getters/companyById/${selectedId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setInfo(data);

      // get yfinance data!
      const stockResponse = await fetch(
        `${BASE_URL}/getters/stats/${data.ticker}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const stockData = await stockResponse.json();
      setYahooFinanceData(stockData);

      // get newsAPI data!
      const newsResponse = await fetch(
        `${BASE_URL}/getters/news/${selectedId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const newsArticles = await newsResponse.json();
      setNewsData(newsArticles);
      addToHistory();
    };
    getAll();
  }, [selectedId]);

  const handleReveal = () => {
    if (isDetailRevealed == null) {
      setIsDetailRevealed(true);
    } else {
      setIsDetailRevealed((self) => !self);
    }
  };

  const downChevronClass = cn(
    "justify-self-center hover:scale-120 transition-transform duration-300 ease-in-out hover:cursor-pointer h-13 w-13 hover:brightness-90 animate-bounce mt-10"
  );

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
          {info && (
            <>
              <AddToPortfolio companyId={info.id} />
              {(!isDetailRevealed || isDetailRevealed == null) && (
                <ChevronDown
                  className={downChevronClass}
                  onClick={handleReveal}
                />
              )}
              {isDetailRevealed != null && (
                <div
                  className={`companyDetails ${
                    isDetailRevealed ? "slide-down" : "slide-up"
                  }`}
                >
                  <ChevronDown
                    className={downChevronClass}
                    onClick={handleReveal}
                  />
                  <p className="border-2 border-white rounded-lg p-4">
                    {info.description}
                  </p>
                </div>
              )}
            </>
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
