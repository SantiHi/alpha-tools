import Searchbar from "./components/SearchBar";
import { BASE_URL } from "./lib/utils";
import { useNavigate } from "react-router-dom";
import { UserInfo } from "./context/UserContext";
import SignUpPreferences from "./components/signup/SignUpPreferences";

const Settings = () => {
  const { setIsLoggedIn, setAuthChecked } = UserInfo();

  const navigate = useNavigate();

  const signOut = async () => {
    await fetch(`${BASE_URL}/auth/signout`, {
      method: "DELETE",
      credentials: "include",
    });
    setIsLoggedIn(false);
    setAuthChecked(false);
    navigate("/login");
  };
  return (
    <main className="w-full">
      <div className="flex flex-col items-center">
        <Searchbar />
        <h3 className="self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold  z-10">
          Settings
        </h3>
        <button
          className="bg-white hover:cursor-pointer hover:scale-140 hover:brightness-110 mt-2"
          onClick={signOut}
        >
          Log Out
        </button>
        <SignUpPreferences changeMode={true} />
      </div>
    </main>
  );
};

export default Settings;
