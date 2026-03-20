'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
const navLinks = [
 
];

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="navbar-fixed"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5vw',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e2e8f0',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#172554', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="white" />
            </div>
          </div>
          <span className="orbitron" style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.2em', color: '#172554' }}>
            GUARD<span style={{ color: '#2563eb' }}>AI</span>
          </span>
        </motion.div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }} className="hidden-mobile">
          
        </div>

        {/* Desktop Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-button"
              style={{ 
                padding: '10px 24px', 
                fontSize: '10px', 
                fontWeight: 900, 
                letterSpacing: '0.2em', 
                textTransform: 'uppercase', 
                color: '#475569', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Login
            </motion.button>
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-button"
              style={{ 
                padding: '10px 24px', 
                background: 'var(--primary-royal)',
                color: 'white', 
                fontSize: '10px', 
                fontWeight: 900, 
                letterSpacing: '0.2em', 
                textTransform: 'uppercase', 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="visible-mobile">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#172554', 
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              height: '100vh',
              background: 'white',
              zIndex: 999,
              padding: '100px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '40px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
            </div>

            <div style={{ height: '1px', background: '#e2e8f0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <button
                  className="glass-button"
                  style={{ 
                    width: '100%',
                    padding: '16px', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    color: '#475569', 
                    borderRadius: '12px'
                  }}
                >
                  Login
                </button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <button
                  className="glass-button"
                  style={{ 
                    width: '100%',
                    padding: '16px', 
                    background: 'var(--primary-royal)',
                    color: 'white', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    borderRadius: '12px',
                    border: 'none'
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
