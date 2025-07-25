import SearchBar from "./components/SearchBar";
import { useState, useEffect } from "react";
import { BASE_URL } from "./lib/utils";
import { useParams } from "react-router-dom";
import PortfolioCompanies from "./components/PortfolioCompanies";
import SwingCompanies from "./components/SwingCompanies";
import cn from "classnames";
import { EDITOR_PERMS } from "./lib/constants";
import PredictionTools from "./components/PredictionTools";
import TextEditor from "./components/TextEditor";
import { DeleteButton } from "./components/PortfolioCard";
import Stocks from "./components/Stocks";

const MODE_DAY = "Day";
const VIEWER_PERMS = "viewer";

const PortfolioInfo = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [companyIds, setCompanyIds] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [companiesStockData, setCompaniesStockData] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [historicalMode, setHistoricalMode] = useState(MODE_DAY);
  const [sortedSwings, setSortedSwings] = useState(null);
  const { id } = useParams();
  const [isPublic, setPublicButton] = useState(null);
  const [viewerPermissions, setViewerPermissions] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
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
  }, [historicalMode, id]);

  const getPortfolioData = async () => {
    const response = await fetch(`${BASE_URL}/portfolios/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    setPortfolioData(data);
    setPublicButton(data.isPublic);
    if (companyIds.length == 0 || !sameValues(data.companiesIds, companyIds)) {
      setCompanyIds(data.companiesIds);
      await getCompaniesData(data.companiesIds, data.companiesStocks);
    }
  };

  const sameValues = (arr1, arr2) => {
    for (let val of arr1) {
      if (!arr2.includes(val)) {
        return false;
      }
    }
    for (let val of arr2) {
      if (!arr1.includes(val)) {
        return false;
      }
    }
    return true;
  };

  const handleDelete = async (companyId) => {
    await fetch(`${BASE_URL}/portfolios/${id}/${companyId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSortedSwings((self) => self.filter((cid) => cid.id !== companyId));
    setCompanyIds((self) => self.filter((cid) => cid !== companyId));
    let i = 0;
    setCompaniesData((self) =>
      self.filter((value, ind) => {
        if (value.id == companyId) {
          i = ind;
          return false;
        }
        return true;
      })
    );
    setCompaniesStockData((self) => self.filter((value, ind) => ind !== i));
  };

  const getCompaniesData = async (companiesIds, companiesStocks) => {
    const newArray = [];
    if (companiesIds) {
      const response = await fetch(`${BASE_URL}/company`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: companiesIds }),
      });
      if (response.ok) {
        const data = await response.json();
        for (let val of data) {
          newArray.push({
            id: val.id,
            name: val.name,
            ticker: val.ticker,
            industry: val.industry.name,
            sector: val.industry.sector.name,
          });
        }
      }
    }
    setCompaniesData(newArray);
    const prices = [];
    let i = 0;
    let sum = 0;
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
      sum += stockData.regularMarketPrice * companiesStocks[i];
      i++;
    }
    setPortfolioValue(sum.toFixed(2));
    setCompaniesStockData(prices);
  };

  useEffect(() => {
    const getAllInfo = async () => {
      setCompaniesData(null);
      await getUserPermissions();
      await getPortfolioData();
    };
    getAllInfo();
  }, [id]);

  if (portfolioData == null) {
    return (
      <img
        className="w-50 h-50 mt-50 ml-auto mr-auto"
        src="https://i.gifer.com/ZKZg.gif"
      />
    );
  }

  if (viewerPermissions == null) {
    return;
  }

  return (
    <>
      <main className="w-full">
        <div className="flex flex-col items-center">
          <SearchBar />
          <h3 className="self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold drop-shadow-[0px_0px_39px_rgba(247,247,247,.3)] -z-50">
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
          <div className="flex flex-row justify-center">
            <PredictionTools
              portfolioData={portfolioData}
              companiesData={companiesData}
              companiesStockData={companiesStockData}
              portfolioValue={portfolioValue}
            />
            <Stocks
              companiesData={companiesData}
              companiesStockData={companiesStockData}
              portfolioData={portfolioData}
              portfolioValue={portfolioValue}
              setPortfolioValue={setPortfolioValue}
              perms={viewerPermissions}
            />
          </div>
          <TextEditor id={id} viewerPermissions={viewerPermissions} />
          {viewerPermissions === EDITOR_PERMS && (
            <DeleteButton className="justify-center" isCard={false} />
          )}
        </div>
      </main>
    </>
  );
};

export default PortfolioInfo;
