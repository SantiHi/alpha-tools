import cn from "classnames";
import { useState } from "react";
import { SignUpInfo } from "../../context/SignUpContext";

const MAX_SECTORS = 3;

const SectorCard = ({ sectorInfo }) => {
  const [isClicked, setIsClicked] = useState(false);
  const {
    numberSectorsSelected,
    setNumberSectorsSelected,
    setSectorsSelected,
  } = SignUpInfo();

  if (sectorInfo == null) {
    return;
  }

  const handleClick = () => {
    if (isClicked == true) {
      setNumberSectorsSelected((self) => self - 1);
      setSectorsSelected((self) => self.filter((id) => id !== sectorInfo.id));
    } else {
      if (numberSectorsSelected >= MAX_SECTORS) {
        return;
      }
      setNumberSectorsSelected((self) => self + 1);
      setSectorsSelected((self) => [...self, sectorInfo.id]);
    }
    setIsClicked((self) => !self);
  };

  const sectorClass = cn(
    "bg-gray-300 text-black m-2 rounded-sm p-1 hover:scale-110 transition-transform duration-150 ease-in-out hover:cursor-pointer hover:brightness-90",
    {
      "bg-green-300": isClicked == true,
    }
  );

  return (
    <div
      onClick={() => {
        handleClick();
      }}
      className={sectorClass}
    >
      <h2>{sectorInfo.name}</h2>
    </div>
  );
};

export default SectorCard;
