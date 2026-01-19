
import React from 'react';
import logo from "../../public/FUTOLOGO.png"
import  type { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="futo-maroon text-white shadow-lg sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded">
                <img 
                  src={logo}
                  alt="FUTO Logo" 
                  className="w-8 h-8 rounded-sm"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">FUTO PAY</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-maroon-100 opacity-80">{user.reg_number}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Federal University of Technology Owerri. All Rights Reserved.</p>
          <p className="mt-1">Developed for CSC 409 Project.</p>
        </div>
      </footer>
    </div>
  );
};
