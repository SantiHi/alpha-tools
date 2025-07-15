import SearchBar from "./components/SearchBar";
import PortfolioList from "./components/PortfolioList";
const Portfolios = () => {
  return (
    <>
      <main className="w-full">
        <div className="flex flex-col items-center">
          <SearchBar />
          <h3 className="self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold drop-shadow-[0px_0px_39px_rgba(247,247,247,.3)] z-10">
            Your Portfolios
          </h3>
        </div>
        <PortfolioList />
      </main>
    </>
  );
};

export default Portfolios;
