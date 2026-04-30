import React from 'react';
import { Construction } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Placeholder({ title }) {
  return (
    <DashboardLayout title={title}>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <Construction className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 max-w-sm">
          This section is coming soon. We're working hard to bring you this feature.
        </p>
      </div>
    </DashboardLayout>
  );
}
