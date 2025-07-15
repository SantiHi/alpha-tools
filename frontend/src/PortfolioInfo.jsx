import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import { UserInfo } from "./context/UserContext";
import { useState, useEffect } from "react";
import { BASE_URL } from "./lib/utils";
import { useParams } from "react-router-dom";
import PortfolioCompanies from "./components/PortfolioCompanies";
import SwingCompanies from "./components/SwingCompanies";
import cn from "classnames";
import { EDITOR_PERMS } from "./lib/constants";

const MODE_DAY = "Day";
const VIEWER_PERMS = "viewer";

const PortfolioInfo = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [companyIds, setCompanyIds] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [companiesStockData, setCompaniesStockData] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [historicalMode, setHistoricalMode] = useState(MODE_DAY);
  const [sortedSwings, setSortedSwings] = useState([]);
  const { fullName } = UserInfo();
  const { id } = useParams();
  const [isPublic, setPublicButton] = useState(null);
  const [viewerPermissions, setViewerPermissions] = useState(null);
  const publicButtonClass = cn(
    "border-2 border-white text-white ml-35 bg-gray-800 mt-5 hover:cursor-pointer hover:scale-110 hover:brightness-110",
    {
      "bg-pink-600": isPublic === true,
      "bg-green-600": isPublic === false,
    }
  );
  const getUserPermissions = async () => {
    const response = await fetch(
      `${BASE_URL}/portfolios/permissions/user/${id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data.owner === true) {
      setViewerPermissions(EDITOR_PERMS);
      return;
    }
    if (data.public === true) {
      setViewerPermissions(VIEWER_PERMS);
    }
  };

  const handlePublic = async () => {
    if (!isPublic) {
      setPublicButton(true);
    } else {
      setPublicButton(false);
    }
    await fetch(`${BASE_URL}/portfolios/make/public/${id}`, {
      method: "POST",
      credentials: "include",
    });
  };

  const getSwingData = async () => {
    const response = await fetch(
      `${BASE_URL}/portfolios/swings/${id}/${historicalMode}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    setSortedSwings(data);
  };

  useEffect(() => {
    getSwingData();
  }, [historicalMode]);

  const getPortfolioData = async () => {
    const response = await fetch(`${BASE_URL}/portfolios/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    setPortfolioData(data);
    setPublicButton(data.isPublic);
    if (companyIds.length === 0) {
      setCompanyIds(data.companiesIds);
    }
  };

  const handleDelete = async (companyId) => {
    await fetch(`${BASE_URL}/portfolios/${id}/${companyId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSortedSwings((self) => self.filter((cid) => cid.id !== companyId));
    setCompanyIds((self) => self.filter((cid) => cid !== companyId));
  };

  const getCompaniesData = async () => {
    const newArray = [];
    if (companyIds) {
      const response = await fetch(`${BASE_URL}/company`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: companyIds }),
      });
      if (response.ok) {
        const data = await response.json();
        for (let val of data) {
          newArray.push({ id: val.id, name: val.name, ticker: val.ticker });
        }
      }
    }
    setCompaniesData(newArray);
    const prices = [];
    for (const company of newArray) {
      const stockResponse = await fetch(
        `${BASE_URL}/getters/stats/${company.ticker}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const stockData = await stockResponse.json();
      prices.push({
        price: stockData.regularMarketPrice,
        dayStart: stockData.regularMarketPreviousClose,
      });
    }
    setCompaniesStockData(prices);
  };
  useEffect(() => {
    getUserPermissions();
    getPortfolioData();
    getCompaniesData();
  }, [companyIds]);

  if (portfolioData == null) {
    return (
      <img
        className="w-40 h-40 mt-10 ml-auto mr-auto"
        src="https://i.gifer.com/ZKZg.gif"
      />
    );
  }

  if (viewerPermissions == null) {
    return;
  }

  return (
    <>
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
          <h3 className="self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold drop-shadow-[0px_0px_39px_rgba(247,247,247,.3)] z-10">
            {portfolioData.name}
          </h3>
          <div className="flex flex-row justify-start w-full">
            <div className="flex flex-col w-9/20 items-center">
              <PortfolioCompanies
                handleDelete={handleDelete}
                companiesStockData={companiesStockData}
                companiesData={companiesData}
                isEditingMode={isEditingMode}
                setIsEditingMode={setIsEditingMode}
                permission={viewerPermissions}
              />
              {viewerPermissions === EDITOR_PERMS && (
                <button className={publicButtonClass} onClick={handlePublic}>
                  {isPublic === false ? (
                    <span>Make Public</span>
                  ) : (
                    <span>Make Private</span>
                  )}
                </button>
              )}
            </div>
            <SwingCompanies
              companiesStockData={companiesStockData}
              companiesData={companiesData}
              setHistoricalMode={setHistoricalMode}
              sortedSwings={sortedSwings}
              historicalMode={historicalMode}
              companyIds={companyIds}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default PortfolioInfo;
