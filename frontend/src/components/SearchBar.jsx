import { Search } from "lucide-react";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { BASE_URL } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { UserFullName } from "../context/UserContext";

const SearchResultsBar = ({ results, setSearchQuery, setSearchResults }) => {
  const { setSelectedId } = UserFullName();
  const navigate = useNavigate();
  if (results.length === 0) {
    return;
  }

  return (
    <div className="-mt-4">
      {" "}
      {results.map((value) => {
        return (
          <div
            key={value.id}
            className="bg-indigo-100 ounded-b-sm hover:cursor-pointer hover:brightness-95"
            onClick={() => {
              navigate(`/CompanyInfo/${value.id}`);
              setSelectedId(value.id);
              setSearchQuery("");
              setSearchResults([]);
            }}
          >
            <p className="ml-2">{`${value.name} (${value.ticker})`}</p>
          </div>
        );
      })}
    </div>
  );
};

const Searchbar = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value == "") {
      setSearchResults([]);
    } else {
      const response = await fetch(
        `${BASE_URL}/getters/search/${e.target.value}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center mt-4 mr-auto ml-auto fixed">
        <div className="pb-4">
          <Input
            id="outlined-basic"
            label="search"
            size="large"
            placeholder="Search For Companies"
            sx={{ width: "500px" }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            value={searchQuery}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </div>
        <SearchResultsBar
          results={searchResults}
          setSearchQuery={setSearchQuery}
          setSearchResults={setSearchResults}
        />
      </div>
    </>
  );
};

export default Searchbar;
