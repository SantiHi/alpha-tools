import PortfolioCard from "./PortfolioCard";
import { Button } from "./ui/button"; // from shadCN library
import { Input } from "./ui/input"; // from shadCN library
import { Label } from "./ui/label"; // from shadCN library
import Checkbox from "@mui/material/Checkbox"; // from MUI library
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover"; // from shadCN library
import { BASE_URL } from "../lib/utils";
import { useEffect, useState } from "react";

const PublicPortfolios = () => {
  const [PublicPortfolios, setPublicPortfolios] = useState(null);

  const getPublicPortfolios = async () => {
    const response = await fetch(`${BASE_URL}/portfolios/explore/public`, {
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
