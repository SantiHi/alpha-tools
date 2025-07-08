import PortfolioCard from "./PortfolioCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover";
import { BASE_URL } from "../lib/utils";
import { useEffect, useState } from "react";

const NewPortfolioModal = ({ newPortfolio }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (event) => {
    const key = event.target.id;
    const value = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-cyan-400 m-3">
          New Portfolio
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-indigo-200 m-3" side="bottom">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Portfolio</h4>
            <p className="text-muted-foreground text-sm">
              Set initial information
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Name">Name</Label>
              <Input
                id="name"
                placeholder="Portfolio Name"
                className="col-span-2 h-8"
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                className="col-span-2 h-8"
                onChange={handleChange}
              />
            </div>
            <PopoverClose asChild>
              <Button
                variant="outline"
                className="bg-indigo-400"
                onClick={() => {
                  newPortfolio(formData);
                }}
              >
                Create Portfolio
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PortfolioList = () => {
  const [portfolios, setPortfolios] = useState(null);

  const newPortfolio = async (newData) => {
    if (newData.name == "" || newData.description == "") {
      alert("please fill out all inputs");
      return;
    }
    const response = await fetch(`${BASE_URL}/portfolios/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });
    if (response.ok) {
      getPortfolios();
    }
  };

  const getPortfolios = async () => {
    const response = await fetch(`${BASE_URL}/portfolios/`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      setPortfolios(data);
    }
  };

  useEffect(() => {
    getPortfolios();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {portfolios == null ? (
        <h2>Loading...</h2>
      ) : (
        portfolios.map((portfolio) => {
          return (
            <PortfolioCard
              key={portfolio.id}
              name={portfolio.name}
              id={portfolio.id}
              companies={portfolio.companiesIds}
              description={portfolio.description}
              setPortfolios={setPortfolios}
            />
          );
        })
      )}
      <NewPortfolioModal newPortfolio={newPortfolio} />
    </div>
  );
};

export default PortfolioList;
