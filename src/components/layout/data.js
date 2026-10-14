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
  Newspaper,
  Layers,
  PieChart,
  Banknote,
  Receipt,
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
    id: 21,
    title: "My Info",
    link: "/my-info",
    icon: UserCheck,
    requiredPermissions: [],
  },
  {
    id: 2,
    title: "User Management",

    link: "/user-management/all-users",
    icon: UserCog,
    allowedRoles: ["ceo", "coo", "hr"],
    children: [
      {
        title: "System Users",
        link: "/user-management/all-users",
        allowedRoles: ["ceo", "coo", "hr"],
      },
      {
        title: "Customers",
        link: "/customers",
        allowedRoles: ["ceo", "coo", "hr"],
      },
    ],
  },
  {
    id: 12,
    title: "Packages",
    link: "/packages",
    icon: DollarSign,
    allowedRoles: ["ceo", "coo", "hr"],
  },
  {
    id: 17,
    title: "Orders",
    link: "/orders",
    icon: ShoppingBag,
    requiredPermissions: [],
    allowedRoles: ["ceo", "coo"],
  },
  {
    id: 18,
    title: "Finance & Profit Sharing",
    link: "/finance",
    icon: PieChart,
    requiredPermissions: [],
    allowedRoles: ["ceo", "coo", "hr"],
  },
  {
    id: 19,
    title: "Payroll Management",
    link: "/payroll",
    icon: Banknote,
    requiredPermissions: [],
    allowedRoles: ["ceo", "coo", "hr"],
  },
  {
    id: 20,
    title: "My Payslips",
    link: "/my-payslips",
    icon: Receipt,
    requiredPermissions: [],
  },

  {
    id: 13,
    title: "Invoices",
    link: "/invoices",
    icon: FileText,
    allowedRoles: ["ceo", "coo", "hr"],
  },
  {
    id: 15,
    title: "Blogs",
    link: "/blogs",
    icon: Newspaper,
    requiredPermissions: [],
  },
  {
    id: 16,
    title: "Case Studies",
    link: "/case-studies",
    icon: Layers,
    requiredPermissions: [],
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
