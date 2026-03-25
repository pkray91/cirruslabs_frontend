'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  FileSearch,
  ArrowRight,
  Download,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ClipboardList,
  Target,
  Layers,
  Lightbulb,
  Building2,
  Users,
  Server,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FindingLevel, Iso27001AuditReport } from './iso27001Report';
import { generateMockIso27001Report } from './iso27001Report';

type PolicyStatus = 'Active' | 'Pending Review' | 'Draft';

type StoredPolicy = {
  id: number;
  title: string;
  dept: string;
  status: PolicyStatus;
  updated: string;
  fileName?: string;
  fileDataUrl?: string;
};

const POLICY_STORAGE_KEY = 'admin_company_policies_v1';
const LOADING_MS_MIN = 1800;
const LOADING_MS_MAX = 2600;

function levelColors(level: FindingLevel): { fg: string; bg: string; Icon: typeof CheckCircle2 } {
  if (level === 'compliant') return { fg: '#059669', bg: '#ecfdf5', Icon: CheckCircle2 };
  if (level === 'partial') return { fg: '#d97706', bg: '#fffbeb', Icon: AlertTriangle };
  return { fg: '#dc2626', bg: '#fef2f2', Icon: XCircle };
}

function categoryIcon(code: string) {
  if (code === 'A.5') return Building2;
  if (code === 'A.6') return Users;
  if (code === 'A.7') return ShieldCheck;
  return Server;
}

function loadPoliciesFromStorage(): StoredPolicy[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(POLICY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const normalized = (parsed as unknown[])
      .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
      .map((p) => {
        const id = Number((p as Record<string, unknown>).id);
        const title = String((p as Record<string, unknown>).title ?? '');
        const dept = String((p as Record<string, unknown>).dept ?? 'All');
        const statusRaw = (p as Record<string, unknown>).status;
        const updated = String((p as Record<string, unknown>).updated ?? '');
        const fileNameRaw = (p as Record<string, unknown>).fileName;
        const fileDataUrlRaw = (p as Record<string, unknown>).fileDataUrl;

        const status: PolicyStatus =
          statusRaw === 'Active' || statusRaw === 'Pending Review' || statusRaw === 'Draft'
            ? (statusRaw as PolicyStatus)
            : 'Draft';

        return {
          id,
          title,
          dept,
          status,
          updated,
          fileName: typeof fileNameRaw === 'string' ? fileNameRaw : undefined,
          fileDataUrl: typeof fileDataUrlRaw === 'string' ? fileDataUrlRaw : undefined,
        };
      });
    return normalized.filter((p) => p.id > 0 && p.title && p.updated);
  } catch {
    return [];
  }
}

