type PolicyStatus = 'Active' | 'Pending Review' | 'Draft';

export type PolicyDocument = {
  id: number;
  title: string;
  dept: string;
  status: PolicyStatus;
  updated: string;
  owner?: string;
  description?: string;
  fileName?: string;
  fileDataUrl?: string;
};

export type PolicyChatCitation = {
  policyId: number;
  title: string;
  dept: string;
  status: PolicyStatus;
  snippet: string;
};

export type PolicyChatResponse = {
  answer: string;
  citations: PolicyChatCitation[];
  confidence: 'high' | 'medium' | 'low';
};

const POLICY_STORAGE_KEY = 'admin_company_policies_v1';

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[\u2019']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s: string) {
  const t = normalizeText(s);
  if (!t) return [];
  return t.split(' ').filter(Boolean);
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'or',
  'to',
  'of',
  'in',
  'for',
  'with',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'on',
  'at',
  'by',
  'as',
  'it',
  'this',
  'that',
  'from',
  'be',
  'will',
  'can',
  'should',
  'what',
  'when',
  'where',
  'how',
  'why',
  'i',
  'we',
  'you',
  'they',
  'them',
  'our',
  'your',
  'their',
  'not',
  'no',
]);

function filterStopWords(tokens: string[]) {
  return tokens.filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function makeSnippet(description?: string, query?: string) {
  const desc = (description || '').trim();
  if (!desc) return 'No text details available for this policy.';
  const sentences = desc.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (!sentences.length) return desc.slice(0, 220);

  if (query) {
    const q = normalizeText(query);
    const best = sentences.find((s) => normalizeText(s).includes(q.split(' ')[0] || '')) || sentences[0];
    return best.length > 220 ? `${best.slice(0, 220)}…` : best;
  }

  const best = sentences[0];
  return best.length > 220 ? `${best.slice(0, 220)}…` : best;
}

export function loadPoliciesForAI(): PolicyDocument[] {
  try {
    const raw = window.localStorage.getItem(POLICY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const normalized = (parsed as unknown[])
      .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
      .map((p) => {
        const status: PolicyStatus =
          (p.status === 'Active' || p.status === 'Pending Review' || p.status === 'Draft')
            ? (p.status as PolicyStatus)
            : 'Draft';

        return {
          id: Number(p.id),
          title: String(p.title ?? '').trim(),
          dept: String(p.dept ?? 'All'),
          status,
          updated: String(p.updated ?? ''),
          owner: typeof p.owner === 'string' ? (p.owner as string) : undefined,
          description: typeof p.description === 'string' ? (p.description as string) : undefined,
          fileName: typeof p.fileName === 'string' ? (p.fileName as string) : undefined,
          fileDataUrl: typeof p.fileDataUrl === 'string' ? (p.fileDataUrl as string) : undefined,
        } as PolicyDocument;
      });

    return normalized.filter((p) => p.id > 0 && p.title && p.updated);
  } catch {
    return [];
  }
}

export async function getPolicyChatAnswer(args: {
  question: string;
  policyScope?: 'active' | 'all';
}): Promise<PolicyChatResponse> {
  // No backend call; simulate AI processing delay.
  const { question, policyScope = 'active' } = args;
  const policies = loadPoliciesForAI();
  const scoped =
    policyScope === 'active' ? policies.filter((p) => p.status === 'Active') : policies;

  const tokens = filterStopWords(tokenize(question));
  const queryText = normalizeText(question);

  const scored = scoped
    .map((p) => {
      const haystack = normalizeText(
        [p.title, p.dept, p.status, p.owner || '', p.description || '', p.fileName || ''].join(' ')
      );
      let score = 0;
      for (const t of tokens) {
        if (haystack.includes(t)) score += 1;
      }
      // Light bonus if query contains words found in title.
      const title = normalizeText(p.title);
      if (title && queryText.includes(title.split(' ')[0] || '')) score += 0.5;
      return { policy: p, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3).filter((x) => x.score > 0);
  const best = scored[0];

  // Confidence heuristics.
  let confidence: PolicyChatResponse['confidence'] = 'low';
  if (top.length >= 2) confidence = 'high';
  else if (top.length === 1) confidence = 'medium';
  else if (best && best.score > 0) confidence = 'medium';

  const citations: PolicyChatCitation[] = (top.length ? top : scored.slice(0, 3))
    .filter(Boolean)
    .map((x) => ({
      policyId: x.policy.id,
      title: x.policy.title,
      dept: x.policy.dept,
      status: x.policy.status,
      snippet: makeSnippet(x.policy.description, question),
    }));

  if (!top.length) {
    return {
      confidence,
      answer:
        'I couldn’t find an exact match in the uploaded policy text for your question. However, these policies look most relevant based on the available details. You can review them for the official requirements.',
      citations,
    };
  }

  const primary = top[0].policy;
  const related = top.slice(1).map((x) => x.policy.title);
  const relatedLine = related.length ? `Related documents: ${related.join(', ')}.` : '';

  return {
    confidence,
    answer:
      `Based on “${primary.title}”, here’s how to approach your request: ${makeSnippet(primary.description, question)} ${relatedLine}`.trim(),
    citations,
  };
}

