import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "@/routes/AdminRoutes.jsx";
import Unauthorized from "@/pages/common/unauthorized.jsx";
import ErrorPage from "@/pages/common/errorPage.jsx";

const commonRoutes = [
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <ErrorPage /> },
];

export const routes = createBrowserRouter([...adminRoutes, ...commonRoutes]);
