/**
 * ISO 27001 audit-style report contract.
 * Replace `generateMockIso27001Report` with a real API call; keep these types + shape stable for the UI.
 */
export type FindingLevel = 'compliant' | 'partial' | 'missing';

export interface Iso27001Overview {
  policyName: string;
  standard: 'ISO 27001:2022';
  overallAssessment: {
    strengths: string[];
    weaknesses: string[];
    auditReadinessStatus: string;
  };
}

export interface Iso27001KeyFindings {
  coveredAreasFullyCompliant: string[];
  partiallyCoveredAreas: string[];
  missingControlsCriticalGaps: string[];
}

export interface Iso27001CriticalGap {
  id: string;
  title: string;
  description?: string;
}

export type IsoControlCategoryCode = 'A.5' | 'A.6' | 'A.7' | 'A.8';

export interface IsoControlMappingRow {
  category: IsoControlCategoryCode;
  categoryLabel: string;
  status: FindingLevel;
  summary: string;
  controlReferences?: string[];
}

export interface Iso27001OptionalEnhancements {
  complianceScorePercent: number;
  recommendations: string[];
}

/** Mirrors a future AI / backend JSON payload */
export interface Iso27001AuditReport {
  schemaVersion: '1.0';
  generatedAt: string;
  policyDocumentIds: number[];
  overview: Iso27001Overview;
  keyFindings: Iso27001KeyFindings;
  criticalAuditGaps: Iso27001CriticalGap[];
  isoControlMapping: IsoControlMappingRow[];
  optionalEnhancements: Iso27001OptionalEnhancements;
}

export function generateMockIso27001Report(
  selectedPolicies: { id: number; title: string }[]
): Iso27001AuditReport {
  const policyName =
    selectedPolicies.length === 0
      ? 'Unnamed policy set'
      : selectedPolicies.length === 1
        ? selectedPolicies[0].title
        : `${selectedPolicies.map((p) => p.title).join(' · ')}`;

  const ids = selectedPolicies.map((p) => p.id);

  return {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    policyDocumentIds: ids,
    overview: {
      policyName,
      standard: 'ISO 27001:2022',
      overallAssessment: {
        strengths: [
          'Documented acceptable use and access expectations (usage)',
          'Physical access controls referenced for primary sites',
          'Basic awareness of confidentiality in policy language',
        ],
        weaknesses: [
          'Governance: unclear roles for ISMS ownership and risk acceptance',
          'Monitoring: no defined logging, review, or alerting cadence',
          'Third-party and supplier security obligations under-specified',
        ],
        auditReadinessStatus: 'Not Audit Ready',
      },
    },
    keyFindings: {
      coveredAreasFullyCompliant: [
        'A.5.1 Policies for information security (policy existence)',
        'A.5.10 Acceptable use of information (high-level rules)',
        'A.7.2 Physical entry controls (referenced for HQ)',
      ],
      partiallyCoveredAreas: [
        'A.5.2 Review of policies (no review cycle or evidence)',
        'A.8.1 User endpoint devices (BYOD / hardening not defined)',
        'A.8.8 Management of technical vulnerabilities (patching implied only)',
        'A.5.9 Inventory of information and assets (no asset register)',
      ],
      missingControlsCriticalGaps: [
        'A.5.9 Classification of information (no scheme or handling rules)',
        'A.5.26 Incident response (no IR plan, roles, or comms)',
        'A.8.16 Monitoring activities (no log retention or SIEM alignment)',
        'A.5.10 / A.8.32 Change management linkage to security impact',
      ],
    },
    criticalAuditGaps: [
      { id: 'gap-1', title: 'No asset ownership', description: 'No accountable owners for information assets and systems.' },
      { id: 'gap-2', title: 'No classification policy', description: 'Missing labels, handling, and disposal rules for sensitive data.' },
      { id: 'gap-3', title: 'No incident response process', description: 'No defined detection, escalation, or post-incident review.' },
      { id: 'gap-4', title: 'No logging / monitoring', description: 'No retention, access, or review requirements for audit logs.' },
      { id: 'gap-5', title: 'No patch management', description: 'No vulnerability scanning, SLAs, or emergency patch path.' },
    ],
    isoControlMapping: [
      {
        category: 'A.5',
        categoryLabel: 'Organizational',
        status: 'partial',
        summary: 'Policies exist but governance, classification, and supplier controls are incomplete.',
        controlReferences: ['A.5.1', 'A.5.2', 'A.5.9', 'A.5.19', 'A.5.26'],
      },
      {
        category: 'A.6',
        categoryLabel: 'People',
        status: 'partial',
        summary: 'Awareness implied; screening and disciplinary processes not evidenced in document.',
        controlReferences: ['A.6.1', 'A.6.2', 'A.6.3'],
      },
      {
        category: 'A.7',
        categoryLabel: 'Physical',
        status: 'compliant',
        summary: 'Physical security expectations adequately referenced for controlled areas.',
        controlReferences: ['A.7.1', 'A.7.2', 'A.7.4'],
      },
      {
        category: 'A.8',
        categoryLabel: 'Technological',
        status: 'missing',
        summary: 'Major gaps in logging, vulnerability management, and secure configuration.',
        controlReferences: ['A.8.8', 'A.8.16', 'A.8.9', 'A.8.19'],
      },
    ],
    optionalEnhancements: {
      complianceScorePercent: 58,
      recommendations: [
        'Assign asset owners and maintain a living inventory aligned to Annex A.',
        'Publish an information classification scheme and handling rules (including third parties).',
        'Stand up an incident response runbook with tabletop exercises at least annually.',
        'Define log sources, retention, privileged access monitoring, and periodic review.',
        'Document patch SLAs, exception process, and emergency change path.',
      ],
    },
  };
}
