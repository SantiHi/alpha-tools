import SectorList from "./SectorList";
import IndustryList from "./IndustryList";
import { SignUpInfoContext } from "../../context/SignUpContext";
import { useEffect } from "react";
import { BASE_URL } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

const MIN_SELECTED = 1;

const SignUpPreferences = ({ createUser, changeMode }) => {
  const {
    sectorsSelected,
    industriesSelected,
    setSectorsSelected,
    setIndustriesSelected,
  } = SignUpInfoContext();

  const navigate = useNavigate();

  useEffect(() => {
    const getSectors = async () => {
      if (changeMode == false) {
        return;
      }
      const response = await fetch(`${BASE_URL}/auth/get-interests`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setIndustriesSelected(data.interestedIndustries);
      setSectorsSelected(data.sectors);
    };
    getSectors();
  }, []);

  const changePreferences = async () => {
    await fetch(`${BASE_URL}/auth/change-settings`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interestedIndustries: industriesSelected,
        sectors: sectorsSelected,
      }),
    });
    navigate("/home");
  };

  return (
    <div className="flex flex-col bg-indigo-50 p-8 rounded-md shadow-xl/40 w-150 m-auto mt-10">
      {!changeMode && (
        <h2 className="self-center font-bold text-xl">
          Thank You For Joining Alpha-Edge
        </h2>
      )}
      {!changeMode && (
        <h3 className="self-center font-med text-md">
          To complete your registration, continue with the steps below:
        </h3>
      )}
      {changeMode && (
        <h2 className="self-center font-bold text-2xl">
          Edit Your Preferences:
        </h2>
      )}
      <h3 className="self-center font-bold text-xl mt-7">
        Choose up to 3 sectors of interest
      </h3>
      <SectorList />

      <h3 className="self-center font-bold text-xl mt-7">
        Choose up to 5 Industries of interest
      </h3>
      <IndustryList />
      {sectorsSelected.length >= MIN_SELECTED &&
        industriesSelected.length >= MIN_SELECTED &&
        !changeMode && (
          <button
            type="submit"
            id="signup"
            className="m-2 bg-green-400 shadow-xl/10 shadow-slate-900  hover:brightness-110 mt-10"
            onClick={createUser}
          >
            Create Account
          </button>
        )}
      {sectorsSelected.length >= MIN_SELECTED &&
        industriesSelected.length >= MIN_SELECTED &&
        changeMode && (
          <button
            type="submit"
            id="change"
            className="m-2 bg-green-400 shadow-xl/10 shadow-slate-900  hover:brightness-110 mt-10"
            onClick={changePreferences}
          >
            Save Changes
          </button>
        )}
    </div>
  );
};

export default SignUpPreferences;
