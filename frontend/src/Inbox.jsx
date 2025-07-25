import SearchBar from "./components/SearchBar";
import NotificationsList from "./components/NotificationsList";
const Inbox = () => {
  return (
    <>
      <main className="w-full">
        <div className="flex flex-col items-center">
          <SearchBar />
          <NotificationsList />
        </div>
      </main>
    </>
  );
};

export default Inbox;
