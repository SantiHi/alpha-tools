import { SidebarProvider, SidebarTrigger } from "./components/ui/Sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import { UserInfo } from "./context/UserContext";
import { useState, useEffect } from "react";
import { BASE_URL } from "./lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, X } from "lucide-react";

const PortfolioInfo = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [companyIds, setCompanyIds] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [companiesStockData, setCompaniesStockData] = useState([]);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const navigate = useNavigate();

  const { fullName } = UserInfo();
  const { id } = useParams();

  const getPortfolioData = async () => {
    const response = await fetch(`${BASE_URL}/portfolios/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    setPortfolioData(data);
    if (companyIds.length === 0) {
      setCompanyIds(data.companiesIds);
    }
  };

  const handleDelete = async (companyId) => {
    await fetch(`${BASE_URL}/portfolios/${id}/${companyId}`, {
      method: "DELETE",
      credentials: "include",
    });
    getCompaniesData();
    setCompanyIds((self) => self.filter((cid) => cid !== companyId));
  };

  const getCompaniesData = async () => {
    const newArray = [];
    for (let ids of companyIds) {
      const response = await fetch(`${BASE_URL}/getters/companyById/${ids}`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        let data = await response.json();
        newArray.push({ id: data.id, name: data.name, ticker: data.ticker });
      }
    }
    setCompaniesData(newArray);
    const prices = [];
    for (const company of newArray) {
      const stockResponse = await fetch(
        `${BASE_URL}/getters/stats/${company.ticker}`
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

  const handleClick = (id) => {
    navigate(`/CompanyInfo/${id}`);
  };

  return (
    <>
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
            <h3 className="self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold drop-shadow-[0px_0px_39px_rgba(247,247,247,.3)] z-10">
              {portfolioData.name}
            </h3>
            <div className="flex flex-row justify-start w-full">
              <div className="bg-indigo-50 h-75 w-7/20 ml-40 rounded-md overflow-auto">
                <div className="flex flex-row justify-center">
                  <h3 className="font-bold text-2xl text-center mt-3">
                    Portfolio Companies
                  </h3>
                  <Pencil
                    className="mt-5 ml-4 border-2 h-5 w-5 rounded-sm hover:scale-110 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90"
                    onClick={() => {
                      setIsEditingMode((prev) => !prev);
                    }}
                  />
                </div>
                <div className="flex flex-col h-full items-center">
                  {companiesStockData.length === 0 && (
                    <img
                      className="h-20 w-20 mt-10"
                      src="https://i.gifer.com/ZKZg.gif"
                    />
                  )}
                  {companiesStockData.length !== 0 &&
                    companiesData.map((value, ind) => {
                      if (value == null) {
                        return;
                      }
                      const percentChange = (
                        ((companiesStockData[ind].price -
                          companiesStockData[ind].dayStart) /
                          companiesStockData[ind].dayStart) *
                        100
                      ).toFixed(2);
                      return (
                        <div
                          className="flex flex-row justify-center h-6/50 w-9/10 m-1"
                          key={value.id}
                        >
                          <div
                            className={
                              percentChange < 0
                                ? percentChange < 5
                                  ? " w-full h-full bg-red-200 rounded-sm mt-2 hover:scale-103 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90 flex flex-row"
                                  : " w-full h-full bg-red-400 rounded-sm mt-2 hover:scale-103 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90 flex flex-row"
                                : percentChange > 5
                                ? " w-full h-full bg-green-400 rounded-sm mt-2 hover:scale-103 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90 flex flex-row"
                                : " w-full h-full bg-green-200 rounded-sm mt-2 hover:scale-103 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90 flex flex-row"
                            }
                            onClick={() => {
                              handleClick(value.id);
                            }}
                          >
                            <h5 className="font-bold ml-2 pt-1 text-lg truncate w-3/5">
                              {value.name} ({value.ticker})
                            </h5>
                            <h5
                              className={
                                percentChange < 0
                                  ? " font-bold pt-1 text-lg text-red-600 mr-2 ml-auto"
                                  : " font-bold pt-1 text-lg text-green-800 mr-2 ml-auto"
                              }
                            >
                              ${companiesStockData[ind].price} | {percentChange}
                              %
                            </h5>
                          </div>
                          {isEditingMode ? (
                            <X
                              className=" mt-4 ml-1 hover:scale-115 transition-transform duration-200 ease-in-out hover:cursor-pointer"
                              onClick={() => {
                                handleDelete(value.id);
                              }}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default PortfolioInfo;
