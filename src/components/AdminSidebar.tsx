'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Employee Dashboard', href: '/admin',          icon: LayoutDashboard },
  { label: 'Company Policies', href: '/admin/policies',  icon: FileText        },
  { label: 'Compliance Check', href: '/admin/compliance',icon: ShieldCheck     },
  { label: 'AI Assistant',     href: '/admin/ai-bot',    icon: Bot             },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height: '100vh',
        backgroundColor: '#172554',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        boxShadow: '4px 0 24px rgba(23,37,84,0.18)',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: '64px',
      }}>
        <div style={{ width: '30px', height: '30px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={16} color="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="orbitron"
              style={{ fontSize: '14px', fontWeight: 900, color: 'white', whiteSpace: 'nowrap' }}
            >
              GUARD<span style={{ color: '#60a5fa' }}>AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div style={{ padding: '10px 20px 6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Admin Panel
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                whileHover={{ backgroundColor: isActive ? 'rgba(37,99,235,0.9)' : 'rgba(255,255,255,0.08)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px 0' : '11px 20px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  margin: '0 8px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(37,99,235,0.85)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: '3px', borderRadius: '0 3px 3px 0',
                      backgroundColor: '#60a5fa',
                    }}
                    transition={{ duration: 0.25 }}
                  />
                )}
                <Icon
                  size={18}
                  color={isActive ? 'white' : 'rgba(255,255,255,0.55)'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 0 8px' }}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: collapsed ? '12px 0' : '11px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              margin: '0 8px', borderRadius: '10px', cursor: 'pointer',
            }}
          >
            <LogOut size={16} color="rgba(255,255,255,0.4)" />
            {!collapsed && (
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                Sign out
              </span>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Collapse toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'absolute', top: '50%', right: '-12px', transform: 'translateY(-50%)',
          width: '24px', height: '24px', borderRadius: '50%',
          backgroundColor: '#2563eb', border: '2px solid #172554',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 20,
        }}
      >
        {collapsed
          ? <ChevronRight size={11} color="white" strokeWidth={3} />
          : <ChevronLeft size={11} color="white" strokeWidth={3} />
        }
      </motion.button>
    </motion.aside>
  );
}
