import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { festAPI, searchAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  GreenBg, SearchPill, GhostBtn, Badge, Spinner, Toast,
  ProfileIcon, FONT, COLORS,
} from '../components/UI';
import AuthModal from '../components/Authmodal';

const TABS = ['Events', 'My Registrations', 'Certifications'];
const CITIES = ['All Cities', 'Hyderabad', 'Nellore', 'Vijayawada', 'Chennai', 'Bangalore'];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab]           = useState('Events');
  const [fests, setFests]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [city, setCity]         = useState('All Cities');
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [toast, setToast]       = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab]   = useState('login');
  const searchTimer = useRef(null);

  const openLogin  = () => { setAuthTab('login');  setShowAuth(true); };
  const openSignup = () => { setAuthTab('signup'); setShowAuth(true); };

  const handleTab = (t) => {
    if ((t === 'My Registrations' || t === 'Certifications') && !user) {
      openLogin();
      return;
    }
    if (t === 'My Registrations') { navigate('/dashboard?tab=registrations'); return; }
    if (t === 'Certifications')   { navigate('/dashboard?tab=certs'); return; }
    setTab(t);
  };

  useEffect(() => {
    loadFests();
  }, [city]);

  const loadFests = async () => {
    setLoading(true);
    try {
      let res;
      if (city !== 'All Cities') {
        res = await searchAPI.byCity(city);
      } else {
        res = await festAPI.getAll();
      }
      setFests(res.data.data || []);
    } catch { setFests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!search.trim()) { loadFests(); return; }
    searchTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAPI.fests(search);
        setFests(res.data.data || []);
      } catch { setFests([]); }
      finally { setLoading(false); }
    }, 400);
  }, [search]);

  return (
    <GreenBg>
      {/* topbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '16px 28px 0' }}>
        {!user ? (
          <>
            <GhostBtn onClick={openLogin}>Login</GhostBtn>
            <GhostBtn onClick={openSignup}>Sign up</GhostBtn>
          </>
        ) : (
          <>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: FONT }}>
              {user.name}
            </span>
            {user.role === 'STUDENT' && (
              <GhostBtn onClick={() => navigate('/dashboard')}>Dashboard</GhostBtn>
            )}
            {user.role === 'COLLEGE' && (
              <GhostBtn onClick={() => navigate('/college/dashboard')}>Dashboard</GhostBtn>
            )}
            {user.role === 'ADMIN' && (
              <GhostBtn onClick={() => navigate('/admin')}>Admin Panel</GhostBtn>
            )}
            <GhostBtn onClick={logout}>Logout</GhostBtn>
          </>
        )}
        <ProfileIcon />
      </div>

      {/* tabs */}
      <div style={{ padding: '24px 32px 0' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => handleTab(t)} style={{
              background: t === 'Events' ? 'rgba(20,60,50,0.9)' : 'transparent',
              border: 'none',
              color: t === 'Events' ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: t === 'Events' ? 16 : 15,
              fontWeight: t === 'Events' ? 700 : 400,
              padding: t === 'Events' ? '8px 22px' : '8px 4px',
              borderRadius: t === 'Events' ? 999 : 0,
              cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ height: 1, marginTop: 12, background: 'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)' }} />
      </div>

      {/* search + city filter */}
      <div style={{ padding: '24px 32px 12px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <SearchPill placeholder="find events" value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowCityDrop(d => !d)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: FONT,
          }}>
            <svg width="16" height="16" fill="none" stroke="#67e8f9" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {city}
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showCityDrop && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 100,
              background: '#0d1f1a', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, overflow: 'hidden', minWidth: 160,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {CITIES.map(c => (
                <div key={c} onClick={() => { setCity(c); setShowCityDrop(false); }} style={{
                  padding: '10px 18px', cursor: 'pointer', fontSize: 14,
                  color: c === city ? '#67e8f9' : 'rgba(255,255,255,0.7)',
                  fontFamily: FONT, transition: 'background 0.15s',
                  background: c === city ? 'rgba(103,232,249,0.08)' : 'transparent',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = c === city ? 'rgba(103,232,249,0.08)' : 'transparent'}
                >{c}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* fests grid */}
      <div style={{ padding: '8px 32px 48px', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {loading ? <Spinner /> : fests.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT, padding: '20px 0' }}>No fests found.</p>
        ) : (
          fests.map(f => <FestCard key={f.id} fest={f} onOpen={() => navigate(`/fest/${f.id}`)} />)
        )}
      </div>

      {/* auth modal */}
      {showAuth && (
        <AuthModal defaultTab={authTab} onClose={() => setShowAuth(false)} />
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

function FestCard({ fest, onOpen }) {
  return (
    <div style={{
      background: 'rgba(30,50,45,0.55)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '22px 24px',
      display: 'flex', flexDirection: 'column', gap: 10,
      flex: '1 1 calc(50% - 16px)', minWidth: 280,
      backdropFilter: 'blur(6px)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(103,232,249,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      <Badge label={fest.active ? 'Active' : 'Inactive'} color={fest.active ? 'green' : 'gray'} />
      <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 0.5, marginTop: 4, fontFamily: FONT }}>
        {fest.name}
      </div>
      <div style={{ color: '#ccc', fontSize: 14, lineHeight: 1.9, fontFamily: FONT }}>
        <div>Date: {fest.startDate} → {fest.endDate}</div>
        <div>Venue: {fest.venue}, {fest.city}</div>
        <div>Events: {fest.totalEvents}</div>
        <div>Fee: Starts from {fest.startingFee}/-</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>{fest.collegeName}</span>
        <button onClick={onOpen} style={{
          background: 'rgba(220,220,220,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', borderRadius: 999, padding: '8px 24px',
          fontSize: 14, cursor: 'pointer', fontFamily: FONT,
          backdropFilter: 'blur(4px)', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = 'rgba(220,220,220,0.28)'}
          onMouseLeave={e => e.target.style.background = 'rgba(220,220,220,0.15)'}
        >Events</button>
      </div>
    </div>
  );
}