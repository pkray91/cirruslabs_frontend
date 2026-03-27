import { Suspense } from 'react';
import { EmployeeDashboardContent } from '@/components/EmployeeDashboardContent';

// Prevent static prerendering since we use useSearchParams
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div style={{ padding: '32px', flex: 1, backgroundColor: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  );
}

export default function EmployeePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeDashboardContent />
    </Suspense>
  );
}
