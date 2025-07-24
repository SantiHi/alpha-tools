import Box from "@mui/material/Box"; // from material ui
import { DataGrid } from "@mui/x-data-grid"; // from material ui.
import { useState, useEffect } from "react";
import { BASE_URL } from "../lib/utils";

const Stocks = ({
  companiesData,
  companiesStockData,
  portfolioData,
  portfolioValue,
  setPortfolioValue,
}) => {
  const [rows, setRows] = useState([]);
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const columns = [
    {
      field: "value",
      headerName: "Total Valuation",
      headerAlign: "center",
      align: "center",
      width: 150,
      editable: false,
    },
    {
      field: "name",
      headerName: "Company Name",
      headerAlign: "center",
      align: "center",
      width: 150,
      editable: false,
    },
    {
      field: "stocks",
      headerName: "Stocks Held",
      headerAlign: "center",
      align: "center",
      type: "number",
      width: 100,
      editable: true,
    },
    {
      field: "industry",
      headerName: "Industry",
      headerAlign: "center",
      align: "center",
      width: 200,
      editable: true,
    },
    {
      field: "sector",
      headerName: "Sector",
      headerAlign: "center",
      align: "center",
      width: 150,
      editable: true,
    },
  ];
  useEffect(() => {
    if (
      companiesData == null ||
      companiesStockData == null ||
      portfolioData == null
    ) {
      return;
    }
    const newDict = companiesData.map((company, ind) => {
      if (
        companiesStockData[ind] == null ||
        portfolioData.companiesStocks[ind] == null
      ) {
        return;
      }
      return {
        id: ind,
        value: (
          companiesStockData[ind].price * portfolioData.companiesStocks[ind]
        ).toFixed(2),
        industry: company.industry,
        sector: company.sector,
        name: company.name,
        stocks: portfolioData.companiesStocks[ind],
      };
    });
    setRows(newDict);
  }, [companiesData, companiesStockData]);

  const rowUpdated = (updatedRow, originalRow) => {
    if (updatedRow.stocks <= 0) {
      return originalRow;
    } else {
      updatedRow.value = (
        companiesStockData[updatedRow.id].price * updatedRow.stocks
      ).toFixed(2);
      setPortfolioValue((value) =>
        (
          value -
          originalRow.value +
          companiesStockData[updatedRow.id].price * updatedRow.stocks
        ).toFixed(2)
      );
      setRows((value) =>
        value.map((item) =>
          item.id === originalRow.id
            ? { ...item, stocks: updatedRow.stocks }
            : item
        )
      );
      setIsSaved(false);
    }
    return updatedRow;
  };

  const saveStocks = async () => {
    setIsSaving(true);
    const stockArr = rows.map((value) => value.stocks);
    await fetch(`${BASE_URL}/portfolios/update/${portfolioData.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyStocks: stockArr }),
    });
    setIsSaving(false);
    setIsSaved(true);
  };

  return (
    <div className="bg-indigo-300 mx-20 mt-20 rounded-lg self-center">
      <h2 className="font-extrabold text-2xl text-center mt-6">
        {" "}
        Stock Amounts{" "}
      </h2>
      <h3 className="text-center">
        {" "}
        Portfolio Balance:
        <span className="text-green-700 ml-2 font-bold">
          ${portfolioValue}
        </span>{" "}
      </h3>
      <Box sx={{ height: 527, width: "450px", margin: 2, zIndex: -2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 8,
              },
            },
          }}
          pageSizeOptions={[8]}
          processRowUpdate={rowUpdated}
        />
      </Box>
      {!isSaved && (
        <button className="bg-indigo-500 h-8 flex items-center justify-center hover:brightness-80 hover:scale-115 ml-auto mr-auto m-5">
          <h2 className="font-bold text-white" onClick={saveStocks}>
            Save
          </h2>
        </button>
      )}
      {isSaving && (
        <div className="rounded-full w-8 h-8 ml-auto mr-auto m-3 border-3 border-t-transparent border-blue-200 animate-spin"></div>
      )}
    </div>
  );
};

export default Stocks;
