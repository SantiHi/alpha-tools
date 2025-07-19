import LineChart from "./predictiontools/LineChart";
import { useState } from "react";
import { BASE_URL } from "../lib/utils";
import { useEffect } from "react";

const PredictionTools = ({
  portfolioData,
  companiesData,
  companiesStockData,
}) => {
  const [realData, setRealData] = useState(null);
  const [predictionsClicked, setPredictionsClicked] = useState(false);
  const [sum, setSum] = useState(0);
  async function getMode() {
    setPredictionsClicked(true);
    const response = await fetch(
      `${BASE_URL}/portfolios/model/${portfolioData.id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPrice: sum,
        }),
      }
    );
    const data = await response.json();
    setRealData(data);
    setPredictionsClicked(false);
  }
  const sumValues = () => {
    if (companiesStockData == null) {
      return;
    }
    let sum = 0;
    for (let val of companiesStockData) {
      sum += val.price;
    }
    setSum(sum);
  };

  useEffect(() => {
    sumValues();
  }, [companiesStockData]);

  return (
    <div className="bg-white h-150 w-300 mt-20 rounded-xl">
      <h2 className="text-3xl p-3 text-center w-full">Analysis Tool</h2>
      <div className="flex flex-row w-full h-full items-center -mt-12">
        <div className="flex flex-col justify-center">
          <button className=" bg-red-700 text-white hover:brightness-80 mx-5 m-2">
            Risk Analysis
          </button>
          {predictionsClicked == false && (
            <button
              className=" bg-green-700 text-white hover:brightness-80 mx-5 m-2"
              onClick={getMode}
            >
              Get Future Predictions
            </button>
          )}
          {predictionsClicked == true && (
            <>
              <div className="mr-auto ml-auto rounded-full w-8 h-8 m-3 border-3 border-t-transparent border-green-200 animate-spin"></div>
              <h2 className="w-50 mr-auto ml-auto pl-3 pr-2">
                Predictions take time, and are computationally demanding. We'll
                message you when they're done!
              </h2>
            </>
          )}
          <h2 className="font-bold mr-auto ml-auto mt-10">
            Total Current Balance
          </h2>
          {companiesData !== null && (
            <h2 className="font-bold mr-auto ml-auto text-green-700">
              {sum.toFixed(2)}
            </h2>
          )}
          {companiesData == null && (
            <h2 className="font-bold mr-auto ml-auto text-gray-800">
              loading...
            </h2>
          )}
        </div>
        <div className="bg-gray-300 w-225 h-4/5 rounded-lg">
          <LineChart
            portfolioData={portfolioData}
            companiesData={companiesData}
            realData={realData}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionTools;
