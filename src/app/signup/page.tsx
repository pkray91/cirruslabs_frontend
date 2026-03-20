'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Shield, User, Cloud, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findUser, saveUser } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (findUser(email)) {
      setError('An account with this email already exists.');
      return;
    }

    setLoading(true);
    saveUser({ name, email, password });
    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  return (
    <div className="auth-container">
      {/* Side: Info Panel */}
      <div className="auth-info-side" style={{ order: 2 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #172554 0%, #0d1633 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, marginTop: '20px', maxWidth: '500px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(37, 99, 235, 0.15)', padding: '8px 16px',
            borderRadius: '99px', border: '1px solid rgba(37, 99, 235, 0.3)', marginBottom: '24px'
          }}>
            <Zap size={14} color="#2563eb" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Powered</span>
          </div>

          <h2 className="orbitron" style={{ fontSize: 'clamp(32px, 8vw, 64px)', fontWeight: 900, color: 'white', marginBottom: '24px', lineHeight: 1 }}>
            Securing the frontier with <span style={{ color: '#2563eb' }}>Intelligence.</span>
          </h2>

          <p className="hidden-mobile" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px', lineHeight: 1.6 }}>
            Join over 10,000 enterprises using neural-network monitoring to preemptively stop threats.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
            {[
              { icon: ActivityIcon, text: 'Real-time' },
              { icon: BrainIcon, text: 'Adaptive' },
              { icon: Shield, text: 'Zero Trust' },
              { icon: Cloud, text: 'Cloud Native' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <item.icon size={18} color="#2563eb" />
                <span style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side: Form */}
      <div className="auth-form-side" style={{ order: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="white" />
          </div>
          <span className="orbitron" style={{ fontSize: '18px', fontWeight: 900, color: '#172554' }}>
            GUARD<span style={{ color: '#2563eb' }}>AI</span>
          </span>
        </Link>

        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#172554', marginBottom: '12px' }}>
              Create your account
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px', fontWeight: 500 }}>
              Experience next-gen AI-powered protection.
            </p>

            {/* Success Banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '12px', padding: '14px 16px', marginBottom: '20px'
                  }}
                >
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#15803d' }}>
                    Account created successfully! Redirecting to login…
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '12px', padding: '14px 16px', marginBottom: '20px'
                  }}
                >
                  <AlertCircle size={18} color="#dc2626" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 50px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 50px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '14px 44px 14px 50px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || success}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  backgroundColor: loading || success ? '#64748b' : '#172554',
                  color: 'white', fontSize: '15px', fontWeight: 800,
                  cursor: loading || success ? 'not-allowed' : 'pointer', marginTop: '8px'
                }}
              >
                {success ? 'Redirecting…' : loading ? 'Creating…' : 'Create Account'}
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Or continue with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              <button type="button" className="glass-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#475569' }}>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Sign up with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '16px', fontWeight: 500 }}>
                Already have an account? <Link href="/login" style={{ color: '#172554', fontWeight: 800, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Inline icon helpers (avoid lucide naming conflicts)
function BrainIcon(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg {...rest} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v.17a3 3 0 0 1-1.3 2.51 5.8 5.8 0 0 1-1.2 6.1l.1.1a3 3 0 0 1 4.5 4v1.12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V18.9a3 3 0 0 1 4.5-4l.1-.1a5.8 5.8 0 0 1-1.2-6.1A3 3 0 0 1 15 5.17V5a3 3 0 0 0-3-3Z" />
      <path d="M9 13.5h0" /><path d="M15 13.5h0" />
    </svg>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg {...rest} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
