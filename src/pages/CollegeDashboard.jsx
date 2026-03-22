import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeAPI } from '../api';
import { useAuth } from '../context/AuthContext';

import { GreenBg, Spinner, GhostBtn, ProfileIcon, FONT, HomeBtn } from '../components/UI';

export default function CollegeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [college, setCollege]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'COLLEGE') { navigate('/login'); return; }
    loadCollege();
  }, []);

  const loadCollege = async () => {
    try {
      const res = await collegeAPI.me();
      setCollege(res.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <GreenBg><Spinner /></GreenBg>;

  const isPending = !college || college.status === 'PENDING';

  if (isPending) return (
    <GreenBg>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 28px 0' }}>
        <GhostBtn onClick={() => { logout(); navigate('/'); }}>Logout</GhostBtn>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 'calc(100vh - 60px)',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>⏳</div>
        <h2 style={{ fontFamily: FONT, color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 12px' }}>
          Waiting for Approval
        </h2>
        <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 400, lineHeight: 1.7, margin: '0 0 8px' }}>
          Your college account is pending admin approval. You'll get full access once approved.
        </p>
        <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          {college?.collegeName || user?.name}
        </p>
      </div>
    </GreenBg>
  );

  return (
    <GreenBg>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '16px 28px 0' }}>
        <HomeBtn onClick={() => navigate('/')} />
        <GhostBtn onClick={() => { logout(); navigate('/'); }}>Logout</GhostBtn>
        <ProfileIcon />
      </div>
      
      <div style={{ textAlign: 'center', padding: '60px 32px 0' }}>
        <h1 style={{
          fontFamily: FONT, fontSize: 'clamp(28px,5vw,52px)',
          fontWeight: 300, letterSpacing: 3, color: '#fff', margin: 0,
        }}>
          {college?.collegeName || user?.name || 'CLG_NAME'}
        </h1>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 40,
        padding: '80px 32px 0', flexWrap: 'wrap',
      }}>
        <DashButton label="Create Fest" onClick={() => navigate('/college/create-fest')} />
        <DashButton label="Manage" onClick={() => navigate('/college/fests')} />
      </div>
    </GreenBg>
  );
}

function DashButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(220,225,220,0.88)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#111',
      borderRadius: 999,
      padding: '20px 60px',
      fontSize: 20, fontWeight: 500,
      cursor: 'pointer', fontFamily: FONT,
      minWidth: 220,
      boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(240,245,240,0.95)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(220,225,220,0.88)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >{label}</button>
  );
}