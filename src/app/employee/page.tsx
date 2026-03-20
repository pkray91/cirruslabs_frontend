'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { useCallback, useState, useRef, useEffect } from 'react';
import type { Application } from '@splinetool/runtime';
import { Send, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const BOT_RESPONSES = [
  "I'm analyzing your compliance data now. Everything looks good!",
  "Your AI policy report is ready. No critical violations found.",
  "I've scanned the latest regulatory updates. I'll brief you shortly.",
  "Access logs reviewed. All activity within normal parameters.",
  "Compliance check complete. Your systems are fully protected.",
];

export default function EmployeeDashboard() {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = useCallback((splineApp: Application) => {
    const allObjects = splineApp.getAllObjects();
    allObjects.forEach((obj: any) => {
      const name = obj.name.toLowerCase();
      if (
        name.includes('nexbot') ||
        name.includes('logo') ||
        name.startsWith('shape') ||
        (name.includes('text') && obj.type === 'Text')
      ) {
        obj.visible = false;
      }
    });
    setSplineLoaded(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)],
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor:  'var(--color-bg-light)', fontFamily: 'inherit' }}>

      {/* ── LEFT PANEL: Spline Bot ── */}
      <div style={{ position: 'relative', width: '45%', height: '100%', flexShrink: 0, backgroundColor: '#e8edf8', borderRight: '1px solid #c7d2fe' }}>

        {/* Date / time overlay */}
        

        {/* Spline */}
        <Spline
          scene="https://prod.spline.design/xJQw8NjQdQUDOYlP/scene.splinecode"
          onLoad={onLoad}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {!splineLoaded && (
            <motion.div
              key="loader"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute', inset: 0, zIndex: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor:'var(--color-bg-light-end)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ marginBottom: '20px' }}
              >
                <svg viewBox="0 0 80 80" fill="none" style={{ width: '52px', height: '52px' }}>
                  <motion.path
                    d="M40 5L8 18v20c0 18.7 13.3 36.2 32 41C57.7 74.2 72 56.7 72 38V18L40 5z"
                    fill="none" stroke="#2563eb" strokeWidth="2.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </svg>
              </motion.div>
              <p className="orbitron" style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 900, color: '#2563eb' }}>
                Initializing
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RIGHT PANEL: Chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8faff' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 32px', borderBottom: '1px solid #c7d2fe',
          backgroundColor: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', background: '#172554', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={15} color="white" />
            </div>
            <span className="orbitron" style={{ fontSize: '15px', fontWeight: 900, color: '#172554' }}>
              GUARD<span style={{ color: '#2563eb' }}>AI</span>
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginLeft: '8px', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '99px' }}>
              Employee Portal
            </span>
          </div>
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#475569', textDecoration: 'none' }}>
            <LogOut size={15} /> Sign out
          </Link>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4, pointerEvents: 'none' }}
            >
              <Shield size={36} color="#2563eb" strokeWidth={1.5} />
              <p style={{ fontSize: '40px', color: '#172554', fontWeight: 600, textTransform: 'uppercase' }}>Ask me anything about our Policy!!</p>
            </motion.div>
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
                }}
              >
                <div style={{
                  maxWidth: '72%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#172554' : 'white',
                  color: msg.role === 'user' ? 'white' : '#1e293b',
                  fontSize: '14px', fontWeight: 500, lineHeight: 1.5,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  border: msg.role === 'bot' ? '1px solid #e2e8f0' : 'none',
                }}>
                  {msg.role === 'bot' && (
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>
                      GuardAI
                    </span>
                  )}
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <div style={{ padding: '12px 18px', borderRadius: '16px 16px 16px 4px', backgroundColor: 'white', border: '1px solid #e2e8f0', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ padding: '20px 32px 28px', backgroundColor: '#f8faff' }}>
          {/* Prompt label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              textAlign: 'center', marginBottom: '12px',
              fontSize: '13px', fontWeight: 800,
              color: '#2563eb', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            How can I help you?
          </motion.p>

          {/* Input box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0',
              border: '1.5px solid #2563eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              style={{
                flex: 1, padding: '14px 18px',
                border: 'none', outline: 'none',
                fontSize: '14px', fontWeight: 500,
                color: '#1e293b', backgroundColor: 'transparent',
              }}
            />
            <motion.button
              whileHover={{ backgroundColor: '#1d4ed8' }}
              whileTap={{ scale: 0.93 }}
              onClick={handleSend}
              style={{
                width: '52px', height: '52px', flexShrink: 0,
                backgroundColor: '#2563eb', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {/* Triangle / send icon */}
              <Send size={18} color="white" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#cbd5e1', marginTop: '10px', fontWeight: 500 }}>
            GuardAI may produce inaccurate compliance information. Always verify with your team.
          </p>
        </div>
      </div>
    </div>
  );
}
