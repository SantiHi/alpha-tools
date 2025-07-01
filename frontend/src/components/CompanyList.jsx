import Company from "./Company";
import { useState, useEffect } from "react";
import { BASE_URL } from "../lib/utils";

const CompanyList = () => {
  const [exploreCompanies, setExploreCompanies] = useState([]);
  const [exploreCompaniesPrices, setExploreCompaniesPrices] = useState([
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
  ]);
  const fetchExplore = async () => {
    const response = await fetch(`${BASE_URL}/getters/explore`);
    const data = await response.json();
    await setExploreCompanies(data);
    const prices = [];
    for (const company of data) {
      const stockResponse = await fetch(
        `${BASE_URL}/getters/stats/${company.ticker}`
      );
      const stockData = await stockResponse.json();
      prices.push({
        price: stockData.regularMarketPrice,
        dayStart: stockData.regularMarketOpen,
      });
    }
    setExploreCompaniesPrices(prices);
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  if (exploreCompaniesPrices[0] === "-") {
    return (
      <img className="w-40 h-40 mt-10" src="https://i.gifer.com/ZKZg.gif" />
    );
  }

  return (
    <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-4/5">
      {exploreCompanies.map((value, ind) => {
        if (exploreCompaniesPrices[ind] != "-") {
          return (
            <Company
              key={value.id}
              companyFacts={{
                name: value.name,
                ticker: value.ticker,
                daily: exploreCompaniesPrices[ind].price.toFixed(2),
                dailyChange: (
                  exploreCompaniesPrices[ind].price -
                  exploreCompaniesPrices[ind].dayStart
                ).toFixed(2),
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
