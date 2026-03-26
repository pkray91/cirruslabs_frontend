'use client';

import { motion } from 'framer-motion';
import { Users, Search, Plus, Mail, Phone, Check, X, MoreHorizontal, RefreshCw, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

// Use environment variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/api/v1';

const EMPLOYEES = [
  { id: 1, name: 'Sarah Kim',       role: 'Software Engineer', dept: 'Engineering', email: 'sarah@guardai.com',   status: 'Active',   compliance: 97 },
  { id: 2, name: 'Marcus Johnson',  role: 'Financial Analyst', dept: 'Finance',     email: 'marcus@guardai.com',  status: 'Active',   compliance: 72 },
  { id: 3, name: 'Priya Nair',      role: 'HR Manager',        dept: 'HR',          email: 'priya@guardai.com',   status: 'Active',   compliance: 95 },
  { id: 4, name: 'David Chen',      role: 'Legal Counsel',     dept: 'Legal',       email: 'david@guardai.com',   status: 'Active',   compliance: 88 },
  { id: 5, name: 'Emma Taylor',     role: 'Marketing Lead',    dept: 'Marketing',   email: 'emma@guardai.com',    status: 'On Leave', compliance: 81 },
  { id: 6, name: 'James Parker',    role: 'DevSecOps',         dept: 'Engineering', email: 'james@guardai.com',   status: 'Active',   compliance: 99 },
  { id: 7, name: 'Linda Ortiz',     role: 'Compliance Officer',dept: 'Legal',       email: 'linda@guardai.com',   status: 'Active',   compliance: 100},
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#eff6ff', Finance: '#fffbeb', HR: '#f0fdf4', Legal: '#f5f3ff', Marketing: '#fdf2f8',
};
const DEPT_TEXT: Record<string, string> = {
  Engineering: '#2563eb', Finance: '#d97706', HR: '#059669', Legal: '#7c3aed', Marketing: '#db2777',
};

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load cached employee data on mount
  useEffect(() => {
    const cachedEmployees = localStorage.getItem('guardai_employees_cache');
    const cachedSyncTime = localStorage.getItem('guardai_employees_sync_time');
    
    if (cachedEmployees) {
      try {
        const parsedEmployees = JSON.parse(cachedEmployees);
        if (parsedEmployees.length > 0) {
          setEmployees(parsedEmployees);
          setLastSyncTime(cachedSyncTime);
        }
      } catch (e) {
        console.error('Failed to load cached employees:', e);
      }
    }
  }, []);

  const handleFetchEmployeeData = async () => {
    setLoading(true);
    setFetchStatus({ type: null, message: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/employees/sync-from-s3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch employee data');
      }
      
      const result = await response.json();
      
      // Refresh employee list
      const employeesResponse = await fetch(`${API_BASE_URL}${API_PREFIX}/employees`);
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        const fetchedEmployees = employeesData.employees || EMPLOYEES;
        
        // Cache the employee data
        setEmployees(fetchedEmployees);
        const syncTime = new Date().toISOString();
        setLastSyncTime(syncTime);
        localStorage.setItem('guardai_employees_cache', JSON.stringify(fetchedEmployees));
        localStorage.setItem('guardai_employees_sync_time', syncTime);
        
        // Also cache for dashboard
        localStorage.setItem('guardai_employees_for_dashboard', JSON.stringify({
          employees: fetchedEmployees,
          syncTime: syncTime
        }));
        
        // Dispatch custom event to notify dashboard
        window.dispatchEvent(new CustomEvent('employeesUpdated', { 
          detail: { employees: fetchedEmployees, syncTime } 
        }));
      }
      
      setFetchStatus({ 
        type: 'success', 
        message: `Successfully synced ${result.employees_synced || 0} employees and ${result.acknowledgments_synced || 0} acknowledgments`
      });
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
      setFetchStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to sync employee data from S3'
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Employees</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{employees.length} total employees across {new Set(employees.map(e => e.dept)).size} departments</p>
        </div>
        <motion.button 
          whileHover={{ scale: loading ? 1 : 1.03 }} 
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={handleFetchEmployeeData}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 18px', 
            backgroundColor: loading ? '#94a3b8' : '#172554', 
            color: 'white', border: 'none', borderRadius: '10px', 
            fontSize: '13px', fontWeight: 700, 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
          {loading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={15} />
              </motion.div>
              Syncing...
            </>
          ) : (
            <>
              <Download size={15} /> Fetch Employee Data
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Status Message */}
      {fetchStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            marginBottom: '16px',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: fetchStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${fetchStatus.type === 'success' ? '#059669' : '#dc2626'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {fetchStatus.type === 'success' ? (
            <Check size={16} color="#059669" />
          ) : (
            <X size={16} color="#dc2626" />
          )}
          <span style={{ 
            fontSize: '13px', 
            fontWeight: 600, 
            color: fetchStatus.type === 'success' ? '#059669' : '#dc2626' 
          }}>
            {fetchStatus.message}
          </span>
        </motion.div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '340px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
        <input
          placeholder="Search by name or department…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
              {['Employee', 'Department', 'Email', 'Compliance', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => (
              <motion.tr key={emp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#172554', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{emp.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#172554', margin: 0 }}>{emp.name}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{emp.role}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: DEPT_TEXT[emp.dept] || '#475569', backgroundColor: DEPT_COLORS[emp.dept] || '#f8fafc', padding: '3px 10px', borderRadius: '99px' }}>{emp.dept}</span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{emp.email}</span>
                </td>
                <td style={{ padding: '14px 18px', minWidth: '120px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '5px', borderRadius: '99px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ width: `${emp.compliance}%`, height: '100%', borderRadius: '99px', backgroundColor: emp.compliance >= 90 ? '#059669' : emp.compliance >= 80 ? '#2563eb' : '#d97706' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', minWidth: '30px' }}>{emp.compliance}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: emp.status === 'Active' ? '#059669' : '#d97706', backgroundColor: emp.status === 'Active' ? '#ecfdf5' : '#fffbeb', padding: '3px 10px', borderRadius: '99px' }}>
                    {emp.status}
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No employees match your search.</div>
        )}
      </motion.div>
    </div>
  );
}
