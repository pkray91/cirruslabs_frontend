'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileSearch, Activity, X, Loader, CheckCircle2, 
  AlertTriangle, AlertCircle, ChevronDown, ChevronUp, FileText,
  CheckCircle, XCircle, Info, TrendingUp, Target, Lightbulb
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { listDocuments, analyzeCompliance, listISOStandards, APIError } from '@/lib/api';
import type { DocumentInfo, ISOStandard, ISOStandardInfo } from '@/types/api';
import { useSessionStorage } from '@/hooks/useSessionStorage';

export default function CompliancePage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isoStandards, setIsoStandards] = useState<ISOStandardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedISO, setSelectedISO] = useState<ISOStandard | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useSessionStorage<any[]>('guardai_compliance_results', []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [docsResponse, standardsResponse] = await Promise.all([
        listDocuments(),
        listISOStandards()
      ]);
      setDocuments(docsResponse.documents.filter(d => d.status === 'completed'));
      setIsoStandards(standardsResponse);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleRunScan = async () => {
    if (selectedDocIds.length === 0) {
      alert('Please select at least one document');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      
      const response = await analyzeCompliance({
        document_ids: selectedDocIds,
        target_iso: selectedISO || undefined,
        include_mapping: true,
        include_consolidated: true
      });

      const result = {
        target_iso: response.target_iso,
        analyses: response.analyses,
        overall_readiness: response.consolidated_view?.overall_readiness,
        timestamp: new Date().toISOString()
      };

      setScanResults(prev => [result, ...prev]);
      setShowScanModal(false);
      setSelectedDocIds([]);
      setSelectedISO(null);
    } catch (err) {
      console.error('Compliance scan failed:', err);
      const errorMsg = err instanceof APIError ? err.message : 'Compliance scan failed';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setScanning(false);
    }
  };

  const avgReadiness = scanResults.length > 0 
    ? Math.round(scanResults.reduce((sum: number, r: any) => sum + (r.overall_readiness || 0), 0) / scanResults.length)
    : 0;

  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>ISO Compliance Analysis</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Automated compliance checking and gap analysis</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }} 
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowScanModal(true)}
          disabled={loading || documents.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: (loading || documents.length === 0) ? 'not-allowed' : 'pointer', opacity: (loading || documents.length === 0) ? 0.5 : 1 }}>
          <FileSearch size={15} /> Run Compliance Scan
        </motion.button>
      </motion.div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: 600, }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Scans', value: scanResults.length.toString(), icon: Activity, color: '#2563eb' },
          { label: 'Avg Readiness', value: `${avgReadiness}%`, icon: ShieldCheck, color: '#059669' },
          { label: 'Documents', value: documents.length.toString(), icon: FileSearch, color: '#7c3aed' },
        ].map((stat, i) => (
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

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader className="animate-spin" size={32} color="#2563eb" />
        </div>
      )}

      {!loading && scanResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
        >
          <ShieldCheck size={48} color="#cbd5e1" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#475569', margin: 0 }}>No Compliance Scans Yet</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Run your first compliance analysis to check ISO readiness</p>
          {documents.length > 0 ? (
            <button
              onClick={() => setShowScanModal(true)}
              style={{ marginTop: '8px', padding: '10px 20px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Run First Scan
            </button>
          ) : (
            <p style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '8px' }}>Upload documents first in the Policies page</p>
          )}
        </motion.div>
      )}

      {!loading && scanResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scanResults.map((result: any, idx: number) => (
            <ScanResultCard key={idx} result={result} />
          ))}
        </div>
      )}

      {/* Scan Modal */}
      <AnimatePresence>
        {showScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
            onClick={() => !scanning && setShowScanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#172554', margin: 0 }}>Configure Compliance Scan</h2>
                <button onClick={() => !scanning && setShowScanModal(false)} disabled={scanning} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94a3b8" />
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#172554' }}>Select ISO Standard</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Optional - will auto-map if not selected</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {isoStandards.map((standard) => (
                    <button
                      key={standard.standard}
                      onClick={() => setSelectedISO(standard.standard)}
                      style={{
                        padding: '12px', 
                        border: `2px solid ${selectedISO === standard.standard ? '#2563eb' : '#e2e8f0'}`, 
                        backgroundColor: selectedISO === standard.standard ? '#eff6ff' : 'white',
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        fontWeight: 700, 
                        color: selectedISO === standard.standard ? '#2563eb' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {standard.standard}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#172554', display: 'block', marginBottom: '12px' }}>
                  Select Documents ({selectedDocIds.length})
                </label>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {documents.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.document_id);
                    return (
                      <button
                        key={doc.document_id}
                        onClick={() => toggleDocumentSelection(doc.document_id)}
                        style={{
                          padding: '12px',
                          border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                          backgroundColor: isSelected ? '#eff6ff' : 'white',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#2563eb' : '#172554' }}>
                            {doc.filename}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {doc.chunk_count} chunks
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="#2563eb" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => !scanning && setShowScanModal(false)}
                  disabled={scanning}
                  style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunScan}
                  disabled={selectedDocIds.length === 0 || scanning}
                  style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: '#172554', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: (selectedDocIds.length === 0 || scanning) ? 'not-allowed' : 'pointer', opacity: (selectedDocIds.length === 0 || scanning) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {scanning ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileSearch size={14} />
                      Run Scan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function for priority colors
function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#d97706';
    case 'low': return '#0891b2';
    default: return '#64748b';
  }
}

// Detailed Scan Result Card Component
function ScanResultCard({ result }: Readonly<{ result: any }>) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'compliant' | 'partial' | 'missing' | 'recommendations'>('overview');
  
  const analysis = result.analyses?.[0]; // Get first analysis
  const mapping = result.mappings?.[0]; // Get first mapping
  
  if (!analysis) return null;

  const readinessScore = Math.round((analysis.readiness_score || 0) * 100);
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'high':
        return <XCircle size={16} />;
      case 'medium':
        return <AlertTriangle size={16} />;
      case 'low':
        return <Info size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}
    >
      {/* Header Section */}
      <button
        type="button" 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          width: '100%',
          padding: '24px',
          border: 'none',
          background: 'white',
          cursor: 'pointer',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: expanded ? '1px solid #f1f5f9' : 'none',
          textAlign: 'left'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#172554', margin: 0 }}>
              {result.target_iso || analysis.target_iso} Compliance Scan
            </h3>
            {mapping && (
              <span style={{ 
                padding: '4px 10px', 
                backgroundColor: '#eff6ff', 
                color: '#2563eb', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 700 
              }}>
                {Math.round(mapping.mapping_confidence * 100)}% confidence
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              {analysis.document_name}
            </p>
            {mapping?.detected_document_type && (
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                • {mapping.detected_document_type}
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: 800, 
              color: getScoreColor(readinessScore),
              lineHeight: 1
            }}>
              {readinessScore}%
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>
              Readiness
            </div>
          </div>
          
          {expanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Quick Stats Bar */}
            <div style={{ 
              padding: '20px 24px', 
              backgroundColor: '#f8fafc',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px'
            }}>
              <StatBadge 
                icon={<CheckCircle size={16} />}
                label="Compliant"
                value={analysis.compliant_areas?.length || 0}
                color="#059669"
              />
              <StatBadge 
                icon={<AlertTriangle size={16} />}
                label="Partial"
                value={analysis.partially_compliant_areas?.length || 0}
                color="#d97706"
              />
              <StatBadge 
                icon={<XCircle size={16} />}
                label="Gaps"
                value={analysis.missing_controls?.length || 0}
                color="#dc2626"
              />
              {analysis.priority_levels && (
                <>
                  {analysis.priority_levels.critical > 0 && (
                    <StatBadge 
                      icon={<AlertCircle size={16} />}
                      label="Critical"
                      value={analysis.priority_levels.critical}
                      color="#dc2626"
                    />
                  )}
                  <StatBadge 
                    icon={<TrendingUp size={16} />}
                    label="High Priority"
                    value={analysis.priority_levels.high || 0}
                    color="#ea580c"
                  />
                </>
              )}
            </div>

            {/* Tabs */}
            <div style={{ 
              padding: '0 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              gap: '4px'
            }}>
              {[
                { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
                { id: 'compliant', label: 'Compliant', icon: <CheckCircle size={14} />, count: analysis.compliant_areas?.length },
                { id: 'partial', label: 'Partial', icon: <AlertTriangle size={14} />, count: analysis.partially_compliant_areas?.length },
                { id: 'missing', label: 'Gaps', icon: <XCircle size={14} />, count: analysis.missing_controls?.length },
                { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={14} />, count: analysis.remediation_recommendations?.length },
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: selectedTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                    color: selectedTab === tab.id ? '#2563eb' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: selectedTab === tab.id ? '#2563eb' : '#e2e8f0',
                      color: selectedTab === tab.id ? 'white' : '#64748b',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 800
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '24px' }}>
              {selectedTab === 'overview' && (
                <OverviewTab analysis={analysis} mapping={mapping} />
              )}
              
              {selectedTab === 'compliant' && (
                <ComplianceAreasList 
                  areas={analysis.compliant_areas || []}
                  title="Fully Compliant Controls"
                  emptyMessage="No fully compliant controls found"
                  type="success"
                />
              )}
              
              {selectedTab === 'partial' && (
                <ComplianceAreasList 
                  areas={analysis.partially_compliant_areas || []}
                  title="Partially Compliant Controls"
                  emptyMessage="No partially compliant controls found"
                  type="warning"
                />
              )}
              
              {selectedTab === 'missing' && (
                <MissingControlsList 
                  controls={analysis.missing_controls || []}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                />
              )}
              
              {selectedTab === 'recommendations' && (
                <RecommendationsList 
                  recommendations={analysis.remediation_recommendations || []}
                  priorityLevels={analysis.priority_levels}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper Components
function StatBadge({ icon, label, value, color }: Readonly<{ icon: React.ReactNode; label: string; value: number; color: string }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '10px', 
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#172554', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

function OverviewTab({ analysis, mapping }: Readonly<{ analysis: any; mapping: any }>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Summary */}
      {analysis.executive_summary && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} color="#2563eb" />
            Executive Summary
          </h4>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #2563eb' }}>
            {analysis.executive_summary}
          </p>
        </div>
      )}

      {/* Document Mapping Info */}
      {mapping && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', marginBottom: '12px' }}>Document Classification</h4>
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <InfoItem label="Document Type" value={mapping.detected_document_type} />
              <InfoItem label="Policy Domain" value={mapping.policy_domain} />
              <InfoItem label="Primary ISO" value={mapping.primary_iso} />
            </div>
            
            {mapping.secondary_iso?.length > 0 && (
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Secondary Standards:</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {mapping.secondary_iso.map((iso: string) => (
                    <span key={iso} style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#e0e7ff', 
                      color: '#4f46e5', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: 700 
                    }}>
                      {iso}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {mapping.grc_strength?.length > 0 && (
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>GRC Strengths:</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {mapping.grc_strength.map((domain: string) => (
                    <span key={domain} style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#d1fae5', 
                      color: '#059669', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: 700 
                    }}>
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {mapping.mapping_rationale && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rationale:</span>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                  {mapping.mapping_rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evidence Found */}
      {analysis.evidence_found?.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', marginBottom: '12px' }}>Evidence Found</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.evidence_found.map((evidence: string, idx: number) => (
              <div key={idx} style={{ 
                padding: '12px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '8px',
                borderLeft: '3px solid #059669',
                fontSize: '12px',
                color: '#166534',
                display: 'flex',
                alignItems: 'start',
                gap: '8px'
              }}>
                <CheckCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{evidence}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limitations */}
      {analysis.limitations && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="#64748b" />
            Limitations
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, margin: 0, padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', fontStyle: 'italic' }}>
            {analysis.limitations}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#172554', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function ComplianceAreasList({ areas, title, emptyMessage, type }: Readonly<{ 
  areas: any[]; 
  title: string; 
  emptyMessage: string; 
  type: 'success' | 'warning' 
}>) {
  const colors = {
    success: { bg: '#f0fdf4', border: '#059669', text: '#166534' },
    warning: { bg: '#fef3c7', border: '#d97706', text: '#92400e' }
  };

  const color = colors[type];

  if (areas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
        <Info size={32} style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', fontWeight: 600 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {areas.map((area: any, idx: number) => (
        <div key={idx} style={{ 
          padding: '16px', 
          backgroundColor: color.bg, 
          borderRadius: '10px',
          borderLeft: `3px solid ${color.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 800, 
                color: color.text,
                backgroundColor: 'rgba(255,255,255,0.5)',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {area.control_id}
              </span>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#172554', margin: '8px 0 4px' }}>
                {area.control_title}
              </h5>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: color.text, lineHeight: 1.5, margin: '8px 0', fontStyle: 'italic' }}>
            "{area.evidence_text}"
          </p>
          
          {(area.document_section || area.page_number) && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '11px', 
              color: '#64748b',
              display: 'flex',
              gap: '12px'
            }}>
              {area.document_section && <span>📍 {area.document_section}</span>}
              {area.page_number && <span>📄 Page {area.page_number}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MissingControlsList({ controls, getPriorityColor, getPriorityIcon }: Readonly<{ 
  controls: any[]; 
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
}>) {
  if (controls.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
        <CheckCircle2 size={32} style={{ margin: '0 auto 12px' }} color="#059669" />
        <p style={{ fontSize: '13px', fontWeight: 600 }}>No gaps identified! Excellent compliance coverage.</p>
      </div>
    );
  }

  // Group by priority
  const groupedControls = controls.reduce((acc: any, control: any) => {
    const priority = control.priority || 'medium';
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(control);
    return acc;
  }, {});

  const priorityOrder = ['critical', 'high', 'medium', 'low'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {priorityOrder.map(priority => {
        const items = groupedControls[priority];
        if (!items || items.length === 0) return null;

        return (
          <div key={priority}>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: getPriorityColor(priority),
              marginBottom: '12px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getPriorityIcon(priority)}
              {priority} Priority ({items.length})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((control: any, idx: number) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  backgroundColor: 'white',
                  border: `2px solid ${getPriorityColor(control.priority)}20`,
                  borderLeft: `4px solid ${getPriorityColor(control.priority)}`,
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          color: getPriorityColor(control.priority),
                          backgroundColor: `${getPriorityColor(control.priority)}15`,
                          padding: '4px 8px',
                          borderRadius: '5px'
                        }}>
                          {control.control_id}
                        </span>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          color: getPriorityColor(control.severity || control.priority),
                          textTransform: 'uppercase',
                          backgroundColor: `${getPriorityColor(control.severity || control.priority)}10`,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          {control.severity || control.priority} severity
                        </span>
                      </div>
                      
                      <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', margin: '0 0 8px' }}>
                        {control.control_title}
                      </h5>
                      
                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '0 0 12px' }}>
                        {control.gap_description}
                      </p>
                      
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f0f9ff', 
                        borderRadius: '8px',
                        borderLeft: '3px solid #0ea5e9'
                      }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                          💡 Recommended Action
                        </div>
                        <p style={{ fontSize: '12px', color: '#0c4a6e', margin: 0, lineHeight: 1.5 }}>
                          {control.remediation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecommendationsList({ recommendations, priorityLevels }: Readonly<{ recommendations: string[]; priorityLevels: any }>) {
  if (recommendations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
        <Info size={32} style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', fontWeight: 600 }}>No recommendations available</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Priority Summary */}
      {priorityLevels && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '10px',
          border: '1px solid #fbbf24'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} />
            Priority Breakdown
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
            {Object.entries(priorityLevels).map(([key, value]: [string, any]) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#92400e' }}>{value}</div>
                <div style={{ fontSize: '10px', color: '#78350f', fontWeight: 600, textTransform: 'uppercase' }}>{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={16} color="#f59e0b" />
          Prioritized Recommendations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recommendations.map((rec: string, idx: number) => {
            // Extract priority from recommendation text (if present in parentheses)
            const priorityRegex = /\((CRITICAL|HIGH|MEDIUM|LOW)\)/i;
            const priorityMatch = priorityRegex.exec(rec);
            const priority = priorityMatch ? priorityMatch[1].toLowerCase() : null;
            const cleanText = rec.replaceAll(/\s*\((CRITICAL|HIGH|MEDIUM|LOW)\)\s*/gi, '');

            return (
              <div key={`rec-${idx}-${rec.substring(0, 20)}`} style={{ 
                padding: '16px', 
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderLeft: priority ? `4px solid ${getPriorityColor(priority)}` : '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  {priority && (
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 700, 
                      color: getPriorityColor(priority),
                      backgroundColor: `${getPriorityColor(priority)}15`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      marginRight: '8px'
                    }}>
                      {priority}
                    </span>
                  )}
                  <p style={{ fontSize: '13px', color: '#172554', lineHeight: 1.6, margin: '4px 0 0', fontWeight: 500 }}>
                    {cleanText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

