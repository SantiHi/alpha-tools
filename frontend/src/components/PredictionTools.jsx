import LineChart from "./predictiontools/LineChart";
import { useState } from "react";
import { BASE_URL } from "../lib/utils";
import { useEffect } from "react";
import WeightingTab from "./WeightingTab";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover"; // popovers from shadcn,

//TODO: refactor popups into a customizable component so as to not repeat code
const NewModelButton = ({ getModel }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="bg-orange-400 hover:brightness-75 text-white px-10 ml-auto mr-auto m-2 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Train New Model
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 bg-orange-200 mr-12" side="left">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="font-medium text-center mb-0 p-0">New Model</h2>
            <span className="font-bold text-center mt-0 p-0">
              all previous model data will be lost, will take time (more than 15
              mins)
            </span>
            <PopoverClose asChild>
              <button
                variant="outline"
                className="bg-orange-600 hover:scale-115 hover:brightness-120  text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  getModel(true);
                }}
              >
                Train New Model
              </button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PredictionTools = ({
  portfolioData,
  companiesData,
  companiesStockData,
}) => {
  const [realData, setRealData] = useState(null);
  const [predictionsClicked, setPredictionsClicked] = useState(false);
  const [sum, setSum] = useState(0);
  async function getModel(isNewModel) {
    setPredictionsClicked(true);
    const response = await fetch(`${BASE_URL}/models/${portfolioData.id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPrice: sum,
        newModel: isNewModel,
      }),
    });
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
          <button
            className=" bg-green-700 text-white hover:brightness-80 mx-5 m-2 hover:scale-105"
            onClick={() => getModel(false)}
          >
            Get Future Predictions
          </button>
          <button className=" bg-red-700 text-white hover:brightness-80 mx-5 m-2 hover:scale-105">
            Risk Analysis
          </button>
          {predictionsClicked == false && (
            <NewModelButton getModel={getModel} />
          )}
          {predictionsClicked == true && (
            <>
              <div className="mr-auto ml-auto rounded-full w-8 h-8 m-3 border-3 border-t-transparent border-orange-200 animate-spin"></div>
              <h2 className="w-50 mr-auto ml-auto pl-3 pr-2">
                Predictions take time, and are computationally demanding...
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
          <WeightingTab />
        </div>
        <div className="bg-gray-300 w-225 h-4/5 rounded-lg">
          <LineChart portfolioData={portfolioData} realData={realData} />
        </div>
      </div>
    </div>
  );
};

export default PredictionTools;
