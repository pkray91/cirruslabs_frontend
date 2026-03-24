'use client';

import { motion } from 'framer-motion';
import { Users, ShieldCheck, Bot, Search, Plus, X, Check } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

type EmployeeStatus = 'Compliant' | 'Warning' | 'Needs Review';

type Employee = {
  id: number;
  name: string;
  dept: string;
  email: string;
  compliance: EmployeeStatus;
  complianceScore: number;
};

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Sarah Kim', dept: 'Engineering', email: 'sarah@guardai.com', compliance: 'Compliant', complianceScore: 97 },
  { id: 2, name: 'Marcus Johnson', dept: 'Finance', email: 'marcus@guardai.com', compliance: 'Warning', complianceScore: 72 },
  { id: 3, name: 'Priya Nair', dept: 'HR', email: 'priya@guardai.com', compliance: 'Compliant', complianceScore: 95 },
  { id: 4, name: 'David Chen', dept: 'Legal', email: 'david@guardai.com', compliance: 'Compliant', complianceScore: 88 },
  { id: 5, name: 'Emma Taylor', dept: 'Marketing', email: 'emma@guardai.com', compliance: 'Needs Review', complianceScore: 81 },
];
const EMPLOYEE_STORAGE_KEY = 'admin_employee_dashboard_data_v1';

const STAT_CARD_META = [
  { label: 'Total Employees', icon: Users, color: '#2563eb', bg: '#eff6ff' },
  { label: 'Compliance Score', icon: ShieldCheck, color: '#059669', bg: '#ecfdf5' },
  { label: 'AI Queries Today', icon: Bot, color: '#d97706', bg: '#fffbeb' },
];

const defaultNewEmployee = {
  name: '',
  dept: 'Engineering',
  email: '',
  compliance: 'Compliant' as EmployeeStatus,
  complianceScore: 90,
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState(defaultNewEmployee);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EMPLOYEE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Employee[];
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
              id: Number(item.id),
              name: String(item.name ?? '').trim(),
              dept: String(item.dept ?? '').trim(),
              email: String(item.email ?? '').trim(),
              compliance: item.compliance === 'Warning' || item.compliance === 'Needs Review' ? item.compliance : 'Compliant',
              complianceScore: Math.max(
                0,
                Math.min(
                  100,
                  Number(
                    item.complianceScore ??
                      (item.compliance === 'Compliant' ? 95 : item.compliance === 'Warning' ? 75 : 60)
                  )
                )
              ),
            }))
            .filter((item) => item.id > 0 && item.name && item.dept && item.email);

          if (normalized.length) {
            setEmployees(normalized);
          }
        }
      }
    } catch {
      // Ignore invalid storage content and keep defaults.
    } finally {
      setIsStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    try {
      window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // Ignore localStorage write errors.
    }
  }, [employees, isStorageReady]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.dept.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const complianceScore = useMemo(() => {
    if (!employees.length) return 0;
    const total = employees.reduce((sum, emp) => sum + emp.complianceScore, 0);
    return Math.round(total / employees.length);
  }, [employees]);

  const aiQueriesToday = useMemo(() => 240 + employees.length * 3, [employees.length]);

  const statCards = [
    { ...STAT_CARD_META[0], value: `${employees.length}`, sub: 'Current workforce records' },
    { ...STAT_CARD_META[1], value: `${complianceScore}%`, sub: 'Across all employees' },
    { ...STAT_CARD_META[2], value: `${aiQueriesToday}`, sub: 'Admin and employee requests' },
  ];

  const closeAddModal = () => {
    setIsAddOpen(false);
    setFormError(null);
  };

  const openAddModal = () => {
    setNewEmployee(defaultNewEmployee);
    setFormError(null);
    setIsAddOpen(true);
  };

  const onAddEmployee = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = newEmployee.name.trim();
    const dept = newEmployee.dept.trim();
    const email = newEmployee.email.trim();
    const score = Number(newEmployee.complianceScore);

    if (!name) return setFormError('Employee name is required.');
    if (!dept) return setFormError('Department is required.');
    if (!email || !email.includes('@')) return setFormError('A valid email is required.');
    if (!Number.isFinite(score) || score < 0 || score > 100) return setFormError('Compliance score must be between 0 and 100.');

    const nextId = employees.length ? Math.max(...employees.map((emp) => emp.id)) + 1 : 1;
    setEmployees((prev) => [...prev, { id: nextId, name, dept, email, compliance: newEmployee.compliance, complianceScore: Math.round(score) }]);
    closeAddModal();
  };

  return (
    <div style={{ padding: '32px', flex: 1 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Employee Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Track employee records, compliance status, and AI activity.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={15} /> Add Employee
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
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

      {/* Employee table area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>Employees</h2>
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 320px', maxWidth: '420px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                {['Employee Name', 'Department', 'Email', 'Compliance Score', 'Compliance Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid #f8fafc' }}
                >
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#172554', fontWeight: 700 }}>{emp.name}</td>
                  <td style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>{emp.dept}</td>
                  <td style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>{emp.email}</td>
                  <td style={{ padding: '14px 18px', minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '99px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${emp.complianceScore}%`,
                            height: '100%',
                            borderRadius: '99px',
                            backgroundColor:
                              emp.complianceScore >= 90 ? '#059669' : emp.complianceScore >= 80 ? '#2563eb' : '#d97706',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', minWidth: '34px' }}>{emp.complianceScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: emp.compliance === 'Compliant' ? '#059669' : emp.compliance === 'Warning' ? '#d97706' : '#dc2626',
                        backgroundColor: emp.compliance === 'Compliant' ? '#ecfdf5' : emp.compliance === 'Warning' ? '#fffbeb' : '#fef2f2',
                        padding: '3px 10px',
                        borderRadius: '99px',
                      }}
                    >
                      {emp.compliance}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No employees match your search.</div>
        )}
      </motion.div>

      {/* Add Employee Modal */}
      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onMouseDown={(evt) => {
            if (evt.target === evt.currentTarget) closeAddModal();
          }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', zIndex: 50 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ width: '100%', maxWidth: '480px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#172554', margin: 0 }}>Add Employee</h3>
              <button onClick={closeAddModal} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6 }} aria-label="Close add employee modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onAddEmployee} style={{ padding: '18px 20px' }}>
              {formError && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 12, fontWeight: 700 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Employee Name</span>
                  <input value={newEmployee.name} onChange={(e) => setNewEmployee((s) => ({ ...s, name: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} placeholder="e.g., Alex Johnson" />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Department</span>
                  <input value={newEmployee.dept} onChange={(e) => setNewEmployee((s) => ({ ...s, dept: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} placeholder="e.g., Engineering" />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Email</span>
                  <input value={newEmployee.email} onChange={(e) => setNewEmployee((s) => ({ ...s, email: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} placeholder="name@company.com" />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Compliance Status</span>
                  <select value={newEmployee.compliance} onChange={(e) => setNewEmployee((s) => ({ ...s, compliance: e.target.value as EmployeeStatus }))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', backgroundColor: 'white' }}>
                    <option value="Compliant">Compliant</option>
                    <option value="Warning">Warning</option>
                    <option value="Needs Review">Needs Review</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Compliance Score (0-100)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newEmployee.complianceScore}
                    onChange={(e) => setNewEmployee((s) => ({ ...s, complianceScore: Number(e.target.value) }))}
                    style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeAddModal} style={{ padding: '10px 14px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', color: '#334155', fontWeight: 800, fontSize: 13 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 14px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} /> Add
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
