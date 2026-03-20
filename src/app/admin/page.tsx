'use client';

import { motion } from 'framer-motion';
import { Users, ShieldCheck, FileText, Bot, TrendingUp, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STAT_CARDS = [
  { label: 'Total Employees',      value: '124',   sub: '+3 this month',  icon: Users,       color: '#2563eb', bg: '#eff6ff' },
  { label: 'Policies Active',      value: '18',    sub: '2 pending review',icon: FileText,   color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Compliance Score',     value: '94%',   sub: 'Above threshold', icon: ShieldCheck, color: '#059669', bg: '#ecfdf5' },
  { label: 'AI Queries Today',     value: '341',   sub: 'Across all users', icon: Bot,        color: '#d97706', bg: '#fffbeb' },
];

const RECENT_ACTIVITY = [
  { icon: CheckCircle2, color: '#059669', text: 'Policy "Data Privacy v2.1" approved', time: '2 min ago' },
  { icon: AlertTriangle,color: '#d97706', text: 'Compliance gap detected — Finance dept',time: '18 min ago' },
  { icon: Users,        color: '#2563eb', text: 'New employee onboarded: Sarah K.',    time: '1 hr ago' },
  { icon: ShieldCheck,  color: '#7c3aed', text: 'Quarterly audit report generated',    time: '3 hrs ago' },
  { icon: Activity,     color: '#0891b2', text: 'AI Assistant resolved 12 queries',    time: '5 hrs ago' },
];

const COMPLIANCE_DEPTS = [
  { dept: 'Engineering',  pct: 97, color: '#059669' },
  { dept: 'Finance',      pct: 72, color: '#d97706' },
  { dept: 'HR',           pct: 95, color: '#059669' },
  { dept: 'Legal',        pct: 88, color: '#2563eb' },
  { dept: 'Marketing',    pct: 81, color: '#2563eb' },
];

export default function AdminDashboard() {
  return (
    <div style={{ padding: '32px', flex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Welcome back, Admin — here's your overview.</p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {STAT_CARDS.map((card, i) => (
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
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={14} color={item.color} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.4 }}>{item.text}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compliance by Dept */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          style={{ backgroundColor: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #f1f5f9' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <TrendingUp size={16} color="#2563eb" />
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', margin: 0 }}>Compliance by Department</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {COMPLIANCE_DEPTS.map((d) => (
              <div key={d.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{d.dept}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: d.color }}>{d.pct}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '99px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: '99px', backgroundColor: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
