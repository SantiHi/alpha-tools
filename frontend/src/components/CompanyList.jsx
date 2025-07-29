import Company from "./Company";
import { useState, useEffect } from "react";

import { BASE_URL, toPercentage } from "../lib/utils";
import { UserInfo } from "../context/UserContext";

const PLACEHOLDER = "-";

const CompanyList = () => {
  const [exploreCompanies, setExploreCompanies] = useState([]);
  const [exploreCompaniesPrices, setExploreCompaniesPrices] = useState([
    PLACEHOLDER,
    PLACEHOLDER,
    PLACEHOLDER,
    PLACEHOLDER,
    PLACEHOLDER,
    PLACEHOLDER,
    PLACEHOLDER,
    PLACEHOLDER,
  ]);
  const fetchExplore = async () => {
    const response = await fetch(`${BASE_URL}/recommendations/curated`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setExploreCompanies(data);
    const tickers = data.map((value) => value.ticker);
    const query = tickers
      .map((t) => `tickers[]=${encodeURIComponent(t)}`)
      .join("&");
    const stockResponse = await fetch(
      `${BASE_URL}/getters/manycompanies?${query}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const stockData = await stockResponse.json();
    setExploreCompaniesPrices(stockData);
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  if (exploreCompaniesPrices[0] === PLACEHOLDER) {
    return (
      <img className="w-40 h-40 mt-10" src="https://i.gifer.com/ZKZg.gif" />
    );
  }

  return (
    <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-4/5">
      {exploreCompanies.map((value, ind) => {
        if (exploreCompaniesPrices[ind] == null) {
          return;
        }
        if (exploreCompaniesPrices[ind] != PLACEHOLDER) {
          return (
            <Company
              key={value.id}
              companyFacts={{
                name: value.name,
                ticker: value.ticker,
                daily:
                  exploreCompaniesPrices[ind].regularMarketPrice.toFixed(2),
                dailyChange: toPercentage(
                  exploreCompaniesPrices[ind].regularMarketPrice,
                  exploreCompaniesPrices[ind].regularMarketPreviousClose
                ),
                id: value.id,
              }}
            />
          );
        }
      })}
    </div>
  );
};

export default CompanyList;
