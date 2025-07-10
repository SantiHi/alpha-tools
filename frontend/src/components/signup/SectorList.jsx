import SectorCard from "./SectorCard";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../lib/utils";

const SectorList = () => {
  const [sectors, setSectors] = useState([]);
  const fetchSectors = async () => {
    const response = await fetch(`${BASE_URL}/auth/sectors`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      setSectors(data);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  if (sectors == null) {
    return;
  }
  return (
    <div className="flex flex-row flex-wrap mr-30 ml-30 justify-center h-4/5 w-full self-center">
      {sectors.map((value) => {
        if (value.name == null || value.name == "") {
          return;
        }
        return (
          <SectorCard
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
