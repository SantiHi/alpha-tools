import { useNavigate } from "react-router-dom";
import { UserInfo } from "../context/UserContext";
import cn from "classnames";

const MODE_FIT = "fit";

const Company = ({ companyFacts, mode }) => {
  const { setSelectedId } = UserInfo();
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/CompanyInfo/${companyFacts.id}`);
  };

  // stylings
  const classMode = cn(
    "flex flex-row rounded-lg h-40 mb-15 mr-5 ml-1 shadow-[0px_0px_45px_10px_rgba(223,215,217,.1)] hover:cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out",
    {
      "w-50s max-w-3/5": mode === MODE_FIT,
      "w-80s": mode !== MODE_FIT,
      "bg-indigo-50": mode !== MODE_FIT,
      "bg-green-300": mode === MODE_FIT && companyFacts.dailyChange >= 0,
      "bg-red-300": mode === MODE_FIT && companyFacts.dailyChange < 0,
    }
  );
  const titleSize = cn("font-bold w-.6 ml-6", {
    "text-xl": mode === MODE_FIT,
    "text-3xl": mode !== MODE_FIT,
  });
  const factsSize = cn("flex flex-col justify-center items-center w-1/2 pr-2", {
    "text-xl": mode === MODE_FIT,
    "text-2xl": mode !== MODE_FIT,
  });
  const factsStyling = cn("font-bold", {
    "text-red-800": companyFacts.dailyChange < 0,
    "text-green-800": companyFacts.dailyChange > 0,
  });

  return (
    <div
      onClick={() => {
        handleView();
        setSelectedId(companyFacts.id);
      }}
      className={classMode}
    >
      <div
        id="title"
        className="flex flex-col justify-center items-center w-1/2 p-0"
      >
        <h4 className={titleSize}>{companyFacts.name}</h4>
      </div>
      <div className={factsSize}>
        <h5 className="font-bold text-cyan-600 p-0">{`(${companyFacts.ticker})`}</h5>
        <h5 className={factsStyling}>{`$${companyFacts.daily}`}</h5>
        <h5 className={factsStyling}>
          {companyFacts.dailyChange}
          <span>%</span>
        </h5>
      </div>
    </div>
  );
};

export default Company;
