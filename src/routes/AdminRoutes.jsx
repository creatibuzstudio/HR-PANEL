// imports
import AdminLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import UserManagement from "@/pages/user-management/UserManagement.jsx";

import PrivateRoute from "@/hooks/usePrivateRoute.jsx";
import RoleManagement from "@/pages/role-management/RoleManagement.jsx";
import RolePermissionManagement from "@/pages/role-permissions-management/RolePermissionManagment.jsx";

import { Permissions } from "@/constants/permissions";
import PackageManagement from "@/pages/package-management/PackageManagement";
import InvoiceManagement from "@/pages/invoice-management/InvoiceManagement.jsx";
import ProductManagement from "@/pages/product-management/ProductManagement.jsx";
import CustomerManagement from "@/pages/customer-management/CustomerManagement.jsx";
import ServiceManagement from "@/pages/service-management/ServiceManagement.jsx";

import AdminLogin from "@/pages/auth/Login.jsx";
import AdminMagicLogin from "@/pages/auth/AdminMagicLogin.jsx";

// Helper to wrap element with PrivateRoute
const withAdminRoute = (Component, requiredPermissions = []) => (
  <PrivateRoute requireAdmin requiredPermissions={requiredPermissions}>
    <Component />
  </PrivateRoute>
);

export const adminRoutes = [
  {
    path: "/",
    element: withAdminRoute(AdminLayout),
    children: [
      { path: "/", element: withAdminRoute(Dashboard) },
      {
        path: "user-management",
        children: [
          {
            path: "all-users",
            element: withAdminRoute(UserManagement, [Permissions.USER_LIST]),
          },
          {
            path: "roles",
            element: withAdminRoute(RoleManagement, [Permissions.ROLE_LIST]),
          },
          {
            path: "permissions",
            element: withAdminRoute(RolePermissionManagement),
          },
        ],
      },
      {
        path: "packages",
        element: withAdminRoute(PackageManagement, [
          Permissions.PACKAGE_LIST,
        ]),
      },
      {
        path: "products",
        element: withAdminRoute(ProductManagement, [Permissions.PRODUCT_LIST]),
      },
      {
        path: "invoices",
        element: withAdminRoute(InvoiceManagement),
      },
      {
        path: "customers",
        element: withAdminRoute(CustomerManagement),
      },
      {
        path: "services",
        element: withAdminRoute(ServiceManagement, [
          Permissions.SERVICE_LIST,
        ]),
      },

      {
        path: "system",
        children: [],
      },
    ],
  },
  { path: "/login", element: <AdminLogin /> },
  { path: "/admin/magic-login", element: <AdminMagicLogin /> },
];
