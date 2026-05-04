import { Header } from "@/components/header";
import { Footer } from "@/views/footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground selection:bg-primary/30">
      <Header />
      <main className="flex-grow w-full relative">
        <div className="fixed inset-x-6 top-24 h-[520px] rounded-[3rem] border border-white/55 bg-white/20 blur-0 pointer-events-none z-0" />
        <div className="fixed right-10 top-40 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none z-0" />
        
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
