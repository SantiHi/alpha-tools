import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";

const Home = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col justify-center">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Home;
