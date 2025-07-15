import cn from "classnames";
import { useState } from "react";
import { SignUpInfoContext } from "../../context/SignUpContext";

const MAX_SECTORS = 3;

const SectorCard = ({ sectorInfo }) => {
  const [isClicked, setIsClicked] = useState(false);
  const { setSectorsSelected, sectorsSelected } = SignUpInfoContext();

  if (sectorInfo == null) {
    return;
  }

  const handleClick = () => {
    if (isClicked == true) {
      setSectorsSelected((self) => self.filter((id) => id !== sectorInfo.id));
    } else {
      if (sectorsSelected.length >= MAX_SECTORS) {
        return;
      }
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
