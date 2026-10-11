import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/layout/navbar/AdminNavbar";
import AdminSidebar from "@/components/layout/sidebar/AdminSidebar";
import { useInitUser } from "@/hooks/useInitUser.jsx";

const AdminLayout = () => {
  const { isLoading } = useInitUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0CABA8]"></div>
      </div>
    );
  }

  return (
    <main className="w-screen dark:bg-gray-900 bg-gray-50 dark:text-white/75 text-gray-900 ">
      <div className="flex overflow-hidden">
        <AdminSidebar />

        <div className="flex-1 flex flex-col  min-h-screen overflow-y-hidden">
          <AdminNavbar />

          <div className="flex-1 overflow-y-auto p-6 h-full  ">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLayout;
