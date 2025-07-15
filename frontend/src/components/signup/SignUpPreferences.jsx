import SectorList from "./SectorList";
import IndustryList from "./IndustryList";
import { SignUpInfoContext } from "../../context/SignUpContext";

const MIN_SELECTED = 1;

const SignUpPreferences = ({ createUser }) => {
  const { sectorsSelected, industriesSelected } = SignUpInfoContext();
  return (
    <div className="flex flex-col bg-indigo-50 p-8 rounded-md shadow-xl/40 w-150 m-auto">
      <h2 className="self-center font-bold text-xl">
        Thank You For Joining Alpha-Edge
      </h2>
      <h3 className="self-center font-med text-md">
        To complete your registration, continue with the steps below:
      </h3>
      <h3 className="self-center font-bold text-xl mt-7">
        Choose up to 3 sectors of interest
      </h3>
      <SectorList />

      <h3 className="self-center font-bold text-xl mt-7">
        Choose up to 5 Industries of interest
      </h3>
      <IndustryList />
      {sectorsSelected.length >= MIN_SELECTED &&
        industriesSelected.length >= MIN_SELECTED && (
          <button
            type="submit"
            id="signup"
            className="m-2 bg-green-400 shadow-xl/10 shadow-slate-900  hover:brightness-110 mt-10"
            onClick={createUser}
          >
            Create Account
          </button>
        )}
    </div>
  );
};

export default SignUpPreferences;
