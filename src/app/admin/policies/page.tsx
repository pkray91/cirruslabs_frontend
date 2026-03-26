'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, CheckCircle2, AlertCircle, Upload, X, Loader } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { listDocuments, uploadDocuments, getJobStatus, APIError } from '@/lib/api';
import type { DocumentInfo, JobStatus as JobStatusType } from '@/types/api';
import { useSessionStorage } from '@/hooks/useSessionStorage';

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  'completed':    { color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
  'processing':   { color: '#d97706', bg: '#fffbeb', icon: Clock        },
  'pending':      { color: '#475569', bg: '#f1f5f9', icon: AlertCircle  },
  'failed':       { color: '#dc2626', bg: '#fef2f2', icon: AlertCircle  },
};

interface UploadJob {
  jobId: string;
  filename: string;
  status: JobStatusType;
  progress: number;
}

export default function PoliciesPage() {
  const [documents, setDocuments] = useSessionStorage<DocumentInfo[]>('guardai_documents', []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadJobs, setUploadJobs] = useSessionStorage<UploadJob[]>('guardai_upload_jobs', []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  // Poll upload job statuses
  useEffect(() => {
    if (uploadJobs.length === 0) return;
    
    const inProgressJobs = uploadJobs.filter(j => j.status === 'in_progress' || j.status === 'queued');
    if (inProgressJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of inProgressJobs) {
        try {
          const status = await getJobStatus(job.jobId);
          setUploadJobs(prev => prev.map(j => 
            j.jobId === job.jobId 
              ? { ...j, status: status.status, progress: status.progress_percent }
              : j
          ));
          
          // If job completed, reload documents
          if (status.status === 'completed') {
            loadDocuments();
          }
        } catch (err) {
          console.error(`Failed to check job status for ${job.jobId}:`, err);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [uploadJobs]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listDocuments();
      setDocuments(response.documents);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const response = await uploadDocuments(selectedFiles);
      
      // Create upload jobs for tracking
      const jobs: UploadJob[] = response.results.map(r => ({
        jobId: r.job_id,
        filename: r.filename,
        status: r.status,
        progress: 0,
      }));
      
      setUploadJobs(jobs);
      setSelectedFiles([]);
      setShowUploadModal(false);
      
      // Show brief success message
      if (response.successful > 0) {
        setTimeout(() => loadDocuments(), 1000);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err instanceof APIError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const activeCount = documents.filter(d => d.status === 'completed').length;

  return (
    <div style={{ padding: '32px', flex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Company Policies</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
            {loading ? 'Loading...' : `${documents.length} policies — ${activeCount} active`}
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }} 
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowUploadModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <Upload size={15} /> Upload Documents
        </motion.button>
      </motion.div>

      {/* Upload Jobs Progress */}
      {uploadJobs.length > 0 && (
        <div style={{ marginBottom: '24px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#172554', marginBottom: '12px' }}>Processing Uploads</div>
          {uploadJobs.map((job) => (
            <div key={job.jobId} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>{job.filename}</div>
                <div style={{ height: '4px', backgroundColor: '#e0e7ff', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: job.status === 'completed' ? '#059669' : '#2563eb', width: `${job.progress}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: job.status === 'completed' ? '#059669' : '#64748b', textTransform: 'capitalize' }}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
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

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '16px' }}
        >
          <FileText size={48} color="#cbd5e1" />
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8' }}>No documents uploaded yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{ padding: '10px 20px', backgroundColor: '#172554', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            Upload Your First Document
          </button>
        </motion.div>
      )}

      {/* Documents Grid */}
      {!loading && documents.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {documents.map((doc, i) => {
            const statusKey = doc.status.toLowerCase();
            const s = STATUS_STYLE[statusKey] || STATUS_STYLE['pending'];
            return (
              <motion.div
                key={doc.document_id}
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
                style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#2563eb" />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '3px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                    <s.icon size={11} /> {doc.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172554', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', fontWeight: 500 }}>
                  {doc.chunk_count} chunks · {Math.ceil(doc.total_tokens / 1000)}k tokens
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                    {formatDate(doc.uploaded_at)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
            }}
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#172554', margin: 0 }}>Upload Policy Documents</h2>
                <button onClick={() => !uploading && setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} color="#94a3b8" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', backgroundColor: '#f8fafc'
                }}
              >
                <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>Click to select files</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>PDF, DOCX, or TXT</p>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#172554', marginBottom: '8px' }}>Selected Files ({selectedFiles.length})</div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{file.name}</span>
                        <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}>
                          <X size={16} color="#94a3b8" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  disabled={uploading}
                  style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: '#172554', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: (selectedFiles.length === 0 || uploading) ? 'not-allowed' : 'pointer', opacity: (selectedFiles.length === 0 || uploading) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {uploading ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
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
