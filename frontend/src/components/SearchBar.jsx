import { Search } from "lucide-react";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const Searchbar = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-right">
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
          />
        </div>
      </div>
    </>
  );
};

export default Searchbar;
