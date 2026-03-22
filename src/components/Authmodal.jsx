import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PillInput, DarkBtn, Toast, FONT } from './UI';

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab]       = useState(defaultTab);
  const [role, setRole]     = useState('STUDENT');
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const err = (msg) => setToast({ msg, type: 'error' });
  const ok  = (msg) => setToast({ msg, type: 'success' });

  const handleLogin = async () => {
    if (!form.email || !form.password) return err('Please fill all fields');
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      const d = res.data.data;
      login(d);
      onClose();
      if (d.role === 'COLLEGE') navigate('/college/dashboard');
      else if (d.role === 'ADMIN') navigate('/admin');
    } catch (e) {
      err(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword)
      return err('Please fill all fields');
    if (form.password !== form.confirmPassword) return err('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role });
      if (role === 'COLLEGE') {
        const lr = await authAPI.login({ email: form.email, password: form.password });
        login(lr.data.data);
        onClose();
        navigate('/college/setup');
      } else {
        ok('Account created! Please log in.');
        setTab('login');
        setForm({});
      }
    } catch (e) {
      err(e.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const handleForgot = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        await authAPI.forgotPassword(form.fpEmail);
        ok('OTP sent to your email');
        setStep(2);
      } else if (step === 2) {
        await authAPI.verifyOtp({ email: form.fpEmail, otp: form.otp });
        ok('OTP verified');
        setStep(3);
      } else {
        if (form.newPass !== form.confirmNewPass) return err('Passwords do not match');
        await authAPI.resetPassword({ email: form.fpEmail, newPassword: form.newPass, confirmPassword: form.confirmNewPass });
        ok('Password reset! Please log in.');
        setTab('login');
        setStep(1);
        setForm({});
      }
    } catch (e) {
      err(e.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backdropFilter: 'blur(12px)',
        background: 'rgba(0,0,0,0.55)',
      }} />

      {/* modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, pointerEvents: 'none',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#e879f9,#67e8f9)',
          borderRadius: 22, padding: 2,
          width: '100%', maxWidth: 460,
          pointerEvents: 'all',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'modalIn 0.25s ease',
          position: 'relative',
        }}>
          <div style={{ background: '#080808', borderRadius: 20, padding: 'clamp(28px,4vw,44px)' }}>

            {/* close */}
            <button onClick={onClose} style={{
              position: 'absolute', top: 12, right: 16,
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 20,
              cursor: 'pointer', fontFamily: FONT, zIndex: 1,
            }}>✕</button>

            {/* FORGOT PASSWORD */}
            {tab === 'forgot' ? (
              <>
                <h2 style={{ textAlign: 'center', color: '#fff', fontFamily: FONT, fontSize: 22, fontWeight: 700, margin: '0 0 28px' }}>
                  {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {step === 1 && <PillInput placeholder="Enter your email" value={form.fpEmail || ''} onChange={e => set('fpEmail', e.target.value)} />}
                  {step === 2 && <PillInput placeholder="Enter OTP" value={form.otp || ''} onChange={e => set('otp', e.target.value)} />}
                  {step === 3 && <>
                    <PillInput type="password" placeholder="New password" value={form.newPass || ''} onChange={e => set('newPass', e.target.value)} />
                    <PillInput type="password" placeholder="Confirm password" value={form.confirmNewPass || ''} onChange={e => set('confirmNewPass', e.target.value)} />
                  </>}
                  <DarkBtn onClick={handleForgot} style={{ width: '100%', marginTop: 4, letterSpacing: 1 }} disabled={loading}>
                    {loading ? '...' : step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                  </DarkBtn>
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, fontFamily: FONT }}>
                    <span onClick={() => { setTab('login'); setStep(1); }} style={{ color: '#67e8f9', cursor: 'pointer' }}>← Back to Login</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* tab switcher */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 4, marginBottom: 28 }}>
                  {['login', 'signup'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setForm({}); }} style={{
                      flex: 1, padding: '9px 0', borderRadius: 999, border: 'none',
                      background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontWeight: tab === t ? 700 : 400, fontSize: 15,
                      cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s',
                    }}>{t === 'login' ? 'User Login' : 'Sign up'}</button>
                  ))}
                </div>

                {/* role toggle for signup */}
                {tab === 'signup' && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
                    {['STUDENT', 'COLLEGE'].map(r => (
                      <button key={r} onClick={() => setRole(r)} style={{
                        padding: '7px 24px', borderRadius: 999, border: '1.5px solid',
                        borderColor: role === r ? '#67e8f9' : 'rgba(255,255,255,0.15)',
                        background: role === r ? 'rgba(103,232,249,0.1)' : 'transparent',
                        color: role === r ? '#67e8f9' : 'rgba(255,255,255,0.4)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
                        transition: 'all 0.2s',
                      }}>{r === 'STUDENT' ? '🎓 Student' : '🏫 College'}</button>
                    ))}
                  </div>
                )}

                {/* fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {tab === 'signup' && (
                    <PillInput placeholder={role === 'COLLEGE' ? 'College Admin Name' : 'Enter Full Name'}
                      value={form.name || ''} onChange={e => set('name', e.target.value)} />
                  )}
                  <PillInput type="email" placeholder="Enter e-mail"
                    value={form.email || ''} onChange={e => set('email', e.target.value)} />
                  <PillInput type="password" placeholder="Enter password"
                    value={form.password || ''} onChange={e => set('password', e.target.value)} />
                  {tab === 'signup' && (
                    <PillInput type="password" placeholder="Confirm Password"
                      value={form.confirmPassword || ''} onChange={e => set('confirmPassword', e.target.value)} />
                  )}
                  {tab === 'login' && (
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 4px', fontFamily: FONT }}>
                      <span onClick={() => setTab('forgot')} style={{ cursor: 'pointer' }}>forgot password?</span>
                    </p>
                  )}
                  <DarkBtn onClick={tab === 'login' ? handleLogin : handleSignup}
                    style={{ width: '100%', marginTop: 4, letterSpacing: 2 }} disabled={loading}>
                    {loading ? '...' : tab === 'login' ? 'LOGIN' : 'Create'}
                  </DarkBtn>
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '4px 0 0', fontFamily: FONT }}>
                    {tab === 'login'
                      ? <>Don't have an account? <span onClick={() => setTab('signup')} style={{ color: '#67e8f9', cursor: 'pointer' }}>Create</span></>
                      : <>Already have an account? <span onClick={() => setTab('login')} style={{ color: '#67e8f9', cursor: 'pointer' }}>Login</span></>
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}