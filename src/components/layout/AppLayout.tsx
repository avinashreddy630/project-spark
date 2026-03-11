import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingActionButton } from "./FloatingActionButton";

const hideNavRoutes = ["/onboarding", "/login", "/signup"];
const hideFabRoutes = ["/chat", "/onboarding", "/login", "/signup"];

export function AppLayout() {
  const location = useLocation();
  const showNav = !hideNavRoutes.includes(location.pathname);
  const showFab = !hideFabRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <main className={showNav ? "flex-1 pb-16" : "flex-1"}>
        <Outlet />
      </main>
      {showFab && <FloatingActionButton />}
      {showNav && <BottomNavigation />}
    </div>
  );
}
