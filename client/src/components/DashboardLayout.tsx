import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import MobileSideBarOverlay from "./MobileSideBarOverlay";
import SideBar from "./SideBar";
import MobileTopBarWithHamburger from "./MobileTopBarWithHamburger";
import MainContent from "./MainContent";

export default function DashboardLayout() {
  const [pageTitle, setPageTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openParent, setOpenParent] = useState<string | null>(null);
  const context = {
    setPageTitle
  };

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle + " - Inventory Management System";
    }
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-gray-100">
      <MobileTopBarWithHamburger setMobileSidebarOpen={setMobileSidebarOpen} pageTitle={pageTitle} />

      {/* Mobile sidebar overlay */}
      <MobileSideBarOverlay
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        openParent={openParent}
        setOpenParent={setOpenParent}
      />

      {/* Desktop layout: sidebar + main content */}
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:min-h-screen md:flex-row bg-gray-100 text-gray-700">
        {/* Left sidebar (expanded or collapsed) on desktop only */}
        <SideBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          openParent={openParent}
          setOpenParent={setOpenParent}
        />

        {/* Right content area */}
        <MainContent sidebarOpen={sidebarOpen} pageTitle={pageTitle}>
          <Outlet context={context} />
        </MainContent>
      </div>
    </div>
  );
}
