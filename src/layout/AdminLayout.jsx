import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/layout/navbar/AdminNavbar";
import AdminSidebar from "@/components/layout/sidebar/AdminSidebar";
import { useInitUser } from "@/hooks/useInitUser.jsx";

const AdminLayout = () => {
  const { isLoading } = useInitUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0CABA8]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Fixed Sidebar - does not scroll with page */}
      <AdminSidebar />

      {/* Main Right Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Fixed Navbar - pinned at top */}
        <header className="flex-shrink-0 sticky top-0 z-30">
          <AdminNavbar />
        </header>

        {/* Scrollable Layout Content Area ONLY */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 restro_scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
