const Company = ({ companyFacts }) => {
  return (
    <div className="flex flex-row w-80s bg-indigo-50 rounded-lg h-40 mb-15 mr-5 ml-5 shadow-[0px_0px_45px_10px_rgba(223,215,217,.2)] hover:cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out">
      <div
        id="title"
        className="flex flex-col justify-center items-center w-1/2"
      >
        <h4 className="font-bold w-.6 text-3xl ml-6">{companyFacts.name}</h4>
      </div>
      <div className="flex flex-col justify-center items-center w-1/2">
        <h5 className="font-bold text-2xl text-cyan-600">{`(${companyFacts.ticker})`}</h5>
        <h5
          className={
            companyFacts.dailyChange < 0
              ? "font-bold text-2xl text-red-800"
              : "font-bold text-2xl text-green-800"
          }
        >{`$${companyFacts.daily}`}</h5>
        <h5
          className={
            companyFacts.dailyChange < 0
              ? "font-bold text-2xl text-red-600 ml-3"
              : "font-bold text-2xl text-green-600 ml-3"
          }
        >
          {companyFacts.dailyChange} <span> %</span>
        </h5>
      </div>
    </div>
  );
};

export default Company;
