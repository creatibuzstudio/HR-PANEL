// imports
import AdminLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import UserManagement from "@/pages/user-management/UserManagement.jsx";

import PrivateRoute from "@/hooks/usePrivateRoute.jsx";
import RoleManagement from "@/pages/role-management/RoleManagement.jsx";
import RolePermissionManagement from "@/pages/role-permissions-management/RolePermissionManagment.jsx";

import { Permissions } from "@/constants/permissions";
import PackageManagement from "@/pages/package-management/PackageManagement";
import PackageBookingManagement from "@/pages/package-booking-management/PackageBookingManagement.jsx";
import InvoiceManagement from "@/pages/invoice-management/InvoiceManagement.jsx";
import ProductManagement from "@/pages/product-management/ProductManagement.jsx";
import CustomerManagement from "@/pages/customer-management/CustomerManagement.jsx";
import ServiceManagement from "@/pages/service-management/ServiceManagement.jsx";
import PackageCategoryManagement from "@/pages/package-category-management/PackageCategoryManagement.jsx";
import CategoryManagement from "@/pages/category-management/CategoryManagement.jsx";
import BlogManagement from "@/pages/blog-management/BlogManagement.jsx";
import CaseStudyManagement from "@/pages/casestudy-management/CaseStudyManagement.jsx";
import CreateCaseStudy from "@/pages/casestudy-management/CreateCaseStudy.jsx";
import EditCaseStudy from "@/pages/casestudy-management/EditCaseStudy.jsx";
import OrderManagement from "@/pages/order-management/OrderManagement.jsx";
import FinanceManagement from "@/pages/finance-management/FinanceManagement.jsx";
import PayrollManagement from "@/pages/payroll/PayrollManagement.jsx";
import MyPayslips from "@/pages/payroll/MyPayslips.jsx";
import MyInfo from "@/pages/user/MyInfo.jsx";
import ActivityLogs from "@/pages/activity-logs/ActivityLogs.jsx";
import TimeTracker from "@/pages/time-tracker/TimeTracker.jsx";


import AdminLogin from "@/pages/auth/Login.jsx";
import AdminMagicLogin from "@/pages/auth/AdminMagicLogin.jsx";
import EmployeeRegister from "@/pages/auth/EmployeeRegister.jsx";

// Helper to wrap element with PrivateRoute
const withAdminRoute = (
  Component,
  requiredPermissions = [],
  allowedRoles = []
) => (
  <PrivateRoute
    requireAdmin
    requiredPermissions={requiredPermissions}
    allowedRoles={allowedRoles}
  >
    <Component />
  </PrivateRoute>
);

export const adminRoutes = [
  {
    path: "/",
    element: withAdminRoute(AdminLayout),
    children: [
      { path: "/", element: withAdminRoute(Dashboard) },
      { path: "overview", element: withAdminRoute(Dashboard) },
      {
        path: "user-management",
        children: [
          {
            path: "all-users",
            element: withAdminRoute(UserManagement, [], ["ceo", "coo"]),
          },
          {
            path: "roles",
            element: withAdminRoute(RoleManagement, [], ["ceo", "coo"]),
          },
          {
            path: "permissions",
            element: withAdminRoute(RolePermissionManagement, [], ["ceo", "coo", "hr"]),
          },
        ],
      },
      {
        path: "packages",
        element: withAdminRoute(PackageManagement, [], ["ceo", "coo", "hr", "admin", "founder", "cto", "super-admin"]),
      },
      {
        path: "package-bookings",
        element: withAdminRoute(PackageBookingManagement, [], ["ceo", "coo", "hr", "admin", "founder", "cto", "super-admin"]),
      },
      {
        path: "packages/bookings",
        element: withAdminRoute(PackageBookingManagement, [], ["ceo", "coo", "hr", "admin", "founder", "cto", "super-admin"]),
      },
      {
        path: "blogs",
        element: withAdminRoute(BlogManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "case-studies",
        element: withAdminRoute(CaseStudyManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "case-studies/create",
        element: withAdminRoute(CreateCaseStudy, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "case-studies/edit/:id",
        element: withAdminRoute(EditCaseStudy, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "casestudies",
        element: withAdminRoute(CaseStudyManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "casestudies/create",
        element: withAdminRoute(CreateCaseStudy, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "casestudies/edit/:id",
        element: withAdminRoute(EditCaseStudy, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "categories",
        element: withAdminRoute(CategoryManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "my-info",
        element: withAdminRoute(MyInfo),
      },
      {
        path: "settings/categories",
        element: withAdminRoute(CategoryManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "package-categories",
        element: withAdminRoute(PackageCategoryManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "settings/package-categories",
        element: withAdminRoute(PackageCategoryManagement, [], ["ceo", "coo", "hr", "developer"]),
      },
      {
        path: "products",
        element: withAdminRoute(ProductManagement, [Permissions.PRODUCT_LIST]),
      },
      {
        path: "orders",
        element: withAdminRoute(OrderManagement, [], ["ceo", "coo"]),
      },
      {
        path: "finance",
        element: withAdminRoute(FinanceManagement, [], ["ceo", "coo"]),
      },
      {
        path: "payroll",
        element: withAdminRoute(PayrollManagement, [], ["ceo", "coo"]),
      },
      {
        path: "my-payslips",
        element: withAdminRoute(MyPayslips),
      },
      {
        path: "activity-logs",
        element: withAdminRoute(ActivityLogs, [], ["ceo", "coo"]),
      },
      {
        path: "logs",
        element: withAdminRoute(ActivityLogs, [], ["ceo", "coo"]),
      },
      {
        path: "time-tracker",
        element: withAdminRoute(TimeTracker),
      },
      {
        path: "attendance",
        element: withAdminRoute(TimeTracker),
      },



      {
        path: "invoices",
        element: withAdminRoute(OrderManagement, [], ["ceo", "coo"]),
      },
      {
        path: "customers",
        element: withAdminRoute(CustomerManagement, [], ["ceo", "coo"]),
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
  { path: "/register", element: <EmployeeRegister /> },
  { path: "/join", element: <EmployeeRegister /> },
  { path: "/employee-register", element: <EmployeeRegister /> },
];
