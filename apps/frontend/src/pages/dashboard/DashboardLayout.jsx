import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CloudRain,
  Flame,
  Droplets,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import ChatBot from '../../components/ChatBot';

const DashboardLayout = () => {
  const location = useLocation();

  const sidebarItems = [
    {
      path: '/dashboard',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: '/dashboard/weather',
      label: 'Weather',
      icon: <CloudRain className="w-5 h-5" />,
    },
    {
      path: '/dashboard/water-analysis',
      label: 'Water Levels',
      icon: <Droplets className="w-5 h-5" />,
    },
    {
      path: '/dashboard/fire-risk',
      label: 'Fire Risk',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      path: '/dashboard/flood-prediction',
      label: 'Flood AI',
      icon: <Droplets className="w-5 h-5" />,
    },
    {
      path: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background pt-20">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-20 bottom-0 bg-background-light/30 backdrop-blur-md border-r border-sidebar-border z-40 hidden lg:block">
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 font-heading">
            Menu
          </h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative block"
                >
                  <div
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10',
                      isActive
                        ? 'text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-card-bg/50'
                    )}
                  >
                    {item.icon}
                    <span className="font-medium font-body">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 border border-primary/30 rounded-xl shadow-neon"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 overflow-x-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
};

export default DashboardLayout;
