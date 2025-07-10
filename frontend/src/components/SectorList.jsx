import Sector from "./Sector";
import { useState, useEffect } from "react";
import { BASE_URL, toPercentage } from "../lib/utils";
import { UserInfo } from "../context/UserContext";

const SectorList = () => {
  const [sectors, setSectors] = useState([]);
  const { isLoggedIn } = UserInfo();
  const fetchSectors = async () => {};

  useEffect(() => {
    fetchSectors();
  }, []);

  if (sectors == null) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-4/5">
      {sectors.map((value, ind) => {
        return (
          <Sector
            key={value.id}
            sectorInfo={{
              name: value.name,
              id: value.id,
            }}
          />
        );
      })}
    </div>
  );
};

export default SectorList;
