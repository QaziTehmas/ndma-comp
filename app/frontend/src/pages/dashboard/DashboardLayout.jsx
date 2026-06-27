import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CloudRain,
  Flame,
  Droplets,
  BarChart3,
  Menu,
  ChevronLeft,
  Pin,
  PinOff,
  Home,
  Users,
  History,
  Zap,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import ChatBot from "../../components/ChatBot";
import { useTheme } from "../../context/ThemeContext";

const DashboardLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const sidebarItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/dashboard/weather",
      label: "Weather",
      icon: <CloudRain className="w-5 h-5" />,
    },
    {
      path: "/dashboard/water-analysis",
      label: "Water Levels",
      icon: <Droplets className="w-5 h-5" />,
    },
    {
      path: "/dashboard/fire-risk",
      label: "Fire Risk",
      icon: <Flame className="w-5 h-5" />,
    },
    {
      path: "/dashboard/flood-prediction",
      label: "Flood AI",
      icon: <Droplets className="w-5 h-5" />,
    },
    {
      path: "/dashboard/analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      path: "/dashboard/emergency-operations",
      label: "Emergency Ops",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
  ];

  const navigationItems = [
    { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/about", label: "About Us", icon: <Users className="w-5 h-5" /> },
    {
      path: "/history/floods",
      label: "Floods History",
      icon: <History className="w-5 h-5" />,
    },
    // { path: '/history/earthquakes', label: 'Earthquake History', icon: <Zap className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-background dashboard-theme">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 bottom-0 bg-[var(--sidebar-bg)] backdrop-blur-md border-r border-sidebar-border z-40 hidden lg:flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
        onMouseEnter={() => !pinned && setCollapsed(false)}
        onMouseLeave={() => !pinned && setCollapsed(true)}
      >
        {/* Menu Section - Top */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading py-1.5">
              Menu
            </h2>

            <div className="flex items-center gap-3">
              {!collapsed && (
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg bg-card-bg/50 hover:bg-card-bg transition-colors"
                  title={`Switch to ${
                    theme === "light" ? "dark" : "light"
                  } mode`}
                >
                  {theme === "light" ? (
                    <Moon size={18} className="w-4 h-4 text-text-primary" />
                  ) : (
                    <Sun size={18} className="w-4 h-4 text-text-primary" />
                  )}
                </button>
              )}

              {!collapsed && (
                <button
                  onClick={() => setPinned(!pinned)}
                  className={clsx(
                    "hover:bg-card-bg/50 p-1 rounded-lg transition-colors",
                    pinned && "text-primary"
                  )}
                  title={pinned ? "Unpin sidebar" : "Pin sidebar"}
                >
                  {pinned ? <Pin size={18} /> : <PinOff size={18} />}
                </button>
              )}
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path} className="relative block">
                  <div
                    className={clsx(
                      "group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative z-10",
                      collapsed ? "justify-center px-3" : "gap-3",
                      isActive
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-card-bg/50"
                    )}
                  >
                    {/* Icon wrapper stays same size */}
                    <div
                      className={clsx(
                        "flex items-center justify-center transition-transform duration-200",
                        collapsed ? "scale-125" : "scale-100"
                      )}
                    >
                      {item.icon}
                    </div>

                    {/* Label only fades + shrinks away */}
                    <span
                      className={clsx(
                        "font-medium font-body whitespace-nowrap transition-all duration-200",
                        collapsed
                          ? "opacity-0 pointer-events-none w-0 scale-90"
                          : "opacity-100 w-auto scale-100"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 
      border border-primary/30 rounded-xl shadow-neon"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          {/* <div className="py-4">
            <div className="border-t border-sidebar-border"></div>
          </div> */}
        </div>

        {/* Pages Section - Bottom */}
        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading py-1.5">
              Pages
            </h2>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path} className="relative block">
                  <div
                    className={clsx(
                      "flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative z-10",
                      collapsed ? "justify-center px-3" : "gap-3",
                      isActive
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-card-bg/50"
                    )}
                  >
                    {/* ICON */}
                    <div
                      className={clsx(
                        "flex items-center justify-center transition-transform duration-200",
                        collapsed ? "scale-125" : "scale-100"
                      )}
                    >
                      {item.icon}
                    </div>

                    {/* LABEL */}
                    <span
                      className={clsx(
                        "font-medium font-body whitespace-nowrap transition-all duration-200",
                        collapsed
                          ? "opacity-0 w-0 pointer-events-none scale-90"
                          : "opacity-100 w-auto scale-100"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* ACTIVE INDICATOR */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-navigation-active"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 border border-primary/30 rounded-xl shadow-neon"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          {/* <div className="py-4">
            <div className="border-t border-sidebar-border"></div>
          </div> */}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={clsx(
          "flex-1 p-6 overflow-x-hidden transition-all duration-300",
          collapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <ChatBot />
    </div>
  );
};

export default DashboardLayout;
