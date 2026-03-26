'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Settings, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, APIError } from '@/lib/api';
import type { ChatRequest, SourceReference } from '@/types/api';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  sources?: SourceReference[];
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, role: 'bot', text: 'Hello! I\'m your document Q&A assistant powered by a hybrid GraphRAG system. I can help you find information from your policy documents by searching through content and exploring relationships between concepts. I provide accurate answers with source citations. What would you like to know?' },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load session from sessionStorage on mount
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem('admin_chat_session_id');
    const savedMessages = sessionStorage.getItem('admin_chat_messages');
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
    
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
  }, []);

  // Save session to sessionStorage on changes
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('admin_chat_session_id', sessionId);
    }
    if (messages.length > 0) {
      sessionStorage.setItem('admin_chat_messages', JSON.stringify(messages));
    }
  }, [sessionId, messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const newMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const request: ChatRequest = {
        message: newMsg.text,
        session_id: sessionId || undefined,
        include_sources: true,
        max_sources: 5,
      };

      const response = await sendChatMessage(request);
      
      // Update session ID if this is the first message
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
      
      let errorMessage = 'Failed to get response. Please try again.';
      if (err instanceof APIError) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Add error message to chat
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

  return (
    <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Lead AI Assistant</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Unrestricted admin-level system access.</p>
      </motion.div>

      {/* Chat Container */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f8fafc' }}>
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: '12px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}
              >
                {msg.role === 'bot' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#172554', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    <Bot size={16} color="white" />
                  </div>
                )}
                
                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    padding: '14px 18px',
                    backgroundColor: msg.role === 'user' ? '#2563eb' : 'white',
                    color: msg.role === 'user' ? 'white' : '#334155',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.role === 'bot' ? '1px solid #e2e8f0' : 'none',
                    fontSize: '14px', lineHeight: 1.5, fontWeight: 500,
                    boxShadow: msg.role === 'bot' ? '0 2px 8px rgba(0,0,0,0.02)' : 'none'
                  }}>
                    {msg.text}
                  </div>

                  {/* Display sources if available */}
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
                                alignItems: 'flex-start',
                                gap: '8px',
                                fontSize: '12px',
                                color: '#475569',
                                cursor: hasVerbatim ? 'help' : 'default',
                                padding: '6px',
                                borderRadius: '6px',
                                transition: 'background-color 0.2s',
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                if (hasVerbatim) {
                                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: '#f97316',
                                marginTop: '6px',
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                  {source.document_name}
                                  {hasVerbatim && (
                                    <span style={{ 
                                      marginLeft: '6px',
                                      fontSize: '10px',
                                      color: '#94a3b8',
                                      fontWeight: 500
                                    }}>
                                      (hover for excerpt)
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                  {source.section_heading && source.section_heading !== 'Unknown' && <span>{source.section_heading}</span>}
                                  {source.section_heading && source.section_heading !== 'Unknown' && source.page_number && <span> • </span>}
                                  {source.page_number && <span>Page {source.page_number}</span>}
                                  {Boolean(source.relevance_score) && (
                                    <span style={{ 
                                      marginLeft: '8px',
                                      padding: '2px 6px',
                                      backgroundColor: '#dbeafe',
                                      color: '#1e40af',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      fontWeight: 600
                                    }}>
                                      {Math.round(source.relevance_score * 100)}% match
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    <User size={16} color="#64748b" />
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#172554', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                  <Sparkles size={16} color="#60a5fa" />
                </div>
                <div style={{ padding: '16px 20px', backgroundColor: 'white', borderRadius: '18px 18px 18px 4px', border: '1px solid #e2e8f0', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '6px 6px 6px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'border-color 0.2s' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or input admin command…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#1e293b' }}
            />
            <motion.button onClick={handleSend} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#172554', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Send size={16} color="white" />
            </motion.button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#cbd5e1', marginTop: '12px', fontWeight: 500 }}>
            Super-user access granted. Use AI tooling responsibly.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
