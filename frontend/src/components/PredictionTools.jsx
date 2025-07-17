import LineChart from "./predictiontools/LineChart";

const PredictionTools = ({ portfolioData, companiesData }) => {
  return (
    <div className="bg-white h-150 w-300 mt-20 rounded-xl">
      <h2 className="text-3xl p-3 text-center w-full">Analysis Tool</h2>
      <div className="flex flex-row w-full h-full items-center -mt-12">
        <div className="flex flex-col justify-center">
          <button className=" bg-red-700 text-white hover:brightness-80 mx-5 m-2">
            Risk Analysis
          </button>
          <button className=" bg-green-700 text-white hover:brightness-80 mx-5 m-2">
            Predicted Preformance
          </button>
        </div>
        <div className="bg-gray-300 w-225 h-4/5 rounded-lg">
          <LineChart
            portfolioData={portfolioData}
            companiesData={companiesData}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionTools;
