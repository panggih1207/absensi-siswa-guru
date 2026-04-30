import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer } from '@/components/ui/toast';
import useUIStore from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children, title }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
