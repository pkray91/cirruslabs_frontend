'use client';

import { motion } from 'framer-motion';
import { Users, ShieldCheck, FileText, Bot, TrendingUp, Activity, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDashboardMetrics, APIError } from '@/lib/api';
import type { DashboardMetrics } from '@/types/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [avgCompliance, setAvgCompliance] = useState<number>(0);

  useEffect(() => {
    loadMetrics();
    loadCachedEmployeeData();
    
    // Listen for storage changes (when employees page updates cache in different tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'guardai_employees_for_dashboard') {
        loadCachedEmployeeData();
        loadMetrics(); // Refresh dashboard metrics
      }
    };
    
    // Listen for custom event (when employees page updates cache in same tab)
    const handleEmployeesUpdate = () => {
      loadCachedEmployeeData();
      loadMetrics(); // Refresh dashboard metrics
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('employeesUpdated', handleEmployeesUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('employeesUpdated', handleEmployeesUpdate);
    };
  }, []);

  const loadCachedEmployeeData = () => {
    try {
      const cachedData = localStorage.getItem('guardai_employees_for_dashboard');
      if (cachedData) {
        const { employees } = JSON.parse(cachedData);
        if (employees && employees.length > 0) {
          setEmployeeCount(employees.length);
          
          // Calculate average compliance
          const totalCompliance = employees.reduce((sum: number, emp: any) => 
            sum + (emp.compliance || 0), 0
          );
          const avg = Math.round(totalCompliance / employees.length);
          setAvgCompliance(avg);
        }
      }
    } catch (e) {
      console.error('Failed to load cached employee data:', e);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  // Use cached employee data if available, otherwise use API data
  const displayEmployeeCount = employeeCount > 0 ? employeeCount : (metrics?.total_employees || 0);
  const displayCompliance = avgCompliance > 0 ? avgCompliance : (metrics?.compliance_score || 0);

  const statCards = metrics ? [
    { label: 'Total Employees', value: displayEmployeeCount.toString(), sub: employeeCount > 0 ? 'From S3 sync' : 'Active users', icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Policies Active', value: metrics.total_policies.toString(), sub: 'Documents indexed', icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Compliance Score', value: `${displayCompliance}%`, sub: employeeCount > 0 ? 'Real employee avg' : 'Average readiness', icon: ShieldCheck, color: '#059669', bg: '#ecfdf5' },
    { label: 'AI Queries Today', value: metrics.ai_queries_today.toString(), sub: 'Across all users', icon: Bot, color: '#d97706', bg: '#fffbeb' },
  ] : [];

  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Welcome back, Admin — here's your overview.</p>
      </motion.div>

      {/* Error State */}
      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader className="animate-spin" size={32} color="#2563eb" />
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && metrics && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                style={{
                  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
                  border: '1px solid #f1f5f9', cursor: 'default',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#172554', margin: 0, lineHeight: 1 }}>{card.value}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>{card.sub}</p>
                  </div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ backgroundColor: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #f1f5f9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Activity size={16} color="#2563eb" />
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', margin: 0 }}>Recent Activity</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {metrics.recent_activity.length > 0 ? (
                  metrics.recent_activity.map((item) => (
                    <div key={item.timestamp} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Activity size={14} color="#2563eb" />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.4 }}>{item.message}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                          {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No recent activity</p>
                )}
              </div>
            </motion.div>

            {/* Compliance by Dept */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
              style={{ backgroundColor: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #f1f5f9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="#2563eb" />
                  <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', margin: 0 }}>Compliance by Department</h2>
                </div>
                {metrics.compliance_by_department.length > 5 && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Top 5 of {metrics.compliance_by_department.length}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {metrics.compliance_by_department.length > 0 ? (
                  metrics.compliance_by_department.slice(0, 5).map((d) => {
                    const getComplianceColor = (pct: number) => {
                      if (pct >= 90) return '#059669';
                      if (pct >= 70) return '#2563eb';
                      return '#d97706';
                    };
                    const color = getComplianceColor(d.compliance_percentage);
                    return (
                      <div key={d.department}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{d.department}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color }}>{d.compliance_percentage}%</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '99px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${d.compliance_percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: '99px', backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No compliance data available</p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
