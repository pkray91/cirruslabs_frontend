// API client for GuardAI backend

import {
  ChatRequest,
  ChatResponse,
  DocumentListResponse,
  BatchUploadResponse,
  IngestionJobInfo,
  ComplianceRequest,
  ComplianceResponse,
  ISOStandardInfo,
  DashboardMetrics,
  HealthResponse,
} from '@/types/api';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/api/v1';

class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new APIError(
      response.status,
      errorData.detail || errorData.message || `HTTP ${response.status}`,
      errorData
    );
  }

  return response.json();
}

// ============= Chat API =============

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getChatHistory(sessionId: string): Promise<any> {
  return fetchAPI(`/chat/sessions/${sessionId}`, {
    method: 'GET',
  });
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  return fetchAPI(`/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}

// ============= Documents API =============

export async function listDocuments(): Promise<DocumentListResponse> {
  return fetchAPI<DocumentListResponse>('/documents', {
    method: 'GET',
  });
}

export async function uploadDocuments(files: File[]): Promise<BatchUploadResponse> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const url = `${API_BASE_URL}${API_PREFIX}/documents/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new APIError(
      response.status,
      errorData.detail || errorData.message || `HTTP ${response.status}`,
      errorData
    );
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<IngestionJobInfo> {
  return fetchAPI<IngestionJobInfo>(`/documents/jobs/${jobId}`, {
    method: 'GET',
  });
}

export async function deleteDocument(documentId: string): Promise<any> {
  return fetchAPI(`/documents/${documentId}`, {
    method: 'DELETE',
  });
}

// ============= Compliance API =============

export async function analyzeCompliance(
  request: ComplianceRequest
): Promise<ComplianceResponse> {
  return fetchAPI<ComplianceResponse>('/compliance/analyze', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function listISOStandards(): Promise<ISOStandardInfo[]> {
  return fetchAPI<ISOStandardInfo[]>('/compliance/standards', {
    method: 'GET',
  });
}

// ============= Dashboard API =============

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return fetchAPI<DashboardMetrics>('/dashboard/metrics', {
    method: 'GET',
  });
}

// ============= Health API =============

export async function checkHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>('/health', {
    method: 'GET',
  });
}

// ============= Export API Error for error handling =============

export { APIError };