export default function CompliancePage() {
  const [policies, setPolicies] = useState<StoredPolicy[]>(() => loadPoliciesFromStorage());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [report, setReport] = useState<Iso27001AuditReport | null>(null);

  const refreshPolicies = useCallback(() => {
    setPolicies(loadPoliciesFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === POLICY_STORAGE_KEY) refreshPolicies();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshPolicies);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshPolicies);
    };
  }, [refreshPolicies]);

  const togglePolicy = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedPolicies = useMemo(
    () => policies.filter((p) => selectedIds.has(p.id)),
    [policies, selectedIds]
  );

  const runComplianceCheck = () => {
    if (selectedPolicies.length === 0) return;
    setIsRunningCheck(true);
    setReport(null);
    const delay = LOADING_MS_MIN + Math.random() * (LOADING_MS_MAX - LOADING_MS_MIN);
    window.setTimeout(() => {
      const mock = generateMockIso27001Report(
        selectedPolicies.map((p) => ({ id: p.id, title: p.title }))
      );
      setReport(mock);
      setIsRunningCheck(false);
    }, delay);
  };

  const downloadPolicy = (policy: StoredPolicy) => {
    if (!policy.fileDataUrl) return;
    const a = document.createElement('a');
    a.href = policy.fileDataUrl;
    a.download = policy.fileName || `${policy.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadIso27001Report = () => {
    if (!report) return;
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iso27001-audit-report_${new Date(report.generatedAt).toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const statCards = useMemo(() => {
    if (report) {
      return [
        {
          label: 'Compliance Score',
          value: `${report.optionalEnhancements.complianceScorePercent}%`,
          sub: 'Mock AI assessment',
          icon: ShieldCheck,
          color: '#059669',
        },
        {
          label: 'Audit Readiness',
          value: report.overview.overallAssessment.auditReadinessStatus,
          sub: 'Overall assessment outcome',
          icon: ClipboardList,
          color: '#d97706',
        },
        {
          label: 'Policies Assessed',
          value: String(report.policyDocumentIds.length),
          sub: new Date(report.generatedAt).toLocaleString(),
          icon: FileText,
          color: '#2563eb',
        },
      ];
    }
    return [
      { label: 'Standard', value: 'ISO 27001', sub: '2022 Annex A alignment', icon: Layers, color: '#2563eb' },
      { label: 'Policies Loaded', value: String(policies.length), sub: 'From Company Policies', icon: FileText, color: '#7c3aed' },
      { label: 'Mode', value: 'Mock', sub: 'No backend API call', icon: Activity, color: '#64748b' },
    ];
  }, [report, policies.length]);

  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Compliance Check</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
            ISO 27001-style assessments against uploaded company policies.
          </p>
        </div>
      </motion.div>

      {/* Policy selection + Run */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '14px',
          border: '1px solid #f1f5f9',
          padding: '20px 22px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#172554', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} color="#2563eb" /> Select policy documents
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
              Choose one or more uploaded policies, then run a simulated ISO 27001 compliance check.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: selectedPolicies.length && !isRunningCheck ? 1.03 : 1 }}
            whileTap={{ scale: selectedPolicies.length && !isRunningCheck ? 0.97 : 1 }}
            onClick={runComplianceCheck}
            disabled={selectedPolicies.length === 0 || isRunningCheck}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: selectedPolicies.length && !isRunningCheck ? '#172554' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: selectedPolicies.length && !isRunningCheck ? 'pointer' : 'not-allowed',
              flexShrink: 0,
            }}
          >
            {isRunningCheck ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-flex' }}>
                <Loader2 size={15} />
              </motion.span>
            ) : (
              <FileSearch size={15} />
            )}
            Run Compliance Check
          </motion.button>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {policies.length === 0 && (
            <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>
              No policies uploaded yet. Add policies under <strong style={{ color: '#475569' }}>Company Policies</strong>.
            </p>
          )}
          {policies.map((p) => {
            const checked = selectedIds.has(p.id);
            return (
              <label
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`,
                  backgroundColor: checked ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input type="checkbox" checked={checked} onChange={() => togglePolicy(p.id)} style={{ width: 16, height: 16, accentColor: '#172554' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#172554' }}>{p.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                    {p.dept} · {p.status} · {p.updated}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <stat.icon size={22} color={stat.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#172554', margin: 0, lineHeight: 1.1 }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0', fontWeight: 500, lineHeight: 1.3 }}>{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isRunningCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '28px 32px',
                maxWidth: 400,
                width: '100%',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                <Loader2 size={36} color="#2563eb" />
              </motion.div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#172554', margin: '0 0 8px' }}>Analyzing policy against ISO 27001:2022</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Simulating AI extraction, control mapping, and gap analysis…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ISO 27001 Report */}
      <AnimatePresence>
        {report && !isRunningCheck && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <ClipboardList size={18} color="#172554" />
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#172554', margin: 0 }}>ISO 27001 Audit-Style Report</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '99px' }}>
                  Mock response · schema v{report.schemaVersion}
                </span>
              </div>
              <button
                type="button"
                onClick={downloadIso27001Report}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  backgroundColor: '#172554',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
                title="Download full ISO 27001 report"
              >
                <Download size={16} /> Download Report
              </button>
            </div>

            {/* A. Overview */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '22px',
                marginBottom: '14px',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }}>
                A. Overview
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, margin: '0 0 4px' }}>Policy name</p>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#172554', margin: 0, lineHeight: 1.4 }}>{report.overview.policyName}</p>
                </div>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, margin: '0 0 4px' }}>Standard</p>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#172554', margin: 0 }}>{report.overview.standard}</p>
                </div>
                <div style={{ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '12px 14px', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700, margin: '0 0 4px' }}>Audit readiness</p>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b', margin: 0 }}>{report.overview.overallAssessment.auditReadinessStatus}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div style={{ borderRadius: '10px', border: '1px solid #bbf7d0', backgroundColor: '#ecfdf5', padding: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#059669', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Strengths
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#166534', lineHeight: 1.55, fontWeight: 500 }}>
                    {report.overview.overallAssessment.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ borderRadius: '10px', border: '1px solid #fde68a', backgroundColor: '#fffbeb', padding: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#b45309', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Weaknesses
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#92400e', lineHeight: 1.55, fontWeight: 500 }}>
                    {report.overview.overallAssessment.weaknesses.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* B. Key findings */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '22px',
                marginBottom: '14px',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', margin: '0 0 14px', textTransform: 'uppercase' }}>
                B. Key findings
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {(
                  [
                    {
                      title: 'Covered (fully compliant)',
                      items: report.keyFindings.coveredAreasFullyCompliant,
                      level: 'compliant' as FindingLevel,
                    },
                    {
                      title: 'Partially covered',
                      items: report.keyFindings.partiallyCoveredAreas,
                      level: 'partial' as FindingLevel,
                    },
                    {
                      title: 'Missing / critical gaps',
                      items: report.keyFindings.missingControlsCriticalGaps,
                      level: 'missing' as FindingLevel,
                    },
                  ] as const
                ).map((block) => {
                  const c = levelColors(block.level);
                  return (
                    <div
                      key={block.title}
                      style={{
                        borderRadius: '10px',
                        border: `1px solid ${block.level === 'compliant' ? '#bbf7d0' : block.level === 'partial' ? '#fde68a' : '#fecaca'}`,
                        backgroundColor: c.bg,
                        padding: '14px',
                      }}
                    >
                      <p style={{ fontSize: '12px', fontWeight: 800, color: c.fg, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <c.Icon size={14} /> {block.title}
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: 1.55, fontWeight: 500 }}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* C. Critical audit gaps */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                border: '1px solid #fecaca',
                padding: '22px',
                marginBottom: '14px',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }}>
                C. Critical audit gaps
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report.criticalAuditGaps.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b', margin: 0 }}>{g.title}</p>
                      {g.description && (
                        <p style={{ fontSize: '12px', color: '#b91c1c', margin: '4px 0 0', lineHeight: 1.45 }}>{g.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* D. ISO control mapping */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '22px',
                marginBottom: '14px',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', margin: '0 0 14px', textTransform: 'uppercase' }}>
                D. ISO control mapping (Annex A themes)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {report.isoControlMapping.map((row) => {
                  const c = levelColors(row.status);
                  const CatIcon = categoryIcon(row.category);
                  return (
                    <div
                      key={row.category}
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${row.status === 'compliant' ? '#bbf7d0' : row.status === 'partial' ? '#fde68a' : '#fecaca'}`,
                        backgroundColor: c.bg,
                        padding: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '10px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                            <CatIcon size={16} color={c.fg} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 800, color: '#172554', margin: 0 }}>
                              {row.category} {row.categoryLabel}
                            </p>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: c.fg, margin: '2px 0 0', textTransform: 'capitalize' }}>
                              {row.status}
                            </p>
                          </div>
                        </div>
                        <c.Icon size={18} color={c.fg} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: '0 0 8px', fontWeight: 500 }}>{row.summary}</p>
                      {row.controlReferences && row.controlReferences.length > 0 && (
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: 600 }}>
                          Ref: {row.controlReferences.join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* E. Optional enhancements */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                border: '1px solid #e0e7ff',
                padding: '22px',
                backgroundImage: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 48%)',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#5b21b6', letterSpacing: '0.08em', margin: '0 0 14px', textTransform: 'uppercase' }}>
                E. Enhancements & recommendations
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    minWidth: 140,
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #e9d5ff',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', margin: '0 0 6px', textTransform: 'uppercase' }}>Compliance score</p>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: '#172554', margin: 0, lineHeight: 1 }}>
                    {report.optionalEnhancements.complianceScorePercent}%
                  </p>
                </div>
                <div style={{ flex: '1 1 280px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#172554', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={14} color="#d97706" /> Recommendations
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>
                    {report.optionalEnhancements.recommendations.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Policies table */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="#2563eb" />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>Uploaded Policies</h2>
            </div>
            <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['Policy Name', 'Target', 'Status', 'Date', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#172554' }}>{policy.title}</td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>{policy.dept}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '99px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: policy.status === 'Active' ? '#059669' : policy.status === 'Pending Review' ? '#d97706' : '#475569',
                          backgroundColor: policy.status === 'Active' ? '#ecfdf5' : policy.status === 'Pending Review' ? '#fffbeb' : '#f1f5f9',
                        }}
                      >
                        {policy.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{policy.updated}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => downloadPolicy(policy)}
                        disabled={!policy.fileDataUrl}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: policy.fileDataUrl ? '#94a3b8' : '#cbd5e1',
                          cursor: policy.fileDataUrl ? 'pointer' : 'not-allowed',
                          padding: '4px',
                        }}
                        title={policy.fileDataUrl ? 'Download Policy' : 'No file available'}
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {policies.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>No uploaded policies found yet.</div>
          )}
        </motion.div>

        {/* Action Required Panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #fecaca', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#dc2626" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', margin: 0 }}>Action Required</h2>
          </div>
          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#fffbfa', border: '1px solid #fee2e2', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b', margin: '0 0 6px' }}>Vendor Access Failure</h3>
              <p style={{ fontSize: '12px', color: '#b91c1c', margin: '0 0 12px', lineHeight: 1.4 }}>
                7 unauthorized access attempts blocked from unverified IP ranges targeting the external API gateway.
              </p>
              <button type="button" style={{ width: '100%', padding: '8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Review Logs
              </button>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>Unencrypted Data Spool</h3>
              <p style={{ fontSize: '12px', color: '#b45309', margin: '0 0 12px', lineHeight: 1.4 }}>
                Temporary cache on Node 4 is missing encryption-at-rest configuration.
              </p>
              <button type="button" style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', color: '#d97706', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
