import IndustryCard from "./IndustryCard";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../lib/utils";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const IndustryList = () => {
  const [industries, setIndustries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchIndustries = async () => {
    const response = await fetch(`${BASE_URL}/auth/industries`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      setIndustries(data);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const filteredIndustries = industries.filter(
    (industry) =>
      industry.name &&
      industry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (industries == null) {
    return;
  }
  return (
    <>
      <Input
        id="outlined-basic"
        label="search"
        size="large"
        placeholder="Filter Industries"
        sx={{ width: "80%" }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        value={searchQuery}
        onChange={handleInputChange}
        autoComplete="off"
        className="self-center"
      />
      <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-4/5 w-full self-center max-h-150 overflow-auto">
        {filteredIndustries.map((value) => {
          if (value.name == null || value.name == "") {
            return;
          }
          return (
            <IndustryCard
              key={value.id}
              industryInfo={{
                name: value.name,
                id: value.id,
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export default IndustryList;
