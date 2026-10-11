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
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-gray-200 dark:border-gray-700">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              className="w-9 h-9 rounded-xl shadow-sm object-cover flex-shrink-0"
              src={logo}
              alt="Creatibuz Studio"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white truncate">
                Creatibuz Studio
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                HR Panel
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <img
              className="w-8 h-8 rounded-lg shadow-sm object-cover"
              src={logo}
              alt="Creatibuz Studio"
            />
          </div>
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
      <nav className="mt-4 px-2">
        <ul className="space-y-2">
          {visibleNavLinks.map((item, i) => (
            <li key={i}>
              <div>
                <Link
                  to={item.link}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isParentActive(item.link)
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary"
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
    </div>
  );
};

export default AdminSidebar;
