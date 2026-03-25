'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, Bot, Search, Plus, X, Check, Upload, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type DragEvent } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type EmployeeStatus = 'Compliant' | 'Warning' | 'Needs Review';

type Employee = {
  id: number;
  name: string;
  dept: string;
  email: string;
  compliance: EmployeeStatus;
  complianceScore: number;
};

// ── Constants ──────────────────────────────────────────────────────────────
const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Sarah Kim',       dept: 'Engineering', email: 'sarah@guardai.com',  compliance: 'Compliant',    complianceScore: 97 },
  { id: 2, name: 'Marcus Johnson',  dept: 'Finance',     email: 'marcus@guardai.com', compliance: 'Warning',       complianceScore: 72 },
  { id: 3, name: 'Priya Nair',      dept: 'HR',          email: 'priya@guardai.com',  compliance: 'Compliant',    complianceScore: 95 },
  { id: 4, name: 'David Chen',      dept: 'Legal',       email: 'david@guardai.com',  compliance: 'Compliant',    complianceScore: 88 },
  { id: 5, name: 'Emma Taylor',     dept: 'Marketing',   email: 'emma@guardai.com',   compliance: 'Needs Review', complianceScore: 81 },
];

const EMPLOYEE_STORAGE_KEY = 'admin_employee_dashboard_data_v1';

const STAT_CARD_META = [
  { label: 'Total Employees', icon: Users,       color: '#2563eb', bg: '#eff6ff' },
  { label: 'Compliance Score', icon: ShieldCheck, color: '#059669', bg: '#ecfdf5' },
  { label: 'AI Queries Today', icon: Bot,         color: '#d97706', bg: '#fffbeb' },
];

const defaultNewEmployee = {
  name: '',
  dept: 'Engineering',
  email: '',
  compliance: 'Compliant' as EmployeeStatus,
  complianceScore: 90,
};

// ── Helpers ────────────────────────────────────────────────────────────────
function normalizeStatus(raw: unknown): EmployeeStatus {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'warning') return 'Warning';
  if (s === 'needs review' || s === 'needs_review') return 'Needs Review';
  return 'Compliant';
}

function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

/**
 * Parse rows from SheetJS worksheet into Employee[].
 * Accepts flexible column names (case-insensitive, with aliases).
 */
