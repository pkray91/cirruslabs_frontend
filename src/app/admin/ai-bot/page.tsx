'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Shield, Send, LogOut, Download, Sparkles, FileText } from 'lucide-react';
import type { PolicyChatCitation, PolicyChatResponse, PolicyDocument } from '@/lib/policyMockAI';
import { getPolicyChatAnswer, loadPoliciesForAI } from '@/lib/policyMockAI';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  citations?: PolicyChatCitation[];
  confidence?: PolicyChatResponse['confidence'];
};

function downloadPolicyFile(policy: PolicyDocument) {
  if (!policy.fileDataUrl) return;
  const a = document.createElement('a');
  a.href = policy.fileDataUrl;
  a.download = policy.fileName || `${policy.title}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function AiAssistantPage() {
  const [availablePolicies, setAvailablePolicies] = useState<PolicyDocument[]>([]);
  const activePolicies = useMemo(
    () => availablePolicies.filter((p) => p.status === 'Active').slice(0, 6),
    [availablePolicies]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAvailablePolicies(loadPoliciesForAI());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai: PolicyChatResponse = await getPolicyChatAnswer({
        question,
        policyScope: 'all',
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: ai.answer,
          citations: ai.citations,
          confidence: ai.confidence,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, background: '#172554', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#172554' }}>Admin AI Assistant</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
              Ask questions about uploaded policies (chat-based mock AI).
            </p>
          </div>
        </div>

        <Link
          href="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: '#475569',
            fontSize: 13,
            fontWeight: 700,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            padding: '10px 14px',
            borderRadius: 10,
          }}
        >
          <LogOut size={15} /> Sign out
        </Link>
      </motion.div>

      {/* Layout: policies left + chat right */}
      <div style={{ padding: 0, display: 'grid', gridTemplateColumns: '380px 1fr', gap: 18, flex: 1, minHeight: 0 }} className="admin-ai-grid">
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="#2563eb" />
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#172554' }}>Active Policies</h2>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>
            {activePolicies.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                No active policies yet. Upload policies under Company Policies.
              </p>
            ) : (
              activePolicies.map((p) => (
                <div key={p.id} style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderRadius: 14, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#172554', lineHeight: 1.25 }}>{p.title}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                        {p.dept} · {p.updated}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 10px', borderRadius: 999, border: '1px solid #bbf7d0' }}>
                      Active
                    </span>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => downloadPolicyFile(p)}
                      disabled={!p.fileDataUrl}
                      style={{
                        background: 'none',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '8px 10px',
                        cursor: p.fileDataUrl ? 'pointer' : 'not-allowed',
                        color: p.fileDataUrl ? '#2563eb' : '#cbd5e1',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      title={p.fileDataUrl ? 'Download policy file' : 'File not available'}
                    >
                      <Download size={16} /> Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8faff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#172554' }}>Chat with GuardAI</h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8', fontWeight: 600, lineHeight: 1.4 }}>
                  Answers are based on the uploaded policy documents (mock AI).
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#2563eb', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: 999, border: '1px solid #dbeafe' }}>
                {availablePolicies.length} docs
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14, backgroundColor: '#f8fafc' }}>
            {messages.length === 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.55 }}
              >
                <Shield size={38} color="#2563eb" strokeWidth={1.5} />
                <p style={{ margin: 0, fontSize: 14, color: '#172554', fontWeight: 900, textAlign: 'center' }}>
                  Ask about your policies
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600, textAlign: 'center' }}>
                  Example: “What is the incident response process?” or “How should assets be classified?”
                </p>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '12px 14px',
                      borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: m.role === 'user' ? '#172554' : 'white',
                      color: m.role === 'user' ? 'white' : '#1e293b',
                      border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                      boxShadow: m.role === 'assistant' ? '0 2px 10px rgba(0,0,0,0.03)' : 'none',
                      fontSize: 14,
                      lineHeight: 1.55,
                      fontWeight: 500,
                    }}
                  >
                    {m.text}
                    {m.citations && m.citations.length > 0 && m.role === 'assistant' && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Sources
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {m.citations.slice(0, 3).map((c) => (
                            <div key={c.policyId} style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                              {c.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <div style={{ padding: '12px 14px', borderRadius: '16px 16px 16px 4px', backgroundColor: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={16} color="#2563eb" />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: '#94a3b8', display: 'inline-block' }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8faff' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1.5px solid #2563eb',
                borderRadius: 12,
                backgroundColor: 'white',
                padding: '10px 12px',
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Ask about policies…"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#1e293b', backgroundColor: 'transparent' }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: !input.trim() || isTyping ? '#64748b' : '#2563eb',
                  cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Send"
              >
                <Send size={18} color="white" strokeWidth={2.5} />
              </motion.button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#cbd5e1', marginTop: 10, fontWeight: 600 }}>
              GuardAI may produce inaccurate information. Always verify with your team.
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 980px) {
          .admin-ai-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

