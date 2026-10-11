import { useState, useMemo } from "react";
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
  const isParentActive = (link) =>
    location.pathname === link || location.pathname.startsWith(link + "/");

  // filter nav links based on permissions
  const visibleNavLinks = useMemo(() => {
    // check if user has required permissions or is Super-Admin
    const hasPermission = (required = []) => {
      if (user?.type === "Super-Admin") return true;
      if (!required.length) return true; // no permissions needed
      return required.some((perm) => permissions.includes(perm));
    };

    return adminNavLinks
      ?.map((item) => {
        if (!hasPermission(item.requiredPermissions)) return null;
        if (item.children) {
          const visibleChildren = item.children.filter((child) =>
            hasPermission(child.requiredPermissions),
          );
          return { ...item, children: visibleChildren };
        }
        return item;
      })
      .filter(Boolean);
  }, [user, permissions]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-36 h-full rounded flex items-center justify-center">
              <img className="w-full h-full " src={logo} alt="logo" />
            </div>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2">
        <ul className="space-y-3">
          {visibleNavLinks.map((item, i) => (
            <li key={i}>
              <div>
                <Link
                  to={item.link}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isParentActive(item.link)
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    if (item.children && item.children.length > 0)
                      toggleExpanded(item.id);
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.children && item.children.length > 0 && (
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedItems.has(item.id) ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </>
                  )}
                </Link>
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
                              ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
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
    </div>
  );
};

export default AdminSidebar;
