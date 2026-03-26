'use client';

import EmployeeSidebar from '@/components/EmployeeSidebar';

export default function EmployeeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-bg-light)', fontFamily: "'Inter', sans-serif" }}>
      <EmployeeSidebar />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
