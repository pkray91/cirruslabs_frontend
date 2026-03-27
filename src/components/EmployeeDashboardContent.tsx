'use client';

import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { 
  Send, FileText, CheckCircle, Clock, 
  ChevronRight, AlertCircle, Shield
} from 'lucide-react';
import { sendChatMessage, listDocuments, APIError } from '@/lib/api';
import type { ChatRequest, SourceReference, DocumentInfo } from '@/types/api';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  sources?: SourceReference[];
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, role: 'bot', text: 'Hello! I\'m your policy assistant. I can help you understand company policies, procedures, and compliance requirements. Ask me anything about the policies you need to review or acknowledge!' },
];

export function EmployeeDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams?.get('tab') || 'overview') as 'overview' | 'chat';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session and documents on mount
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem('employee_chat_session_id');
    const savedMessages = sessionStorage.getItem('employee_chat_messages');
    const savedAcknowledgments = sessionStorage.getItem('employee_acknowledgments');
    
    if (savedSessionId) setSessionId(savedSessionId);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Failed to load saved messages:', e);
      }
    }
    if (savedAcknowledgments) {
      try {
        setAcknowledgedPolicies(new Set(JSON.parse(savedAcknowledgments)));
      } catch (e) {
        console.error('Failed to load acknowledgments:', e);
      }
    }

    loadDocuments();
  }, []);

  useEffect(() => {
    if (sessionId) sessionStorage.setItem('employee_chat_session_id', sessionId);
    if (messages.length > 0) sessionStorage.setItem('employee_chat_messages', JSON.stringify(messages));
  }, [sessionId, messages]);

  useEffect(() => {
    sessionStorage.setItem('employee_acknowledgments', JSON.stringify(Array.from(acknowledgedPolicies)));
  }, [acknowledgedPolicies]);

  const loadDocuments = async () => {
    try {
      setLoading(false);
      const response = await listDocuments();
      setDocuments(response.documents);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (documentId: string) => {
    setAcknowledgedPolicies(prev => new Set([...prev, documentId]));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const request: ChatRequest = {
        message: trimmed,
        session_id: sessionId || undefined,
        include_sources: true,
        max_sources: 5,
      };

      const response = await sendChatMessage(request);
      
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: response.message,
        sources: response.sources,
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      
      const errorMessage = err instanceof APIError ? `Error: ${err.message}` : 'Failed to get response. Please try again.';
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: `⚠️ ${errorMessage}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const acknowledgedDocs = documents.filter(doc => acknowledgedPolicies.has(doc.document_id));
  const pendingDocs = documents.filter(doc => !acknowledgedPolicies.has(doc.document_id));

  return (
    <div style={{ padding: '32px', flex: 1, backgroundColor: '#f8faff' }}>
      {activeTab === 'overview' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>My Policies</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Review and acknowledge company policies</p>
          </motion.div>
          {/* Stats Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Acknowledged', value: acknowledgedDocs.length, icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
              { label: 'Pending Review', value: pendingDocs.length, icon: Clock, color: '#d97706', bg: '#fffbeb' },
              { label: 'Total Policies', value: documents.length, icon: FileText, color: '#2563eb', bg: '#eff6ff' },
            ].map((card, i) => (
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
                  </div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

            {/* Pending Policies Section */}
            {pendingDocs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.35 }}
                style={{ marginBottom: '28px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <AlertCircle size={18} color="#d97706" />
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#172554', margin: 0 }}>
                    Pending Policies ({pendingDocs.length})
                  </h2>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {pendingDocs.map(doc => (
                    <motion.div
                      key={doc.document_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '14px',
                        padding: '20px',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={22} color="#d97706" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>{doc.filename}</h3>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleAcknowledge(doc.document_id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '10px 18px', borderRadius: '10px',
                          border: 'none', cursor: 'pointer',
                          backgroundColor: '#d97706', color: 'white',
                          fontSize: '13px', fontWeight: 700,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        Acknowledge <ChevronRight size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Acknowledged Policies Section */}
            {acknowledgedDocs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <CheckCircle size={18} color="#059669" />
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#172554', margin: 0 }}>
                    Acknowledged Policies ({acknowledgedDocs.length})
                  </h2>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {acknowledgedDocs.map(doc => (
                    <motion.div
                      key={doc.document_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '14px',
                        padding: '20px',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} color="#059669" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>{doc.filename}</h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', backgroundColor: '#ecfdf5' }}>
                        <CheckCircle size={14} color="#059669" />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>ACKNOWLEDGED</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Loading policies...</div>
              </div>
            )}

            {!loading && documents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '14px', fontWeight: 600 }}>No policies available yet</p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Chat Interface */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Ask GuardAI</h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Get instant answers about company policies</p>
            </motion.div>
            
            <div style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', maxWidth: '900px' }}>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                {messages.length === 0 && !isTyping && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
                    <Shield size={48} color="#2563eb" strokeWidth={1.5} />
                    <p style={{ fontSize: '18px', color: '#172554', fontWeight: 700, marginTop: '16px' }}>Ask me anything about company policies!</p>
                  </div>
                )}

              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        padding: '14px 18px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: msg.role === 'user' ? '#172554' : 'white',
                        color: msg.role === 'user' ? 'white' : '#1e293b',
                        fontSize: '14px', fontWeight: 500, lineHeight: 1.6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: msg.role === 'bot' ? '1px solid #e2e8f0' : 'none',
                      }}>
                        {msg.role === 'bot' && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                            GuardAI
                          </span>
                        )}
                        {msg.text}
                      </div>
                      
                      {msg.role === 'bot' && msg.sources && msg.sources.length > 0 && (
                        <div style={{ 
                          marginTop: '8px',
                          padding: '12px', 
                          backgroundColor: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            color: '#64748b',
                            marginBottom: '8px', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em' 
                          }}>
                            📚 Sources ({msg.sources.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {msg.sources.map((source, idx) => {
                              const hasVerbatim = source.verbatim_clause && source.verbatim_clause.trim().length > 0;
                              return (
                                <div 
                                  key={`${msg.id}-${source.document_name}-${source.page_number}-${idx}`} 
                                  title={hasVerbatim ? source.verbatim_clause : ''}
                                  style={{ 
                                    display: 'flex',
                                    fontSize: '11px',
                                    color: '#64748b',
                                    padding: '6px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    cursor: hasVerbatim ? 'help' : 'default'
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>{source.document_name}</span>&nbsp;
                                  {source.page_number && <span>p. {source.page_number}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'flex', gap: '4px',
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    width: 'fit-content',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb'
                      }}
                    />
                  ))}
                </motion.div>
              )}
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about policies..."
                  disabled={isTyping}
                  style={{
                    flex: 1, minHeight: '44px', maxHeight: '120px',
                    padding: '12px 16px', fontSize: '14px',
                    borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontFamily: 'inherit', resize: 'vertical',
                    color: '#1e293b', backgroundColor: isTyping ? '#f1f5f9' : 'white',
                    opacity: isTyping ? 0.6 : 1,
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: 'none', cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
                    backgroundColor: isTyping || !input.trim() ? '#cbd5e1' : '#2563eb',
                    color: 'white', fontWeight: 700, fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: isTyping || !input.trim() ? 0.7 : 1,
                  }}
                >
                  <Send size={16} /> Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
}