function rowsToEmployees(rows: Record<string, unknown>[], startId: number): Employee[] {
  return rows
    .map((row, i) => {
      const key = (aliases: string[]) => {
        const k = Object.keys(row).find(k => aliases.includes(k.trim().toLowerCase()));
        return k ? String(row[k] ?? '').trim() : '';
      };

      const name  = key(['name', 'employee name', 'full name', 'employee']);
      const dept  = key(['dept', 'department', 'team', 'division']);
      const email = key(['email', 'email address', 'mail']);
      const complianceRaw   = key(['compliance', 'compliance status', 'status']);
      const scoreRaw        = key(['compliancescore', 'compliance score', 'score', 'compliance_score']);

      if (!name || !email) return null;

      const complianceScore = scoreRaw
        ? clamp(parseFloat(scoreRaw))
        : complianceRaw.toLowerCase() === 'compliant' ? 95
        : complianceRaw.toLowerCase() === 'warning'   ? 72
        : 60;

      return {
        id: startId + i,
        name,
        dept:             dept || 'General',
        email,
        compliance:       normalizeStatus(complianceRaw),
        complianceScore,
      } satisfies Employee;
    })
    .filter((e): e is Employee => e !== null);
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [employees, setEmployees]     = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [search, setSearch]           = useState('');
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState(defaultNewEmployee);

  // Upload modal state
  const [dragOver, setDragOver]       = useState(false);
  const [uploadFile, setUploadFile]   = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<Employee[] | null>(null);
  const [uploading, setUploading]     = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // ── LocalStorage ──
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EMPLOYEE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Employee[];
        if (Array.isArray(parsed) && parsed.length) setEmployees(parsed);
      }
    } catch { /* ignore */ } finally { setIsStorageReady(true); }
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    try { window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees)); }
    catch { /* ignore */ }
  }, [employees, isStorageReady]);

  // ── Derived stats ──
  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.dept.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const complianceScore = useMemo(() => {
    if (!employees.length) return 0;
    return Math.round(employees.reduce((s, e) => s + e.complianceScore, 0) / employees.length);
  }, [employees]);

  const aiQueriesToday = useMemo(() => 240 + employees.length * 3, [employees.length]);

  const statCards = [
    { ...STAT_CARD_META[0], value: `${employees.length}`,   sub: 'Current workforce records' },
    { ...STAT_CARD_META[1], value: `${complianceScore}%`,   sub: 'Across all employees' },
    { ...STAT_CARD_META[2], value: `${aiQueriesToday}`,     sub: 'Admin and employee requests' },
  ];

  // ── Add employee modal ──
  const closeAddModal = () => { setIsAddOpen(false); setFormError(null); };
  const openAddModal  = () => { setNewEmployee(defaultNewEmployee); setFormError(null); setIsAddOpen(true); };

  const onAddEmployee = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name  = newEmployee.name.trim();
    const dept  = newEmployee.dept.trim();
    const email = newEmployee.email.trim();
    const score = Number(newEmployee.complianceScore);
    if (!name)  return setFormError('Employee name is required.');
    if (!dept)  return setFormError('Department is required.');
    if (!email || !email.includes('@')) return setFormError('A valid email is required.');
    if (!Number.isFinite(score) || score < 0 || score > 100) return setFormError('Compliance score must be 0–100.');
    const nextId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees(prev => [...prev, { id: nextId, name, dept, email, compliance: newEmployee.compliance, complianceScore: Math.round(score) }]);
    closeAddModal();
  };

  // ── Upload modal helpers ──
  const resetUpload = () => {
    setUploadFile(null);
    setUploadError(null);
    setUploadPreview(null);
    setUploading(false);
    setDragOver(false);
  };

  const closeUpload = () => { setIsUploadOpen(false); resetUpload(); };

  const parseExcel = async (file: File) => {
    setUploadError(null);
    setUploadPreview(null);
    setUploading(true);

    try {
      // Dynamically import SheetJS so it doesn't bloat the initial bundle
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows.length) {
        setUploadError('The sheet appears to be empty. Please check your file.');
        setUploading(false);
        return;
      }

      const nextId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
      const parsed = rowsToEmployees(rows, nextId);

      if (!parsed.length) {
        setUploadError('Could not read employee rows. Make sure the sheet has columns: Name, Dept, Email, Compliance, ComplianceScore.');
        setUploading(false);
        return;
      }

      setUploadPreview(parsed);
    } catch (err) {
      setUploadError('Failed to parse the file. Please upload a valid .xlsx file.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('Only Excel files (.xlsx / .xls) are supported.');
      return;
    }
    setUploadFile(file);
    parseExcel(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmUpload = () => {
    if (!uploadPreview) return;
    setEmployees(prev => [...prev, ...uploadPreview]);
    closeUpload();
  };

  // ── Shared input style ──
  const inputSt: React.CSSProperties = { padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px', flex: 1 }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Employee Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Track employee records, compliance status, and AI activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsUploadOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <Upload size={15} /> Upload Excel
          </motion.button>
          
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', transition: 'box-shadow 0.2s, transform 0.2s' }}>
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

      {/* ── Employee table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>Employees</h2>
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 320px', maxWidth: '420px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input placeholder="Search by name, email, or department..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                {['Employee Name', 'Department', 'Email', 'Compliance Score', 'Compliance Status'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, i) => (
                <motion.tr key={emp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#172554', fontWeight: 700 }}>{emp.name}</td>
                  <td style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>{emp.dept}</td>
                  <td style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>{emp.email}</td>
                  <td style={{ padding: '14px 18px', minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '99px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${emp.complianceScore}%`, height: '100%', borderRadius: '99px', backgroundColor: emp.complianceScore >= 90 ? '#059669' : emp.complianceScore >= 80 ? '#2563eb' : '#d97706' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', minWidth: '34px' }}>{emp.complianceScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: emp.compliance === 'Compliant' ? '#059669' : emp.compliance === 'Warning' ? '#d97706' : '#dc2626', backgroundColor: emp.compliance === 'Compliant' ? '#ecfdf5' : emp.compliance === 'Warning' ? '#fffbeb' : '#fef2f2', padding: '3px 10px', borderRadius: '99px' }}>
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

      {/* ════════════════════════════════════════════
          UPLOAD EXCEL MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {isUploadOpen && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeUpload}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.55)', zIndex: 50, backdropFilter: 'blur(2px)' }} />

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 51, width: '100%', maxWidth: '520px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

              {/* Modal header */}
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileSpreadsheet size={18} color="#059669" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#172554', margin: 0 }}>Upload Employee Sheet</h3>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '1px 0 0', fontWeight: 500 }}>Accepts .xlsx / .xls files</p>
                  </div>
                </div>
                <button onClick={closeUpload} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><X size={18} /></button>
              </div>

              <div style={{ padding: '22px' }}>

                {/* Drag & drop zone */}
                {!uploadPreview && (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? '#2563eb' : uploadFile ? '#059669' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: dragOver ? '#eff6ff' : uploadFile ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

                    {uploading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Upload size={32} color="#2563eb" />
                        </motion.div>
                        <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: 700, margin: 0 }}>Parsing file…</p>
                      </div>
                    ) : uploadFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={32} color="#059669" />
                        <p style={{ fontSize: '13px', color: '#059669', fontWeight: 700, margin: 0 }}>{uploadFile.name}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Upload size={32} color="#94a3b8" />
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#475569', margin: 0 }}>
                          Drag & drop your Excel file here
                        </p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>or <span style={{ color: '#2563eb', fontWeight: 700 }}>click to browse</span></p>
                        <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>Supported: .xlsx, .xls</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Column guide */}
                {!uploadPreview && !uploadFile && (
                  <div style={{ marginTop: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expected columns</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {['Name', 'Dept', 'Email', 'Compliance', 'ComplianceScore'].map(col => (
                        <span key={col} style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 9px', borderRadius: '99px' }}>{col}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {uploadError && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600, margin: 0 }}>{uploadError}</p>
                  </motion.div>
                )}

                {/* Preview table */}
                {uploadPreview && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#172554', margin: 0 }}>
                        Preview — {uploadPreview.length} employee{uploadPreview.length !== 1 ? 's' : ''} found
                      </p>
                      <button onClick={resetUpload} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#2563eb', fontWeight: 700, padding: 0 }}>
                        Change file
                      </button>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            {['Name', 'Dept', 'Email', 'Status', 'Score'].map(h => (
                              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800, color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreview.map(emp => (
                            <tr key={emp.id} style={{ borderTop: '1px solid #f8fafc' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#172554' }}>{emp.name}</td>
                              <td style={{ padding: '8px 12px', color: '#475569' }}>{emp.dept}</td>
                              <td style={{ padding: '8px 12px', color: '#475569' }}>{emp.email}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: emp.compliance === 'Compliant' ? '#059669' : emp.compliance === 'Warning' ? '#d97706' : '#dc2626', backgroundColor: emp.compliance === 'Compliant' ? '#ecfdf5' : emp.compliance === 'Warning' ? '#fffbeb' : '#fef2f2', padding: '2px 7px', borderRadius: '99px' }}>
                                  {emp.compliance}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>{emp.complianceScore}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
                  <button onClick={closeUpload}
                    style={{ padding: '10px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  {uploadPreview && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleConfirmUpload}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '9px', border: 'none', background: '#172554', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      <Check size={14} /> Import {uploadPreview.length} Employees
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          ADD EMPLOYEE MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeAddModal}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.55)', zIndex: 50, backdropFilter: 'blur(2px)' }} />

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 51, width: '100%', maxWidth: '480px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>

              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#172554', margin: 0 }}>Add Employee</h3>
                <button onClick={closeAddModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6 }}><X size={18} /></button>
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
                    <input value={newEmployee.name} onChange={e => setNewEmployee(s => ({ ...s, name: e.target.value }))} style={inputSt} placeholder="e.g., Alex Johnson" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Department</span>
                    <input value={newEmployee.dept} onChange={e => setNewEmployee(s => ({ ...s, dept: e.target.value }))} style={inputSt} placeholder="e.g., Engineering" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Email</span>
                    <input value={newEmployee.email} onChange={e => setNewEmployee(s => ({ ...s, email: e.target.value }))} style={inputSt} placeholder="name@company.com" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Compliance Status</span>
                    <select value={newEmployee.compliance} onChange={e => setNewEmployee(s => ({ ...s, compliance: e.target.value as EmployeeStatus }))} style={inputSt}>
                      <option value="Compliant">Compliant</option>
                      <option value="Warning">Warning</option>
                      <option value="Needs Review">Needs Review</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Compliance Score (0–100)</span>
                    <input type="number" min={0} max={100} value={newEmployee.complianceScore} onChange={e => setNewEmployee(s => ({ ...s, complianceScore: Number(e.target.value) }))} style={inputSt} />
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={closeAddModal} style={{ padding: '10px 14px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', color: '#334155', fontWeight: 800, fontSize: 13 }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 14px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} /> Add
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}