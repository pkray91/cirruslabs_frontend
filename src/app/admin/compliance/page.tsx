'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileSearch, ArrowRight, Download, Activity } from 'lucide-react';

const RECENT_SCANS = [
  { id: 1, name: 'Q1 AI System Audit',       target: 'All Infrastructure', status: 'Passed',     issues: 0, date: 'Today, 09:41 AM' },
  { id: 2, name: 'Data Pipeline Validation', target: 'Finance Data Lake',  status: 'Warning',    issues: 2, date: 'Yesterday' },
  { id: 3, name: 'Vendor Access Review',     target: 'Third-Party APIs',   status: 'Failed',     issues: 7, date: 'Mar 17, 2026' },
  { id: 4, name: 'Code Architecture Check',  target: 'Main Repository',    status: 'Passed',     issues: 0, date: 'Mar 15, 2026' },
  { id: 5, name: 'Employee Access Audit',    target: 'IAM Roles',          status: 'Passed',     issues: 0, date: 'Mar 10, 2026' },
];

const SCAN_STATS = [
  { label: 'Total Scans',    value: '1,248', icon: Activity,    color: '#2563eb' },
  { label: 'Clean Passes',   value: '94%',   icon: ShieldCheck, color: '#059669' },
  { label: 'Active Alerts',  value: '3',     icon: ShieldAlert, color: '#dc2626' },
];

export default function CompliancePage() {
  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Compliance Check</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>System validations, threat detection, and audit reports.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <FileSearch size={15} /> Run New Scan
        </motion.button>
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {SCAN_STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#172554', margin: 0, lineHeight: 1.1 }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        
        {/* Recent Scans Table */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>Recent System Scans</h2>
            <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {['Scan Name', 'Target', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_SCANS.map(scan => (
                <tr key={scan.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#172554' }}>{scan.name}</td>
                  <td style={{ padding: '16px 20px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>{scan.target}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: scan.status === 'Passed' ? '#059669' : scan.status === 'Warning' ? '#d97706' : '#dc2626',
                      backgroundColor: scan.status === 'Passed' ? '#ecfdf5' : scan.status === 'Warning' ? '#fffbeb' : '#fef2f2'
                    }}>
                      {scan.status} {scan.issues > 0 && `(${scan.issues} issues)`}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{scan.date}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Download Report">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Action Required Panel */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #fecaca', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#dc2626" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', margin: 0 }}>Action Required</h2>
          </div>
          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#fffbfa', border: '1px solid #fee2e2', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b', margin: '0 0 6px' }}>Vendor Access Failure</h3>
              <p style={{ fontSize: '12px', color: '#b91c1c', margin: '0 0 12px', lineHeight: 1.4 }}>7 unauthorized access attempts blocked from unverified IP ranges targeting the external API gateway.</p>
              <button style={{ width: '100%', padding: '8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Review Logs
              </button>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>Unencrypted Data Spool</h3>
              <p style={{ fontSize: '12px', color: '#b45309', margin: '0 0 12px', lineHeight: 1.4 }}>Temporary cache on Node 4 is missing encryption-at-rest configuration.</p>
              <button style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', color: '#d97706', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                View Details
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
