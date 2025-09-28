// DashboardLayout.jsx - Main layout wrapper
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar for desktop, overlay for mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}