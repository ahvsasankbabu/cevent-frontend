import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, collegeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PurpleBg, GradCard, PillInput, DarkBtn, Toast, FONT } from '../components/UI';

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab]         = useState(mode); // 'login' | 'signup'
  const [role, setRole]       = useState('STUDENT'); // 'STUDENT' | 'COLLEGE'
  const [step, setStep]       = useState(1); // for forgot password
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const err = (msg) => setToast({ msg, type: 'error' });
  const ok  = (msg) => setToast({ msg, type: 'success' });

  // ── LOGIN ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) return err('Please fill all fields');
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      const d = res.data.data;
      login(d);
      if (d.role === 'STUDENT') navigate('/dashboard');
      else if (d.role === 'COLLEGE') navigate('/college/dashboard');
      else if (d.role === 'ADMIN') navigate('/admin');
    } catch (e) {
      err(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // ── SIGNUP ────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword)
      return err('Please fill all fields');
    if (form.password !== form.confirmPassword) return err('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role });
      // College also needs college profile created after register
      if (role === 'COLLEGE') {
        // login first to get token
        const lr = await authAPI.login({ email: form.email, password: form.password });
        login(lr.data.data);
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

  // ── FORGOT PASSWORD ───────────────────────────────────────────────
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
        setShowForgot(false);
        setStep(1);
        setForm({});
      }
    } catch (e) {
      err(e.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  // ── FORGOT PASSWORD UI ────────────────────────────────────────────
  if (showForgot) return (
    <PurpleBg>
      <div style={{ padding: '28px 32px' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: FONT }}>Cevent</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 90px)', padding: 20 }}>
        <GradCard style={{ width: '100%', maxWidth: 460 }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 28px' }}>
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {step === 1 && <PillInput placeholder="Enter your email" value={form.fpEmail || ''} onChange={e => set('fpEmail', e.target.value)} />}
            {step === 2 && <PillInput placeholder="Enter OTP" value={form.otp || ''} onChange={e => set('otp', e.target.value)} />}
            {step === 3 && <>
              <PillInput type="password" placeholder="New password" value={form.newPass || ''} onChange={e => set('newPass', e.target.value)} />
              <PillInput type="password" placeholder="Confirm password" value={form.confirmNewPass || ''} onChange={e => set('confirmNewPass', e.target.value)} />
            </>}
            <DarkBtn onClick={handleForgot} style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? '...' : step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
            </DarkBtn>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
              <span onClick={() => { setShowForgot(false); setStep(1); }} style={{ color: '#67e8f9', cursor: 'pointer' }}>← Back to Login</span>
            </p>
          </div>
        </GradCard>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </PurpleBg>
  );

  // ── MAIN AUTH UI ──────────────────────────────────────────────────
  return (
    <PurpleBg>
      {/* logo */}
      <div style={{ padding: '28px 32px' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: FONT }}>Cevent</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 90px)', padding: 20 }}>
        <GradCard style={{ width: '100%', maxWidth: 480 }}>

          {/* tab switch login / signup */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 28, background: 'rgba(255,255,255,0.07)', borderRadius: 999, padding: 4 }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setForm({}); }} style={{
                flex: 1, padding: '9px 0', borderRadius: 999, border: 'none',
                background: tab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)',
                fontWeight: tab === t ? 700 : 400, fontSize: 15,
                cursor: 'pointer', fontFamily: FONT, textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}>{t === 'login' ? 'User Login' : 'Sign up'}</button>
            ))}
          </div>

          {/* signup: role toggle */}
          {tab === 'signup' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
              {['STUDENT', 'COLLEGE'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: '7px 24px', borderRadius: 999,
                  border: '1.5px solid',
                  borderColor: role === r ? '#67e8f9' : 'rgba(255,255,255,0.2)',
                  background: role === r ? 'rgba(103,232,249,0.12)' : 'transparent',
                  color: role === r ? '#67e8f9' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
                  transition: 'all 0.2s',
                }}>{r === 'STUDENT' ? '🎓 Student' : '🏫 College'}</button>
              ))}
            </div>
          )}

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
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 4px' }}>
                <span onClick={() => setShowForgot(true)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                  forgot password?
                </span>
              </p>
            )}

            <DarkBtn onClick={tab === 'login' ? handleLogin : handleSignup}
              style={{ width: '100%', marginTop: 4, letterSpacing: 2 }} disabled={loading}>
              {loading ? '...' : tab === 'login' ? 'LOGIN' : 'Create'}
            </DarkBtn>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '4px 0 0' }}>
              {tab === 'login'
                ? <>Don't have an account? <span onClick={() => setTab('signup')} style={{ color: '#67e8f9', cursor: 'pointer' }}>Create</span></>
                : <>Already have an account? <span onClick={() => setTab('login')} style={{ color: '#67e8f9', cursor: 'pointer' }}>Login</span></>
              }
            </p>
          </div>
        </GradCard>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </PurpleBg>
  );
}
