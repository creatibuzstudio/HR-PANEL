import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminNavLinks } from "../data";
// import { useSelector } from "react-redux";
import useAuth from "@/hooks/useAuth.js";
import logo from "@/assets/logo/logo.png";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const location = useLocation();

  const { user, permissions } = useAuth(); // get current user

  const toggleCollapse = () => setCollapsed(!collapsed);

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) newExpanded.delete(itemId);
    else newExpanded.add(itemId);
    setExpandedItems(newExpanded);
  };

  // exact match for leaf/child links, so sibling items don't both highlight
  const isActive = (link) => location.pathname === link;

  // parent items stay highlighted while on any of their child routes
  const isParentActive = (item) => {
    if (item.link && (location.pathname === item.link || location.pathname.startsWith(item.link + "/"))) {
      return true;
    }
    if (item.children?.some((child) => location.pathname === child.link)) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    adminNavLinks.forEach((item) => {
      if (item.children?.some((child) => location.pathname === child.link)) {
        setExpandedItems((prev) => new Set([...prev, item.id]));
      }
    });
  }, [location.pathname]);

  // filter nav links based on permissions and allowed roles
  const visibleNavLinks = useMemo(() => {
    // check if user has required permissions or is Super-Admin
    const hasPermission = (required = []) => {
      if (user?.type === "Super-Admin") return true;
      if (!required.length) return true; // no permissions needed
      return required.some((perm) => permissions.includes(perm));
    };

    const hasAllowedRole = (allowedRoles = []) => {
      if (!allowedRoles || !allowedRoles.length) return true;
      const userRole = user?.role?.toLowerCase();
      const userType = user?.type?.toLowerCase();
      return allowedRoles.some(
        (r) => r.toLowerCase() === userRole || r.toLowerCase() === userType
      );
    };

    return adminNavLinks
      ?.map((item) => {
        if (!hasPermission(item.requiredPermissions)) return null;
        if (!hasAllowedRole(item.allowedRoles)) return null;
        if (item.children) {
          const visibleChildren = item.children.filter(
            (child) =>
              hasPermission(child.requiredPermissions) &&
              hasAllowedRole(child.allowedRoles)
          );
          return { ...item, children: visibleChildren };
        }
        return item;
      })
      .filter(Boolean);
  }, [user, permissions]);

  return (
    <aside
      className={`h-screen flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-3.5 border-b border-gray-200 dark:border-gray-700">
        {!collapsed ? (
          <Link to="/" className="flex items-center flex-1 min-w-0 pr-2">
            <img
              className="h-10 w-full max-w-[190px] object-contain object-left filter dark:brightness-110"
              src={logo}
              alt="Creatibuz Studio"
            />
          </Link>
        ) : (
          <Link to="/" className="mx-auto flex items-center justify-center">
            <img
              className="w-9 h-9 object-contain"
              src={logo}
              alt="Creatibuz Studio"
            />
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 restro_scrollbar">
        <ul className="space-y-2">
          {visibleNavLinks.map((item, i) => (
            <li key={i}>
              <div>
                {item.children && item.children.length > 0 ? (
                  <button
                    type="button"
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isParentActive(item)
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary"
                    }`}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedItems.has(item.id) ? "rotate-90" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.link}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.link)
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                  </Link>
                )}
              </div>

              {/* Submenu */}
              {!collapsed && item.children && item.children.length > 0 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedItems.has(item.id) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <ul className="ml-6 mt-1 space-y-1">
                    {item?.children?.map((child, index) => (
                      <li key={index}>
                        <Link
                          to={child.link}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive(child.link)
                              ? "bg-primary/15 text-primary font-semibold dark:bg-primary/25 dark:text-primary"
                              : "text-gray-600 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-gray-700 hover:text-primary"
                          }`}
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
