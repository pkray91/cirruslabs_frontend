'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const POLICIES = [
  { id: 1, title: 'AI Acceptable Use Policy',       version: 'v3.2', dept: 'All',         status: 'Active',         updated: 'Mar 15, 2026', owner: 'Linda Ortiz' },
  { id: 2, title: 'Data Privacy & Handling',        version: 'v2.1', dept: 'Engineering', status: 'Active',         updated: 'Feb 28, 2026', owner: 'David Chen' },
  { id: 3, title: 'Third-Party Vendor Compliance',  version: 'v1.4', dept: 'Legal',       status: 'Pending Review', updated: 'Mar 18, 2026', owner: 'David Chen' },
  { id: 4, title: 'Employee Code of Conduct',       version: 'v5.0', dept: 'HR',          status: 'Active',         updated: 'Jan 10, 2026', owner: 'Priya Nair' },
  { id: 5, title: 'Incident Response Protocol',     version: 'v2.0', dept: 'Engineering', status: 'Active',         updated: 'Mar 01, 2026', owner: 'Sarah Kim' },
  { id: 6, title: 'Financial Controls Standard',    version: 'v1.1', dept: 'Finance',     status: 'Draft',          updated: 'Mar 19, 2026', owner: 'Marcus Johnson'},
  { id: 7, title: 'GDPR Compliance Framework',      version: 'v4.3', dept: 'All',         status: 'Active',         updated: 'Dec 20, 2025', owner: 'Linda Ortiz' },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  'Active':         { color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
  'Pending Review': { color: '#d97706', bg: '#fffbeb', icon: Clock        },
  'Draft':          { color: '#475569', bg: '#f1f5f9', icon: AlertCircle  },
};

export default function PoliciesPage() {
  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Company Policies</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{POLICIES.length} policies — {POLICIES.filter(p => p.status === 'Active').length} active</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> New Policy
        </motion.button>
      </motion.div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {Object.entries({ Active: '#059669', 'Pending Review': '#d97706', Draft: '#475569' }).map(([status, color]) => (
          <span key={status} style={{ fontSize: '13px', fontWeight: 700, color, backgroundColor: `${color}18`, padding: '6px 14px', borderRadius: '99px' }}>
            {POLICIES.filter(p => p.status === status).length} {status}
          </span>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {POLICIES.map((policy, i) => {
          const s = STATUS_STYLE[policy.status];
          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Updated {policy.updated}</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '12px', fontWeight: 700, padding: 0 }}>
                  <Eye size={13} /> View
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
