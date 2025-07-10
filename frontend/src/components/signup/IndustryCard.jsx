import cn from "classnames";
import { useState } from "react";
import { SignUpInfo } from "../../context/SignUpContext";

const MAX_INDUSTRIES = 5;

const IndustryCard = ({ industryInfo }) => {
  const {
    numberIndustriesSelected,
    setNumberIndustriesSelected,
    setIndustriesSelected,
    industriesSelected,
  } = SignUpInfo();
  const [isClicked, setIsClicked] = useState(
    industriesSelected.includes(industryInfo.id)
  );

  const handleClick = () => {
    if (isClicked == true) {
      setNumberIndustriesSelected((self) => self - 1);
      setIndustriesSelected((self) =>
        self.filter((id) => id !== industryInfo.id)
      );
    } else {
      if (numberIndustriesSelected >= MAX_INDUSTRIES) {
        return;
      }
      setNumberIndustriesSelected((self) => self + 1);
      setIndustriesSelected((self) => [...self, industryInfo.id]);
    }
    setIsClicked((self) => !self);
  };

  const industryClass = cn(
    "bg-gray-300 text-black m-2 rounded-sm p-1 hover:scale-110 transition-transform duration-150 ease-in-out hover:cursor-pointer hover:brightness-90",
    {
      "bg-rose-300": industriesSelected.includes(industryInfo.id) === true,
    }
  );
  return (
    <div
      onClick={() => {
        handleClick();
      }}
      className={industryClass}
    >
      <h2>{industryInfo.name}</h2>
    </div>
  );
};

export default IndustryCard;
