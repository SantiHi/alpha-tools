import { Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import { toPercentage } from "../lib/utils";
import { EDITOR_PERMS } from "../lib/constants";
const PortfolioCompanies = ({
  companiesStockData,
  handleDelete,
  companiesData,
  isEditingMode,
  setIsEditingMode,
  permission,
}) => {
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/CompanyInfo/${id}`);
  };
  return (
    <div className="bg-indigo-50 h-90 w-16/20 ml-40 rounded-md overflow-auto">
      <div className="flex flex-row justify-center">
        <h3 className="font-bold text-2xl text-center mt-3">
          Portfolio Companies
        </h3>
        {permission === EDITOR_PERMS &&
          companiesData != null &&
          companiesData.length != 0 && (
            <Pencil
              className="mt-5 ml-4 border-2 h-5 w-5 rounded-sm hover:scale-110 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90"
              onClick={() => {
                setIsEditingMode((prev) => !prev);
              }}
            />
          )}
      </div>
      <div className="flex flex-col h-full items-center">
        {companiesStockData == null && (
          <img className="h-20 w-20 mt-10" src="https://i.gifer.com/ZKZg.gif" />
        )}
        {companiesStockData != null && companiesStockData.length == 0 && (
          <p>No Companies to display</p>
        )}
        {companiesStockData != null &&
          companiesStockData.length !== 0 &&
          companiesData != null &&
          companiesData.map((value, ind) => {
            if (value == null || companiesStockData[ind] == null) {
              return;
            }
            const percentChange = toPercentage(
              companiesStockData[ind].price,
              companiesStockData[ind].dayStart
            );

            // handle dynamic styling with repeated classes!
            const companyClass = cn(
              "w-full h-full rounded-sm mt-2 hover:scale-103 transition-transform duration-300 ease-in-out hover:cursor-pointer hover:brightness-90 flex flex-row",
              {
                "bg-red-200": percentChange < 0,
                "bg-red-400": percentChange < -5,
                "bg-green-400": percentChange > 5,
                "bg-green-200": percentChange >= 0 && percentChange <= 5,
              }
            );
            return (
              <div
                className="flex flex-row justify-center h-5/50 w-9/10 m-1"
                key={value.id}
              >
                <div
                  className={companyClass}
                  onClick={() => {
                    handleClick(value.id);
                  }}
                >
                  <h5 className="font-bold ml-2 pt-1 text-lg truncate w-3/5">
                    {value.name} ({value.ticker})
                  </h5>
                  <h5
                    className={
                      percentChange < 0
                        ? " font-bold pt-1 text-lg text-red-600 mr-2 ml-auto"
                        : " font-bold pt-1 text-lg text-green-800 mr-2 ml-auto"
                    }
                  >
                    ${companiesStockData[ind].price.toFixed(2)} |{" "}
                    {percentChange}%
                  </h5>
                </div>
                <div>
                  {isEditingMode ? (
                    <X
                      className=" mt-4 ml-1 hover:scale-115 transition-transform duration-200 ease-in-out hover:cursor-pointer"
                      onClick={() => {
                        handleDelete(value.id);
                      }}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            );
          })}
      </div>
      ;
    </div>
  );
};

export default PortfolioCompanies;
