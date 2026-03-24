'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Eye, Clock, CheckCircle2, AlertCircle, X, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Policy {
  id: number;
  title: string;
  version: string;
  dept: string;
  status: 'Active' | 'Pending Review' | 'Draft';
  updated: string;
  owner: string;
  description?: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string;
}

const DEPARTMENTS = ['All', 'Engineering', 'Legal', 'HR', 'Finance', 'Marketing', 'Operations'];
const STATUSES: Policy['status'][] = ['Active', 'Pending Review', 'Draft'];

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  'Active':         { color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
  'Pending Review': { color: '#d97706', bg: '#fffbeb', icon: Clock        },
  'Draft':          { color: '#475569', bg: '#f1f5f9', icon: AlertCircle  },
};

const STORAGE_KEY = 'admin_company_policies_v1';
const INITIAL_POLICIES: Policy[] = [];

// ── Empty form state ───────────────────────────────────────────────────────
const EMPTY_FORM = { title: '', version: 'v1.0', dept: 'All', status: 'Draft' as Policy['status'], owner: '', description: '' };

// ── Helpers ────────────────────────────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: `1px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    fontSize: '13px',
    color: '#172554',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc',
  };
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const [policies, setPolicies]       = useState<Policy[]>(INITIAL_POLICIES);
  const [showAdd, setShowAdd]         = useState(false);
  const [viewPolicy, setViewPolicy]   = useState<Policy | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [uploadFile, setUploadFile]   = useState<File | null>(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const normalized = (parsed as any[])
        .filter(p => p && typeof p === 'object')
        .map((p) => ({
          id: Number(p.id),
          title: String(p.title ?? ''),
          version: String(p.version ?? ''),
          dept: String(p.dept ?? 'All'),
          status: (p.status === 'Active' || p.status === 'Pending Review' || p.status === 'Draft') ? p.status : 'Draft',
          updated: String(p.updated ?? ''),
          owner: String(p.owner ?? ''),
          description: typeof p.description === 'string' ? p.description : '',
          fileName: typeof p.fileName === 'string' ? p.fileName : undefined,
          fileType: typeof p.fileType === 'string' ? p.fileType : undefined,
          fileDataUrl: typeof p.fileDataUrl === 'string' ? p.fileDataUrl : undefined,
        })) as Policy[];

      setPolicies(normalized.filter(p => p.id > 0 && p.title && p.owner && p.updated));
    } catch {
      // Ignore invalid storage.
    } finally {
      setIsStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    } catch {
      // Ignore quota / write errors.
    }
  }, [policies, isStorageReady]);

  const activeCount = useMemo(() => policies.filter(p => p.status === 'Active').length, [policies]);

  // ── Form helpers ──
  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())   e.title = 'Title is required';
    if (!form.owner.trim())   e.owner = 'Owner is required';
    if (!form.version.trim()) e.version = 'Version is required';
    if (!uploadFile)          e.file = 'Please upload a policy file (PDF/DOC/DOCX)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });

  const handleAdd = async () => {
    if (!validate()) return;
    if (!uploadFile) return;
    setIsSaving(true);

    let fileDataUrl = '';
    try {
      // NOTE: localStorage has limited space; keep files reasonably sized.
      fileDataUrl = await readFileAsDataUrl(uploadFile);
    } catch {
      setIsSaving(false);
      setErrors(e => ({ ...e, file: 'Unable to read file. Please try again.' }));
      return;
    }

    const newPolicy: Policy = {
      id:          Date.now(),
      title:       form.title.trim(),
      version:     form.version.trim(),
      dept:        form.dept,
      status:      form.status,
      updated:     todayLabel(),
      owner:       form.owner.trim(),
      description: form.description.trim(),
      fileName:    uploadFile?.name,
      fileType:    uploadFile?.type || undefined,
      fileDataUrl,
    };
    setPolicies(prev => [newPolicy, ...prev]);
    setShowAdd(false);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setUploadFile(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    setShowAdd(false);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setUploadFile(null);
  };

  // ── Overlay backdrop ──
  const Backdrop = ({ onClick }: { onClick: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClick}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 100, backdropFilter: 'blur(2px)' }}
    />
  );

  return (
    <div style={{ padding: '32px', flex: 1 }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Company Policies</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
            {policies.length} policies — {activeCount} active
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> New Policy
        </motion.button>
      </motion.div>

      {/* ── Summary chips ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {Object.entries({ Active: '#059669', 'Pending Review': '#d97706', Draft: '#475569' }).map(([status, color]) => (
          <span key={status} style={{ fontSize: '13px', fontWeight: 700, color, backgroundColor: `${color}18`, padding: '6px 14px', borderRadius: '99px' }}>
            {policies.filter(p => p.status === status).length} {status}
          </span>
        ))}
      </div>

      {/* ── Policy cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {policies.map((policy, i) => {
          const s = STATUS_STYLE[policy.status];
          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.06, 0.4) }}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
              style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#2563eb" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '3px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <s.icon size={11} /> {policy.status}
                </span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', margin: '0 0 4px' }}>{policy.title}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', fontWeight: 500 }}>
                {policy.version} · {policy.dept} · Owner: {policy.owner}
              </p>
              {policy.fileName && (
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '-6px 0 12px', fontWeight: 500 }}>
                  File: <span style={{ color: '#475569', fontWeight: 700 }}>{policy.fileName}</span>
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Updated {policy.updated}</span>
                <button
                  onClick={() => setViewPolicy(policy)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '12px', fontWeight: 700, padding: 0 }}>
                  <Eye size={13} /> View
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      {policies.length === 0 && (
        <div style={{ marginTop: '18px', padding: '26px', borderRadius: '14px', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
          No policies yet. Click <span style={{ color: '#172554', fontWeight: 800 }}>New Policy</span> to upload your first policy.
        </div>
      )}

      {/* ════════════════════════════════════════════
          ADD POLICY MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAdd && (
          <>
            <Backdrop onClick={handleClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', top: '20px', left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 101,
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '28px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                maxHeight: 'calc(100dvh - 40px)',
                overflowY: 'auto',
              }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#172554', margin: 0 }}>New Policy</h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Fill in the details below</p>
                </div>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '6px' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Policy Name */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Policy Name *</label>
                  <input
                    placeholder="e.g. Remote Work Policy"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    style={inputStyle(!!errors.title)}
                  />
                  {errors.title && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>{errors.title}</p>}
                </div>

                {/* Upload */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Upload Policy File *</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setUploadFile(file);
                        setErrors(err => ({ ...err, file: '' }));
                        if (file && !form.title.trim()) {
                          const base = file.name.replace(/\\.[^/.]+$/, '');
                          setForm(f => ({ ...f, title: base }));
                        }
                      }}
                      style={{
                        flex: '1 1 260px',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${errors.file ? '#ef4444' : '#e2e8f0'}`,
                        fontSize: '13px',
                        color: '#172554',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                    {uploadFile && (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {uploadFile.name}
                        <button
                          type="button"
                          onClick={() => setUploadFile(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                          aria-label="Remove uploaded file"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                  {errors.file && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>{errors.file}</p>}
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0', fontWeight: 500 }}>Accepted formats: PDF, DOC, DOCX</p>
                </div>

                {/* Version + Owner row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Version *</label>
                    <input
                      placeholder="v1.0"
                      value={form.version}
                      onChange={e => set('version', e.target.value)}
                      style={inputStyle(!!errors.version)}
                    />
                    {errors.version && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>{errors.version}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Owner *</label>
                    <input
                      placeholder="e.g. Jane Smith"
                      value={form.owner}
                      onChange={e => set('owner', e.target.value)}
                      style={inputStyle(!!errors.owner)}
                    />
                    {errors.owner && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>{errors.owner}</p>}
                  </div>
                </div>

                {/* Department + Status row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Department</label>
                    <select value={form.dept} onChange={e => set('dept', e.target.value)} style={inputStyle()}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value as Policy['status'])} style={inputStyle()}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Description</label>
                  <textarea
                    placeholder="Brief summary of what this policy covers..."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={3}
                    style={{ ...inputStyle(), resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end', position: 'sticky', bottom: '-28px', backgroundColor: 'white', paddingTop: '12px', paddingBottom: '4px' }}>
                <button onClick={handleClose}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.97 }}
                  onClick={handleAdd}
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSaving ? '#334155' : '#172554',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.9 : 1,
                  }}
                >
                  <Save size={14} /> Save Policy
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          VIEW POLICY MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewPolicy && (
          <>
            <Backdrop onClick={() => setViewPolicy(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', top: '20px', left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 101,
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '28px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                maxHeight: 'calc(100dvh - 40px)',
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="#2563eb" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#172554', margin: 0 }}>{viewPolicy.title}</h2>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{viewPolicy.version} · {viewPolicy.dept}</p>
                  </div>
                </div>
                <button onClick={() => setViewPolicy(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '6px' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Status badge */}
              {(() => {
                const s = STATUS_STYLE[viewPolicy.status];
                return (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '4px 12px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
                    <s.icon size={12} /> {viewPolicy.status}
                  </span>
                );
              })()}

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'Owner',       value: viewPolicy.owner },
                  { label: 'Department',  value: viewPolicy.dept },
                  { label: 'Version',     value: viewPolicy.version },
                  { label: 'Last Updated',value: viewPolicy.updated },
                  { label: 'File',        value: viewPolicy.fileName || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontSize: '13px', color: '#172554', fontWeight: 700, margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {viewPolicy.description && (
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{viewPolicy.description}</p>
                </div>
              )}

              {/* Policy content */}
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Policy Content
                </p>
                {viewPolicy.fileDataUrl ? (
                  viewPolicy.fileType === 'application/pdf' || (viewPolicy.fileName?.toLowerCase().endsWith('.pdf')) ? (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <iframe
                        title="Policy PDF Preview"
                        src={viewPolicy.fileDataUrl}
                        style={{ width: '100%', height: '420px', border: 'none', display: 'block' }}
                      />
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px' }}>
                      <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                        Preview isn’t available for this file type. You can open/download it instead.
                      </p>
                      <a
                        href={viewPolicy.fileDataUrl}
                        download={viewPolicy.fileName || 'policy'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#2563eb', textDecoration: 'none' }}
                      >
                        <FileText size={16} /> Open / Download
                      </a>
                    </div>
                  )
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                    No uploaded policy content found.
                  </div>
                )}
              </div>

              {/* Close */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewPolicy(null)}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}