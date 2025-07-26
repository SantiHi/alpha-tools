import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toPercentage } from "../lib/utils";
import Company from "./Company";

const MODE_DAY = "Day";
const MODE_WEEK = "Week";
const MODE_MONTH = "Month";
const MODE_YEAR = "Year";

const SwingCompanies = ({
  companiesStockData,
  companiesData,
  setHistoricalMode,
  sortedSwings,
  historicalMode,
}) => {
  const handleTimelineChange = (e) => {
    setHistoricalMode(e.target.value);
  };

  const darkMode = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <div className="w-1/2 flex flex-col">
      <div className=" w-full text-center flex flex-row justify-center">
        <h3 className="text-white font-bold text-2xl mt-2"> Largest Swings </h3>
        <ThemeProvider theme={darkMode}>
          <Box sx={{ minWidth: 120, color: "white" }} className="ml-5 mb-7">
            <FormControl fullWidth>
              <InputLabel id="timeline-label" sx={{ borderColor: "white" }}>
                period
              </InputLabel>
              <Select
                labelId="timeline-label"
                id="timeline-select"
                value={historicalMode}
                label="period"
                sx={{ color: "white", borderColor: "white" }}
                onChange={handleTimelineChange}
              >
                <MenuItem value={MODE_DAY}> {MODE_DAY}</MenuItem>
                <MenuItem value={MODE_WEEK}> {MODE_WEEK} </MenuItem>
                <MenuItem value={MODE_MONTH}> {MODE_MONTH} </MenuItem>
                <MenuItem value={MODE_YEAR}> {MODE_YEAR} </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </ThemeProvider>
      </div>
      {sortedSwings == null ||
        (companiesStockData == null && (
          <img
            className="h-20 w-20 ml-auto mr-auto mt-10"
            src="https://i.gifer.com/ZKZg.gif"
          />
        ))}
      <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-100 overflow-auto w-8/10">
        {sortedSwings &&
          companiesStockData != null &&
          companiesData != null &&
          companiesStockData.length !== 0 &&
          sortedSwings.map((value) => {
            const ind = companiesData.findIndex((item) => item.id === value.id);
            const comp = companiesData.filter((c) => c.id === value.id)[0];
            if (comp == null || companiesStockData[ind] == null) {
              return;
            }
            if (historicalMode === MODE_DAY) {
              // find which index is which
              const percentageChange = toPercentage(
                companiesStockData[ind].price,
                companiesStockData[ind].dayStart
              );

              return (
                <Company
                  key={value.id}
                  mode="fit"
                  companyFacts={{
                    name: comp.name,
                    ticker: comp.ticker,
                    daily: companiesStockData[ind].price.toFixed(2),
                    dailyChange: percentageChange,
                    id: value.id,
                  }}
                />
              );
            }
            return (
              <Company
                key={value.id}
                mode="fit"
                companyFacts={{
                  name: comp.name,
                  ticker: comp.ticker,
                  daily: `${value.firstVal.close.toFixed(
                    2
                  )} -> $${value.finalVal.close.toFixed(2)}`,
                  dailyChange: value.percentChange.toFixed(2),
                  id: value.id,
                }}
              />
            );
          })}
      </div>
    </div>
  );
};

export default SwingCompanies;
