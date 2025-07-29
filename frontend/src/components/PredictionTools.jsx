import LineChart from "./predictiontools/LineChart";
import { useState, useEffect } from "react";
import { BASE_URL } from "../lib/utils";
import { UserInfo } from "../context/UserContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover"; // popovers from shadcn,

const NewModelButton = ({ getModel }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="bg-orange-400 hover:brightness-75 text-white mx-2 hover:scale-105 whitespace-nowrap"
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

const PredictionTools = ({ portfolioData, companiesData, portfolioValue }) => {
  const { isGuest } = UserInfo();
  const [predictionData, setPredictionData] = useState(null);
  const [predictionsClicked, setPredictionsClicked] = useState(false);
  const [predictedBalance, setPredictedBalance] = useState(null);
  const [isModelExists, setIsModelExists] = useState(false);
  const [isCachedPredictionsClicked, setIsCachedPredictionsClicked] =
    useState(false);
  const [predictedShifts, setPredictedShifts] = useState([]);
  const [noEarningsUpcoming, setNoEarningsUpcoming] = useState(false);

  const getModelExists = async () => {
    const response = await fetch(
      `${BASE_URL}/portfolios/model-exists/${portfolioData.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const modelExists = await response.json();
    setIsModelExists(modelExists);
  };
  const getPredictedShifts = async () => {
    const response = await fetch(
      `${BASE_URL}/models/earningsdata/${portfolioData.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data != null && data.length != 0) {
      const shifts = data.map((value) => {
        return {
          date: value.UpcomingEarnings[0],
          name: value.name,
          description: "earnings release",
        };
      });
      setPredictedShifts(shifts);
      return;
    }
    setNoEarningsUpcoming(true);
  };

  async function getModel(isNewModel) {
    if (!isNewModel) {
      setIsCachedPredictionsClicked(true);
    } else {
      setPredictionsClicked(true);
    }
    const response = await fetch(`${BASE_URL}/models/${portfolioData.id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPrice: portfolioValue,
        newModel: isNewModel,
      }),
    });
    const data = await response.json();
    setIsModelExists(true);
    setPredictionData(data);
    setPredictedBalance(data[data.length - 1].price.toFixed(2));
    setIsCachedPredictionsClicked(false);
    setPredictionsClicked(false);
  }

  useEffect(() => {
    setPredictionData(null);
    setPredictedBalance(null);
    getModelExists();
  }, [portfolioValue]);

  return (
    <div className="bg-white h-150 mt-20 rounded-xl ml-30 min-w-[55%]">
      <h2 className="text-3xl p-3 text-center w-full">Analysis Tool</h2>
      <div className="flex flex-row w-full h-full items-center -mt-12">
        {companiesData != null && companiesData.length !== 0 && (
          <>
            <div className="flex flex-col justify-center">
              {isModelExists && (
                <>
                  <button
                    className=" bg-green-700 text-white hover:brightness-80 mx-5 m-2 hover:scale-105"
                    onClick={() => getModel(false)}
                  >
                    Get Future Predictions
                  </button>
                  {predictionData != null && !noEarningsUpcoming && (
                    <button
                      className=" bg-red-700 text-white hover:brightness-80 mx-5 m-2 hover:scale-105"
                      onClick={getPredictedShifts}
                    >
                      Predict Shifts
                    </button>
                  )}
                  {noEarningsUpcoming && (
                    <>
                      <h2 className="w-50 mr-auto ml-auto pl-3 pr-2 m-2">
                        No Shift data available
                      </h2>
                    </>
                  )}
                </>
              )}
              {predictionsClicked == false && !isGuest && (
                <NewModelButton getModel={getModel} />
              )}
              {predictionsClicked == true && (
                <>
                  <div className="mr-auto ml-auto rounded-full w-8 h-8 m-3 border-3 border-t-transparent border-orange-200 animate-spin"></div>
                  <h2 className="w-50 mr-auto ml-auto pl-3 pr-2">
                    Predictions take time, and are computationally
                    demanding...Check your inbox for model updates.
                  </h2>
                </>
              )}{" "}
              {isCachedPredictionsClicked == true && (
                <>
                  <div className="mr-auto ml-auto rounded-full w-8 h-8 m-3 border-3 border-t-transparent border-green-200 animate-spin"></div>
                  <h2 className="w-50 mr-auto ml-auto pl-3 pr-2">
                    Fetching predictions from stored model
                  </h2>
                </>
              )}
              <h2 className="font-bold mr-auto ml-auto mt-10 text-center">
                Total Current Balance
              </h2>
              {companiesData !== null && (
                <h2 className="font-bold mr-auto ml-auto predictedBalance">
                  ${portfolioValue}
                </h2>
              )}
              {companiesData == null && (
                <h2 className="font-bold mr-auto ml-auto text-gray-800">
                  loading...
                </h2>
              )}
              {predictedBalance != null && (
                <>
                  <h2 className="font-bold mr-auto ml-auto mt-10 text-center">
                    Balance Prediction
                  </h2>
                  <h2
                    className={
                      predictedBalance - portfolioValue > 0
                        ? "text-green-600 text-center font-bold "
                        : "text-red-600 text-center font-bold"
                    }
                  >
                    ${predictedBalance},
                    {predictedBalance - portfolioValue > 0 ? "+" : ""}
                    {(
                      ((predictedBalance - portfolioValue) / portfolioValue) *
                      100
                    ).toFixed(2)}
                    %
                  </h2>
                  <h2 className="text-center px-1 mt-3">
                    {" "}
                    The S&P returns about 0.67% monthly{" "}
                  </h2>
                </>
              )}
            </div>
            <div className="bg-gray-300 w-full h-7/10 rounded-lg mr-10">
              <LineChart
                portfolioData={portfolioData}
                predictionData={predictionData}
                predictedShifts={predictedShifts}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionTools;
