import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover"; // popovers from shadcn,

import cn from "classnames";

import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../lib/utils";
import { useParams } from "react-router-dom";

export const DeleteButton = ({ deleteCard, isCard }) => {
  const { id } = useParams();

  const deletePortfolio = async () => {
    await fetch(`${BASE_URL}/portfolios/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const navigate = useNavigate();
  const className = cn("border-2 bg-red-400 pt-5 hover:brightness-75 m-10", {
    "ml-auto": isCard === true,
    "ml-auto mr-auto": isCard === false,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={className}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Delete
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 bg-red-200 m-5" side="top">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="font-medium text-center mb-0 p-0">
              Delete Portfolio Confirmation
            </h2>
            <span className="font-bold text-center mt-0 p-0">
              (all data will be lost)
            </span>
            <PopoverClose asChild>
              <button
                variant="outline"
                className="bg-red-700 hover:scale-115 hover:brightness-120  text-white"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (isCard) {
                    deleteCard(e);
                  } else {
                    await deletePortfolio();
                    navigate("/portfolios");
                  }
                }}
              >
                Delete All Data
              </button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PortfolioCard = ({
  id,
  name,
  description,
  setPortfolios,
  canDelete,
  creator,
}) => {
  const navigate = useNavigate();

  const portfolioClicked = () => {
    navigate(`/portfolios/${id}`);
  };

  const deleteCard = async () => {
    await fetch(`${BASE_URL}/portfolios/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setPortfolios((self) => self.filter((val) => val.id !== id));
  };

  return (
    <div
      className="h-30 w-200 bg-indigo-50 m-4 rounded-md hover:cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out"
      onClick={portfolioClicked}
    >
      <div className="flex flex-row">
        <div className="flex flex-col justify-center items-start w-1/2">
          <h2 className="text-3xl font-bold mt-4 ml-4 ">{name}</h2>
          <p className="ml-5">{description}</p>
        </div>
        {canDelete === true && (
          <DeleteButton deleteCard={deleteCard} isCard={true}></DeleteButton>
        )}
        {creator != null && (
          <p className="self-baseline-last ml-auto mr-5">
            {" "}
            <span className="font-bold"> Owned by: </span> {creator}
          </p>
        )}
      </div>
    </div>
  );
};
export default PortfolioCard;
