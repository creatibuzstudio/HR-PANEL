import {
  LayoutDashboard,
  Users,
  Cloud,
  FileText,
  Settings,
  Radio,
  UserCog,
  UserCheck,
  Shapes,
  Youtube,
  Sun,
  DollarSign,
  MessageSquare,
  ShoppingBag,
  Menu,
} from "lucide-react";
import { Permissions } from "@/constants/permissions";

export const adminNavLinks = [
  {
    id: 1,
    title: "Dashboard",
    link: "/",
    icon: LayoutDashboard,
    requiredPermissions: [],
  },
  {
    id: 2,
    title: "User Management",
    link: "/user-management/all-users",
    icon: UserCog,
    // requiredPermissions: [Permissions.USER_LIST],
    children: [
      {
        title: "System Users",
        link: "/user-management/all-users",
        // requiredPermissions: [Permissions.USER_LIST],
      },
      {
        title: "Customers",
        link: "/customers",
        // requiredPermissions: [Permissions.USER_APPROVAL],
      },
    ],
  },
  {
    id: 12,
    title: "Packages",
    link: "/packages",
    icon: DollarSign,
    // requiredPermissions: [Permissions.PACKAGE_LIST],
  },
  {
    id: 13,
    title: "Invoices",
    link: "/invoices",
    icon: FileText,
    // requiredPermissions: [Permissions.INVOICE_LIST],
  },
  {
    id: 14,
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "Departments",
        link: "/user-management/roles",
        // requiredPermissions: [Permissions.ROLE_LIST],
      },
      {
        title: "Designations",
        link: "/user-management/permissions",
        // requiredPermissions: [Permissions.ROLE_SHOW, Permissions.ROLE_UPDATE],
      },
      {
        title: "Categories",
        link: "/categories",
      },
      {
        title: "Package Categories",
        link: "/package-categories",
      },
      {
        title: "Services",
        link: "/services",
        // requiredPermissions: [Permissions.SERVICE_LIST],
      },
    ],
  },
];

export const adminDropdownItems = [
  {
    title: "Profile",
    link: "/profile",
    icon: Users,
  },
  {
    title: "Notifications",
    link: "/notifications",
    icon: Users,
  },
  {
    title: "Settings",
    link: "/settings",
    icon: Settings,
  },
  {
    title: "Logout",
    link: "/logout",
    icon: Users,
  },
];
