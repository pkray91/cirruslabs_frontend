'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { useCallback, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function HeroSection() {
  const isMobile = useIsMobile();
  const [splineLoaded, setSplineLoaded] = useState(false);

  const onLoad = useCallback((splineApp: Application) => {
    const allObjects = splineApp.getAllObjects();
    allObjects.forEach((obj: unknown) => {
      const o = obj as { name?: string; type?: string; visible?: boolean };
      const name = String(o.name ?? '').toLowerCase();
      if (
        name.includes('nexbot') ||
        name.includes('logo') ||
        name.startsWith('shape') ||
        (name.includes('text') && o.type === 'Text')
      ) {
        o.visible = false;
      }
    });
    setSplineLoaded(true);
  }, []);

  const titleSize = isMobile ? '13vw' : '9vw';
  const subtitleSize = isMobile ? '2.2vw' : '1.1vw';

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' }} />

      {/* Grid overlay */}
      <div className="grid-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.4 }} />

      {/* Spline — z: 2 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <Spline
          scene="https://prod.spline.design/xJQw8NjQdQUDOYlP/scene.splinecode"
          onLoad={onLoad}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '38%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',   // flush against the robot
        justifyContent: 'center',
        paddingRight: '1.5vw',
        gap: '12px',
      }}>
       
        <motion.h1
          className="orbitron"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: 'rgba(22, 51, 113, 0.55)',
            margin: 0,
            textAlign: 'right',
          }}
        >
          GUARD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: subtitleSize,
            fontWeight: 900,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(8, 25, 62, 0.55)',
            margin: 0,
            textAlign: 'right',
            lineHeight: 1.4,
          }}
        >
          AI COMPLIANCE AND
        </motion.p>
      </div>

      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '38%',
        height: '100%',
        zIndex: 3,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',  // flush against the robot
        justifyContent: 'center',
        paddingLeft: '2vw',
        gap: '12px',
      }}>
        {/* "GUARD" */}
        <motion.h1
          className="orbitron"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: 'rgba(8, 25, 62, 0.55)',
            margin: 0,
            textAlign: 'left',
          }}
        >
          AI
        </motion.h1>

        {/* "AI COMPLIANCE AND" */}
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: subtitleSize,
            fontWeight: 900,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(8, 25, 62, 0.55)',
            margin: 0,
            textAlign: 'left',
            lineHeight: 1.4,
          }}
        >
          POLICY ASSISTANT
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 4, pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 900, color: '#94a3b8' }}>Scroll</span>
          <div style={{ width: '1px', height: '40px', background: '#e2e8f0', overflow: 'hidden' }}>
            <motion.div
              style={{ width: '100%', height: '100%', background: '#2563eb', originY: 0 }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {!splineLoaded && (
          <motion.div
            key="loader"
            style={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginBottom: '32px' }}
            >
              <svg viewBox="0 0 80 80" fill="none" style={{ width: '64px', height: '64px' }}>
                <motion.path
                  d="M40 5L8 18v20c0 18.7 13.3 36.2 32 41C57.7 74.2 72 56.7 72 38V18L40 5z"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
            <p className="orbitron" style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 900, color: '#2563eb' }}>
              Initializing
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}