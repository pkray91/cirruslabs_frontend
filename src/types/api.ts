// Type definitions matching backend Pydantic models

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SourceReference {
  document_name: string;
  section_heading: string;
  page_number?: number;
  verbatim_clause: string;
  relevance_score: number;
  chunk_id?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  include_sources?: boolean;
  max_sources?: number;
  stream?: boolean;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  sources: SourceReference[];
  timestamp: string;
  metadata: Record<string, any>;
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum JobStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface DocumentMetadata {
  filename: string;
  file_size_bytes: number;
  mime_type: string;
  page_count?: number;
  section_count?: number;
  uploaded_at: string;
  s3_key: string;
  s3_bucket: string;
}

export interface DocumentInfo {
  document_id: string;
  filename: string;
  status: DocumentStatus;
  chunk_count: number;
  total_tokens: number;
  uploaded_at: string;
  indexed_at?: string;
  metadata?: DocumentMetadata;
}

export interface UploadDocumentResponse {
  job_id: string;
  document_id: string;
  filename: string;
  status: JobStatus;
  message: string;
}

export interface BatchUploadResponse {
  total_files: number;
  successful: number;
  duplicates: number;
  failed: number;
  results: UploadDocumentResponse[];
}

export interface IngestionJobInfo {
  job_id: string;
  document_id: string;
  status: JobStatus;
  progress_percent: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
}

export interface DocumentListResponse {
  documents: DocumentInfo[];
}

export enum ISOStandard {
  ISO27001 = 'ISO27001',
  ISO27002 = 'ISO27002',
  ISO27017 = 'ISO27017',
  ISO27018 = 'ISO27018',
  ISO27701 = 'ISO27701',
  ISO22301 = 'ISO22301',
  ISO20000 = 'ISO20000',
  ISO37301 = 'ISO37301',
  ISO42001 = 'ISO42001',
  ISO45001 = 'ISO45001'
}

export enum GRCDomain {
  GOVERNANCE = 'Governance',
  RISK_MANAGEMENT = 'Risk Management',
  COMPLIANCE = 'Compliance',
  PRIVACY = 'Privacy',
  TECHNICAL_SECURITY = 'Technical Security',
  OPERATIONAL_SECURITY = 'Operational Security',
  HUMAN_RESOURCES = 'Human Resources',
  PHYSICAL_SECURITY = 'Physical Security',
  AI_GOVERNANCE = 'AI Governance',
  BUSINESS_CONTINUITY = 'Business Continuity'
}

export interface ComplianceRequest {
  document_ids: string[];
  target_iso?: ISOStandard;
  include_mapping?: boolean;
  include_consolidated?: boolean;
}

export interface DocumentMapping {
  document_name: string;
  detected_document_type: string;
  policy_domain: string;
  primary_iso: ISOStandard;
  secondary_iso: ISOStandard[];
  grc_strength: GRCDomain[];
  mapping_confidence: number;
  mapping_rationale: string;
}

export interface ComplianceEvidence {
  control_id: string;
  control_title: string;
  evidence_text: string;
  document_section?: string;
  page_number?: number;
}

export interface ComplianceGap {
  control_id: string;
  control_title: string;
  severity: string;
  gap_description: string;
  remediation: string;
  priority: string;
}

export interface ComplianceAnalysis {
  document_id: string;
  document_name: string;
  readiness_score: number;
  executive_summary: string;
  compliant_areas: ComplianceEvidence[];
  partially_compliant_areas: ComplianceEvidence[];
  missing_controls: ComplianceGap[];
  evidence_found: string[];
  remediation_recommendations: string[];
  priority_levels?: Record<string, number>;
  limitations?: string;
}

export interface ComplianceResponse {
  request_id: string;
  timestamp: string;
  target_iso?: ISOStandard;
  mappings?: DocumentMapping[];
  analyses: ComplianceAnalysis[];
  consolidated_view?: {
    overall_readiness: number;
    total_gaps: number;
    critical_gaps: string[];
    strengths: string[];
  };
  metadata: Record<string, any>;
}

export interface ISOStandardInfo {
  standard: ISOStandard;
  full_name: string;
  description: string;
  primary_domains: GRCDomain[];
}

export interface DashboardMetrics {
  total_employees: number;
  total_policies: number;
  compliance_score: number;
  ai_queries_today: number;
  recent_activity: ActivityItem[];
  compliance_by_department: DepartmentCompliance[];
}

export interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DepartmentCompliance {
  department: string;
  compliance_percentage: number;
  total_employees: number;
  compliant_employees: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services: Record<string, any>;
}
