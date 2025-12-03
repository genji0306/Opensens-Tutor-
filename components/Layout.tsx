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
          <div className="flex items-center space-x-3">
             {/* Opensens Logo SVG */}
             <div className="w-10 h-10 flex-shrink-0 text-[#00BFA5]">
               <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M20 30 L50 15 L80 30 V60 L50 75 L20 60 V30 Z" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="hidden" // Placeholder for simple path reference
                  />
                  {/* Stylized M/Hexagon Shape based on Opensens Logo */}
                  <path 
                    d="M28 35 L50 22 L72 35" 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M72 35 V65 L50 78 L28 65 V35" 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  {/* Adding the cut/gap effect for the M shape */}
                   <path 
                    d="M50 22 V50" 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
               </svg>
             </div>
             <div className="flex flex-col">
               <span className="text-xl font-bold text-gray-800 tracking-tight leading-none">opensens</span>
               <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Tutor</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <NavLink 
            to="/settings"
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
              ${isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
           <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
           <div className="flex items-center space-x-2">
             <div className="w-8 h-8 text-[#00BFA5]">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 35 L50 22 L72 35" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M72 35 V65 L50 78 L28 65 V35" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 22 V50" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </div>
             <span className="font-bold text-lg text-gray-800">opensens</span>
           </div>
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