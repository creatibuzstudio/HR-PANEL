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
    allowedRoles: ["ceo", "coo"],
    children: [
      {
        title: "System Users",
        link: "/user-management/all-users",
        allowedRoles: ["ceo", "coo"],
      },
      {
        title: "Customers",
        link: "/customers",
        allowedRoles: ["ceo", "coo"],
      },
    ],
  },
  {
    id: 12,
    title: "Packages",
    link: "/packages",
    icon: DollarSign,
    allowedRoles: ["ceo", "coo"],
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
    allowedRoles: ["ceo", "coo"],
  },
  {
    id: 13,
    title: "Invoices",
    link: "/invoices",
    icon: FileText,
    allowedRoles: ["ceo", "coo"],
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
