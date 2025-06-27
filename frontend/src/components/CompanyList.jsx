import Company from "./Company";
import { useState, useEffect } from "react";
import { BASE_URL } from "../lib/utils";

const CompanyList = () => {
  const [exploreCompanies, setExploreCompanies] = useState([]);

  const fetchExplore = async () => {
    const response = await fetch(`${BASE_URL}/getters/explore`);
    const data = await response.json();
    console.log(data);
    setExploreCompanies(data);
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  return (
    <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-4/5">
      {exploreCompanies.map((value, ind) => {
        return (
          <Company
            key={ind}
            companyFacts={{
              name: value.name,
              ticker: value.ticker,
              daily: value.daily_price,
              yearToDate: 0,
            }}
          />
        );
      })}
    </div>
  );
};

export default CompanyList;
