import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, regAPI, festAPI, searchAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  GreenBg, SearchPill, Badge, Spinner, Toast, CategoryIcon,
  FONT, COLORS,
} from '../components/UI';
import AuthModal from '../components/Authmodal';

const CATEGORIES = ['ALL', 'TECHNICAL', 'CULTURAL', 'SPORTS', 'ARTS', 'WORKSHOP', 'OTHER'];

export default function FestDetailPage() {
  const { festId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [fest, setFest]         = useState(null);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch]     = useState('');
  const [slots, setSlots]       = useState({});
  const [toast, setToast]       = useState(null);
  const [registering, setRegistering] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const pollTimers = useRef({});
  const searchTimer = useRef(null);

  useEffect(() => {
    loadData();
    return () => Object.values(pollTimers.current).forEach(clearInterval);
  }, [festId, category]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [festRes, evRes] = await Promise.all([
        festAPI.getAll(),
        category === 'ALL'
          ? eventAPI.getByFest(festId)
          : eventAPI.getByCategory(festId, category),
      ]);
      const allFests = festRes.data.data || [];
      setFest(allFests.find(f => f.id === Number(festId)) || null);
      const evList = (evRes.data.data || []).filter(e => e.active);
setEvents(evList);
      evList.forEach(ev => initSlotPolling(ev));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!search.trim()) { loadData(); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await searchAPI.events(search);
        const filtered = (res.data.data || []).filter(e => e.festId === Number(festId));
        setEvents(filtered);
      } catch {}
    }, 400);
  }, [search]);

  const initSlotPolling = async (ev) => {
    await fetchSlot(ev.id);
  };

  const fetchSlot = async (eventId) => {
    try {
      const res = await eventAPI.slotStatus(eventId);
      const d   = res.data.data || res.data;
      setSlots(s => ({ ...s, [eventId]: d }));
      scheduleNextPoll(eventId, d);
    } catch {}
  };

  const scheduleNextPoll = (eventId, d) => {
    clearInterval(pollTimers.current[eventId]);
    if (!d) return;
    if (d.slotStatus === 'FULL') return;
    const available = d.availableSlots;
    let interval = null;
    if (d.slotStatus === 'PENDING_PAYMENT' || available <= 4) interval = 5000;
    else if (available <= 10) interval = 30000;
    if (interval) {
      pollTimers.current[eventId] = setInterval(() => fetchSlot(eventId), interval);
    }
  };

  const handleRegister = async (eventId, fee) => {
    if (!user) { setShowAuth(true); return; }
    if (user.role !== 'STUDENT') { setToast({ msg: 'Only students can register', type: 'error' }); return; }
    setRegistering(eventId);
    try {
      const res = await regAPI.register(eventId);
      const reg = res.data.data;
      if (fee === 0) {
        setToast({ msg: 'Registered successfully! (Free event)', type: 'success' });
      } else {
        navigate(`/pay/${reg.id}`);
      }
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Registration failed', type: 'error' });
    } finally { setRegistering(null); }
  };

  if (loading) return <GreenBg><Spinner /></GreenBg>;

  return (
    <GreenBg>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 32px 0' }}>
        <div>
          <button onClick={() => navigate('/')} style={{
            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontFamily: FONT, fontSize: 13, padding: 0, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          {fest && (
            <div>
              <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px,4vw,42px)', fontWeight: 800, margin: 0, letterSpacing: 1 }}>
                {fest.name.toUpperCase()}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '4px 0 0', fontFamily: FONT }}>
                {fest.venue}, {fest.city} · {fest.startDate} → {fest.endDate}
              </p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888' }} />
        </div>
      </div>

      {/* divider */}
      <div style={{ height: 1, margin: '16px 32px 0', background: 'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)' }} />

      {/* search + category filter */}
      <div style={{ padding: '20px 32px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <SearchPill placeholder="find event" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '6px 14px', borderRadius: 999, border: '1px solid',
              borderColor: category === c ? '#67e8f9' : 'rgba(255,255,255,0.15)',
              background: category === c ? 'rgba(103,232,249,0.1)' : 'transparent',
              color: category === c ? '#67e8f9' : 'rgba(255,255,255,0.5)',
              fontSize: 12, cursor: 'pointer', fontFamily: FONT,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.2s',
            }}>
              {c !== 'ALL' && <CategoryIcon category={c} size={13} />}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* events grid */}
      <div style={{ padding: '4px 32px 48px', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {events.length === 0
          ? <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>No events found.</p>
          : events.map(ev => (
            <EventCard
              key={ev.id} ev={ev}
              slot={slots[ev.id]}
              registering={registering === ev.id}
              onRegister={() => handleRegister(ev.id, ev.fee)}
              user={user}
            />
          ))
        }
      </div>

      {/* auth modal */}
      {showAuth && <AuthModal defaultTab="login" onClose={() => setShowAuth(false)} />}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

function EventCard({ ev, slot, registering, onRegister, user }) {
  const slotStatus = slot?.slotStatus;
  const available  = slot?.availableSlots;

  const regBtnStyle = () => {
    if (slotStatus === 'FULL') return { bg: '#333', color: '#666', disabled: true, label: 'Full', border: '1px solid rgba(255,255,255,0.1)' };
    if (slotStatus === 'PENDING_PAYMENT') return { bg: '#444', color: '#aaa', disabled: true, label: '⏱ Checking...', border: '1px solid rgba(255,255,255,0.1)' };
    if (!user) return { bg: 'transparent', color: '#67e8f9', disabled: false, label: 'Login to Register', border: '1.5px solid #67e8f9' };
    if (user.role === 'COLLEGE') return { bg: '#222', color: '#666', disabled: true, label: 'Students only', border: '1px solid rgba(255,255,255,0.1)' };
    return { bg: '#111', color: '#fff', disabled: false, label: registering ? '...' : 'Register', border: '1px solid rgba(255,255,255,0.2)' };
  };
  const btn = regBtnStyle();

  return (
    <div style={{
      background: 'rgba(25,45,40,0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '20px 22px',
      flex: '1 1 calc(50% - 8px)', minWidth: 260,
      backdropFilter: 'blur(6px)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(103,232,249,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: '#67e8f9', opacity: 0.7 }}><CategoryIcon category={ev.category} size={16} /></span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: FONT, letterSpacing: 1 }}>
              {ev.category}
            </span>
          </div>
          <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
            {ev.name}
          </h3>
          <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.7, fontFamily: FONT }}>
            <div>{ev.eventDate} · {ev.startTime?.slice(0,5)}</div>
            <div>{ev.venue}</div>
          </div>
          {slotStatus === 'FILLING_FAST' && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#eab308', fontFamily: FONT }}>
              ⚠ Only {available} slots left!
            </div>
          )}
          {slotStatus === 'PENDING_PAYMENT' && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#aaa', fontFamily: FONT }}>
              ⏱ Checking again in 5s...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, minWidth: 90 }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: '#fff' }}>
            {ev.fee === 0 ? 'Free' : `${ev.fee}/-`}
          </span>
          <button
            onClick={onRegister}
            disabled={btn.disabled || registering}
            style={{
              background: btn.bg, color: btn.color,
              border: btn.border,
              borderRadius: 8, padding: '8px 18px',
              fontSize: 13, fontWeight: 600,
              cursor: btn.disabled ? 'not-allowed' : 'pointer',
              fontFamily: FONT, transition: 'all 0.2s',
              opacity: btn.disabled ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!btn.disabled) e.currentTarget.style.background = btn.bg === 'transparent' ? 'rgba(103,232,249,0.08)' : '#222'; }}
            onMouseLeave={e => { if (!btn.disabled) e.currentTarget.style.background = btn.bg; }}
          >{btn.label}</button>
          {slot && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}>
              {slot.confirmedCount}/{slot.totalSlots} registered
            </span>
          )}
        </div>
      </div>

      {ev.description && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, margin: '12px 0 0', lineHeight: 1.6 }}>
          {ev.description}
        </p>
      )}
    </div>
  );
}