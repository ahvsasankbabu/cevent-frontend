import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { regAPI, certAPI, studentAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { GreenBg, Badge, Spinner, Toast, GhostBtn, ProfileIcon, FONT } from '../components/UI';

const TABS = ['Events', 'My Registrations', 'Certifications'];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [params]  = useSearchParams();
  const { user, logout } = useAuth();
  const initTab = params.get('tab') === 'certs' ? 'Certifications'
                : params.get('tab') === 'registrations' ? 'My Registrations' : 'My Registrations';
  const [tab, setTab]         = useState(initTab);
  const [regs, setRegs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') { navigate('/login'); return; }
    loadProfile();
  }, []);

  useEffect(() => {
    if (tab === 'My Registrations' || tab === 'Certifications') loadRegs();
    if (tab === 'Events') navigate('/');
  }, [tab]);

  const loadProfile = async () => {
    try {
      const res = await studentAPI.getProfile();
      setProfile(res.data.data);
    } catch {}
  };

  const loadRegs = async () => {
    setLoading(true);
    try {
      const res = await regAPI.myReg();
      setRegs(res.data.data || []);
    } catch { setRegs([]); }
    finally { setLoading(false); }
  };

  const downloadCert = async (regId) => {
    try {
      const res = await certAPI.myByReg(regId);
      const d   = res.data.data;
      if (d?.certificatePath) window.open(`${process.env.REACT_APP_API_BASE_URL}/`, '_blank');
      else setToast({ msg: 'Certificate not available yet', type: 'warning' });
    } catch {
      setToast({ msg: 'Certificate not available yet', type: 'warning' });
    }
  };

  const confirmedRegs = regs.filter(r => r.status === 'CONFIRMED');

  return (
    <GreenBg>
      {/* topbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '16px 28px 0' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: FONT }}>{user?.name}</span>
        <GhostBtn onClick={() => setShowProfile(p => !p)}>Profile</GhostBtn>
        <GhostBtn onClick={() => { logout(); navigate('/'); }}>Logout</GhostBtn>
        <ProfileIcon />
      </div>

      {/* profile panel */}
      {showProfile && (
        <ProfilePanel profile={profile} onClose={() => setShowProfile(false)} onUpdate={loadProfile} />
      )}

      {/* tabs */}
      <div style={{ padding: '24px 32px 0' }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: t === tab ? 'rgba(20,60,50,0.9)' : 'transparent',
              border: 'none',
              color: t === tab ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: t === tab ? 16 : 15, fontWeight: t === tab ? 700 : 400,
              padding: t === tab ? '8px 22px' : '8px 4px',
              borderRadius: t === tab ? 999 : 0,
              cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ height: 1, marginTop: 12, background: 'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)' }} />
      </div>

      {/* content */}
      <div style={{ padding: '28px 32px' }}>
        {loading ? <Spinner /> : (
          tab === 'My Registrations' ? (
            <div>
              <h2 style={{ fontFamily: FONT, color: '#fff', margin: '0 0 20px', fontWeight: 600, fontSize: 18 }}>
                My Registrations ({regs.length})
              </h2>
              {regs.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>No registrations yet.</p>
                : regs.map(r => <RegRow key={r.id} reg={r} onPay={() => navigate(`/pay/${r.id}`)} />)
              }
            </div>
          ) : tab === 'Certifications' ? (
            <div>
              <h2 style={{ fontFamily: FONT, color: '#fff', margin: '0 0 20px', fontWeight: 600, fontSize: 18 }}>
                My Certificates ({confirmedRegs.length})
              </h2>
              {confirmedRegs.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>No certificates available yet.</p>
                : confirmedRegs.map(r => (
                  <CertRow key={r.id} reg={r} onDownload={() => downloadCert(r.id)} />
                ))
              }
            </div>
          ) : null
        )}
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

function RegRow({ reg, onPay }) {
  const STATUS_COLORS = { CONFIRMED: 'green', PENDING: 'yellow', CANCELLED: 'gray', EXPIRED: 'red' };
  return (
    <div style={{
      background: 'rgba(30,50,45,0.5)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '16px 20px', marginBottom: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>
          {reg.eventName}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          {reg.festName} · {reg.collegeName}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
          {reg.eventDate} · {reg.venue}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {reg.fee === 0 ? 'Free' : `₹${reg.amountPaid > 0 ? reg.amountPaid : reg.fee}`}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {new Date(reg.registeredAt).toLocaleDateString()}
          </div>
        </div>
        <Badge label={reg.status} color={STATUS_COLORS[reg.status] || 'gray'} />
        {reg.status === 'PENDING' && (
          <button onClick={onPay} style={{
            background: '#eab308', border: 'none', color: '#000',
            borderRadius: 8, padding: '7px 16px', fontSize: 12,
            fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          }}>Pay Now</button>
        )}
      </div>
    </div>
  );
}

function CertRow({ reg, onDownload }) {
  return (
    <div style={{
      background: 'rgba(30,50,45,0.5)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '16px 20px', marginBottom: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>
          {reg.eventName}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          {reg.festName}
        </div>
      </div>
      <button onClick={onDownload} style={{
        background: 'transparent', border: '1.5px solid #67e8f9',
        color: '#67e8f9', borderRadius: 8, padding: '8px 20px',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
        display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(103,232,249,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download
      </button>
    </div>
  );
}

function ProfilePanel({ profile, onClose, onUpdate }) {
  const [form, setForm]     = useState(profile || {});
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (profile) {
        await studentAPI.updateProfile(form);
      } else {
        await studentAPI.createProfile(form);
      }
      onUpdate();
      onClose();
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Save failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const fields = [
    ['fullName','Full Name'], ['collegeName','College'], ['branch','Branch'],
    ['rollNumber','Roll Number'], ['year','Year'], ['phone','Phone'],
    ['city','City'], ['state','State'],
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
      background: '#0d1f1a', borderLeft: '1px solid rgba(255,255,255,0.1)',
      zIndex: 200, padding: 28, overflowY: 'auto',
      boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontFamily: FONT, color: '#fff', margin: 0 }}>
          {profile ? 'My Profile' : 'Create Profile'}
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fields.map(([k, label]) => (
          <div key={k}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 4, display: 'block', letterSpacing: 1 }}>
              {label.toUpperCase()}
            </label>
            <input value={form[k] || ''} onChange={e => set(k, e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 14, fontFamily: FONT, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
        <button onClick={save} disabled={saving} style={{
          marginTop: 8, padding: '12px', borderRadius: 8,
          background: '#22c55e', border: 'none', color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
        }}>{saving ? 'Saving...' : profile ? 'Save Profile' : 'Create Profile'}</button>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}