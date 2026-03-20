'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Shield, Activity, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findUser } from '@/lib/auth';
import { getNames } from "country-list";

const countries: string[] = getNames().sort();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [userType, setUserType] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Dev/Demo Bypass (if empty fields, skip auth for demo purposes)
    if (!email.trim() && !password.trim()) {
      if (userType === 'admin') router.push('/admin');
      else router.push('/employee');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const user = findUser(email);

    if (!user) {
      setError('Account does not exist. Please sign up first.');
      setLoading(false);
      return;
    }

    if (user.password !== password) {
      setError('Invalid username or password.');
      setLoading(false);
      return;
    }

    // Credentials match — route based on user type
    if (userType === 'admin') {
      router.push('/admin');
    } else if (userType === 'employee') {
      router.push('/employee');
    } else {
      router.push('/');
    }
  };
    
  return (
    <div className="auth-container">
      {/* Left Side: Form */}
      <div className="auth-form-side">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: '#172554', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="white" />
          </div>
          <span className="orbitron" style={{ fontSize: '18px', fontWeight: 900, color: '#172554' }}>
            GUARD<span style={{ color: '#2563eb' }}>AI</span>
          </span>
        </Link>

        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#172554', marginBottom: '12px' }}>
              Welcome back to GuardAI
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px', fontWeight: 500 }}>
              Enter your credentials to access your secure dashboard
            </p>

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
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Email address</label>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Password</label>
                  <Link href="#" style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>Forgot password?</Link>
                </div>
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

              {/* Country Selection */}
                            
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                  Select Country
                </label>

                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#172554',
                    outline: 'none'
                  }}
                >
                  <option value="">Select a country</option>

                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Select User</label>
                <select
                  value={userType}
                  onChange={e => setUserType(e.target.value)}
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 600, color: '#172554', outline: 'none' }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Sign In Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  backgroundColor: loading ? '#64748b' : '#172554',
                  color: 'white', fontSize: '15px', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </motion.button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Or Log in with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              {/* Microsoft */}
              <button type="button" className="glass-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#475569', marginTop: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Log in with Microsoft
              </button>

              <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '16px', fontWeight: 500 }}>
                Don&apos;t have an account? <Link href="/signup" style={{ color: '#172554', fontWeight: 800, textDecoration: 'none' }}>Create a new one</Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', paddingTop: '40px' }}>
          <Link href="#" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="#" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="#" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Cookie Settings</Link>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>© 2024 GuardAI Inc. All rights reserved.</p>
      </div>

      {/* Right Side: Info Panel */}
      <div className="auth-info-side">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div style={{ maxWidth: '400px', position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Shield size={32} color="#2563eb" />
          </motion.div>
          <h2 className="orbitron" style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900, color: 'white', marginBottom: '20px', lineHeight: 1.1 }}>
            Enterprise AI Security
          </h2>
          <p className="hidden-mobile" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px', lineHeight: 1.6 }}>
            AI Policy and Compliance Assistant
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 size={16} color="#2563eb" />
              <span style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>Compliance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Activity size={16} color="#2563eb" />
              <span style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>Audits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
