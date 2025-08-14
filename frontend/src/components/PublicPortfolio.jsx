import PortfolioCard from "./PortfolioCard";
import { BASE_URL } from "../lib/utils";
import { useEffect, useState } from "react";

const PublicPortfolios = () => {
  const [PublicPortfolios, setPublicPortfolios] = useState(null);

  const getPublicPortfolios = async () => {
    const response = await fetch(
      `${BASE_URL}/recommendations/curated-portfolios/public`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      setPublicPortfolios(data);
    }
  };

  useEffect(() => {
    getPublicPortfolios();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {PublicPortfolios == null ? (
        <div className="mr-auto ml-auto rounded-full w-20 h-20 m-3 border-10 border-t-transparent border-purple-500 animate-spin"></div>
      ) : (
        PublicPortfolios.map((portfolio) => {
          return (
            <PortfolioCard
              key={portfolio.id}
              name={portfolio.name}
              id={portfolio.id}
              companies={portfolio.companiesIds}
              description={portfolio.description}
              canDelete={false}
              creator={portfolio.user.username}
            />
          );
        })
      )}
    </div>
  );
};

export default PublicPortfolios;
