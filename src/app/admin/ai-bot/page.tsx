'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Settings, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, role: 'bot', text: 'Hello Admin. System operations nominal. I can assist with bulk policy updates, employee log tracing, or running specialized security audits.' },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'bot',
        text: 'Action executing. I am cross-referencing global security logs with your request. This will take a moment.'
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172554', margin: 0 }}>Lead AI Assistant</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>Unrestricted admin-level system access.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: 'transparent', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Settings size={15} /> Bot Configuration
        </button>
      </motion.div>

      {/* Chat Container */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f8fafc' }}>
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: '12px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                {msg.role === 'bot' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#172554', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    <Bot size={16} color="white" />
                  </div>
                )}
                
                <div style={{
                  maxWidth: '75%', padding: '14px 18px',
                  backgroundColor: msg.role === 'user' ? '#2563eb' : 'white',
                  color: msg.role === 'user' ? 'white' : '#334155',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: msg.role === 'bot' ? '1px solid #e2e8f0' : 'none',
                  fontSize: '14px', lineHeight: 1.5, fontWeight: 500,
                  boxShadow: msg.role === 'bot' ? '0 2px 8px rgba(0,0,0,0.02)' : 'none'
                }}>
                  {msg.text}
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
              onKeyDown={e => e.key === 'Enter' && handleSend()}
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
