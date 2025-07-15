import PortfolioCard from "./PortfolioCard";
import { BASE_URL } from "../lib/utils";
import { useEffect, useState } from "react";

const PublicPortfolios = () => {
  const [PublicPortfolios, setPublicPortfolios] = useState(null);

  const getPublicPortfolios = async () => {
    const response = await fetch(`${BASE_URL}/portfolios/curated/public`, {
      method: "GET",
      credentials: "include",
    });
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
        <h2>Loading...</h2>
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
