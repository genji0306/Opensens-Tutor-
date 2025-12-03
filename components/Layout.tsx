import React from 'react';
import { NavLink } from 'react-router-dom'; // Using HashRouter under the hood
import { LayoutDashboard, Users, Cpu, Bot, BookOpen, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Children', path: '/children' },
    { icon: Cpu, label: 'Devices', path: '/devices' },
    { icon: Bot, label: 'Tutors', path: '/tutors' },
    { icon: BookOpen, label: 'Lesson Builder', path: '/lessons' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
               K
             </div>
             <span className="text-xl font-bold text-gray-800 tracking-tight">KidTutor</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Settings size={20} />
            <span>Settings</span>
          </a>
           <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50">
            <LogOut size={20} />
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
           <span className="font-bold text-lg">KidTutor</span>
           <button className="text-gray-500">Menu</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;