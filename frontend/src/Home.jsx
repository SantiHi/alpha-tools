import { SidebarProvider, SidebarTrigger } from "./components/ui/Sidebar";
import AppSidebar from "./components/AppSidebar";
import SearchBar from "./components/SearchBar";
import CompanyList from "./components/CompanyList";
import { UserFullName } from "./context/UserContext";

const Home = ({ children }) => {
  const { fullName, setFullName } = UserFullName();
  console.log(fullName);
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col justify-center">
          <SidebarTrigger className="fixed" />
        </div>
        <header className="bg-indigo-50 fixed top-0 w-full pt-4 flex flex-col items-center h-16">
          <h2 className="fixed top-0 left-4 text-4xl pt-3 font-medium">
            Alpha-Edge
          </h2>
          <h4 className="fixed top-0 right-4 pt-5">
            Good day, <span className="font-bold"> {fullName} </span>
          </h4>
        </header>
        <main className="w-full">
          <div className="flex flex-col items-center">
            <SearchBar />
            <h3 className="self-center text-center text-6xl mt-30 mb-10 text-indigo-50 font-semibold drop-shadow-[0px_0px_39px_rgba(247,247,247,.8)]">
              Explore Companies
            </h3>
            <CompanyList />
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default Home;
