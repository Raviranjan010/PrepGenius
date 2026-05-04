import { Header } from "@/components/header";
import { Footer } from "@/views/footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-foreground selection:bg-primary/30">
      <Header />
      <main className="flex-grow w-full relative">
        {/* Subtle background glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full opacity-20 pointer-events-none z-0" />
        
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
