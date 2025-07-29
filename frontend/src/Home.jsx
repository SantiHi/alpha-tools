import SearchBar from "./components/SearchBar";
import CompanyList from "./components/CompanyList";
import { UserInfo } from "./context/UserContext";
import PublicPortfolios from "./components/PublicPortfolio";
import cn from "classnames";

const Home = () => {
  const classText = cn(
    "self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold drop-shadow-[0px_0px_39px_rgba(247,247,247,.3)] z-10"
  );
  return (
    <>
      <main className="w-full">
        <div className="flex flex-col items-center">
          <SearchBar />
          <h3 className={classText}>Recommended Companies</h3>
          <CompanyList />
          <h3
            className={
              "self-center text-center text-6xl mt-10 mb-10 text-indigo-50 font-semibold z-10"
            }
          >
            Curated Portfolios
          </h3>
          <PublicPortfolios />
        </div>
      </main>
    </>
  );
};

export default Home;
