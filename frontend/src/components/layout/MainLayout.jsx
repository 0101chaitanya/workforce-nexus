import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, Users, CalendarCheck,
  FileSpreadsheet, CreditCard, BarChart3, UserCircle, LogOut, Menu, ChevronLeft
} from 'lucide-react';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Extract authentication variables directly from Redux Store state
  const { user, role } = useSelector((state) => state.auth);

  const userRole = role?.toLowerCase();
  // Show company name from registration, or fallback gracefully
  const companyName = user?.companyName || "EMS Workspace";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Owner Options mirror App.jsx owner routes in the same order
  const ownerLinks = [
    { name: 'Dashboard', path: '/owner-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Organization', path: '/organization', icon: <Building2 size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={20} /> },
    { name: 'Leaves', path: '/leaves', icon: <FileSpreadsheet size={20} /> },
    { name: 'Payroll', path: '/payroll', icon: <CreditCard size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Employees', path: '/employees', icon: <Users size={20} /> },
  ];

  // Employee Options (4 primary + 2 down-most = 6 total options)
  const employeeLinks = [
    { name: 'Dashboard', path: '/employee-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
    { name: 'My Attendance', path: '/my-attendance', icon: <CalendarCheck size={20} /> },
    { name: 'My Leaves', path: '/my-leaves', icon: <FileSpreadsheet size={20} /> },
    { name: 'My Payroll', path: '/my-payroll', icon: <CreditCard size={20} /> },
    { name: 'My Reports', path: '/my-reports', icon: <BarChart3 size={20} /> },
  ];

  const primaryLinks = userRole === 'owner' ? ownerLinks : employeeLinks;

  // Dynamic layout dimension modifiers
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mobileTranslate = mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

  const linkActive = "flex items-center gap-3 px-4 py-3.5 bg-white/15 text-white rounded-xl font-semibold shadow-inner transition-all duration-150";
  const linkInactive = "flex items-center gap-3 px-4 py-3.5 text-indigo-100 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-150";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">

      {/* Mobile Sidebar Dark Overlay Drawer Dismissal Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* High-Contrast Indigo Sidebar Frame */}
      <aside className={`fixed top-0 bottom-0 left-0 bg-indigo-600 text-white flex flex-col justify-between z-50 shadow-xl transition-all duration-300 ease-in-out ${sidebarWidth} ${mobileTranslate}`}>

        {/* Upper Operations Container */}
        <div className="p-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between min-h-10 px-2">
            {!isCollapsed ? (
              <h2 className="font-extrabold text-base tracking-tight truncate text-white uppercase">
                {companyName}
              </h2>
            ) : (
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Collapse Trigger arrow icon - Laptop viewports only */}
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg text-indigo-200 hover:text-white transition">
              <ChevronLeft size={18} className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mapping Sidebar Navigation Links */}
          <nav className="space-y-1">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => isActive ? linkActive : linkInactive}
                title={isCollapsed ? link.name : ""}
              >
                <div className="shrink-0">{link.icon}</div>
                {!isCollapsed && <span className="text-sm tracking-wide truncate">{link.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Down Most Separated Block Options: Profile & Logout */}
        <div className="p-4 border-t border-white/10 space-y-1 bg-indigo-700/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 text-rose-200 hover:bg-rose-600 hover:text-white rounded-xl font-semibold transition-all duration-150 w-full"
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="shrink-0"><LogOut size={20} /></div>
            {!isCollapsed && <span className="text-sm tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area Workspace right column view window */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>

        {/* Mobile Top Header - Visible on phone and tablet viewports */}
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition">
            <Menu size={20} />
          </button>
          <span className="font-bold text-slate-800 text-sm tracking-wide truncate ml-3 uppercase">
            {companyName}
          </span>
          <div className="w-9" />
        </header>

        {/* Dynamic Outlet Target Container */}
        <main className="flex-1 p-6 md:p-8 max-w-400 w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
//i"_f/X[8FlhB