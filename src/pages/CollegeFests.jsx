import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { festAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  GreenBg, SearchPill, Spinner, Toast,
  PillInput, DarkBtn, FONT, HomeBtn,
} from '../components/UI';

// ── MY FESTS LIST ─────────────────────────────────────────────────────────────
export function CollegeFestsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [fests, setFests]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [selectedFest, setSelectedFest] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'COLLEGE') { navigate('/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const res = await festAPI.getMine();
      setFests(res.data.data || []);
    } catch { setFests([]); }
    finally { setLoading(false); }
  };

  const filtered = fests.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GreenBg>
      {/* topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <HomeBtn onClick={() => navigate('/')} />
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#3b82f6', fontFamily: FONT, fontSize: 13, fontWeight: 700,
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Filter by date
          </button>
          <SearchPill placeholder="find Fests" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: FONT, fontSize: 'clamp(18px,3vw,32px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 2 }}>
            {user?.name?.toUpperCase() || 'CLG_NAME'}
          </h1>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888' }} />
        </div>
      </div>

      <div style={{ height: 1, margin: '16px 28px 0', background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent)' }} />

      {/* table */}
      <div style={{ padding: '20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1.2fr 0.8fr 1fr', padding: '0 28px', marginBottom: 4 }}>
          {['Fest_Id','Fest_Name','Start_Date','End_Date','Status',''].map(h => (
            <span key={h} style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{h}</span>
          ))}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT, padding: '20px 28px' }}>No fests found.</p>
        ) : filtered.map(f => (
          <div key={f.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1.2fr 0.8fr 1fr',
            padding: '14px 28px',
            background: 'rgba(190,210,200,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 8, alignItems: 'center',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(190,210,200,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(190,210,200,0.1)'}
          >
            <span style={{ fontFamily: FONT, fontSize: 14, color: '#ddd' }}>{f.id}</span>
            <span
              onClick={() => navigate(`/college/fest/${f.id}/events`)}
              style={{ fontFamily: FONT, fontSize: 14, color: '#ddd', cursor: 'pointer' }}
            >{f.name}</span>
            <span style={{ fontFamily: FONT, fontSize: 14, color: '#ddd' }}>{f.startDate}</span>
            <span style={{ fontFamily: FONT, fontSize: 14, color: '#ddd' }}>{f.endDate}</span>
            <span style={{
              fontFamily: FONT, fontSize: 11, fontWeight: 700,
              color: f.active ? '#22c55e' : '#ef4444',
              background: f.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '3px 10px', borderRadius: 999, display: 'inline-block',
            }}>{f.active ? 'Active' : 'Inactive'}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span
                onClick={() => navigate(`/college/fest/${f.id}/events`)}
                style={{ color: '#67e8f9', cursor: 'pointer', fontFamily: FONT, fontSize: 13 }}
              >Events</span>
              <span
                onClick={() => setSelectedFest(f)}
                style={{ color: '#3b82f6', cursor: 'pointer', fontFamily: FONT, fontSize: 13 }}
              >Manage</span>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => navigate('/college/create-fest')} style={{
        position: 'fixed', bottom: 32, right: 32,
        background: 'rgba(255,255,255,0.1)',
border: '1px solid rgba(255,255,255,0.2)',
borderRadius: 999, padding: '14px 28px',
color: '#fff', fontSize: 14, fontWeight: 700,
cursor: 'pointer', fontFamily: FONT,
backdropFilter: 'blur(12px)',
boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create Fest
      </button>

      {/* Manage Fest Drawer */}
      {selectedFest && (
        <ManageFestDrawer
          fest={selectedFest}
          onClose={() => setSelectedFest(null)}
          onUpdated={() => { setSelectedFest(null); load(); }}
        />
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

// ── MANAGE FEST DRAWER ────────────────────────────────────────────────────────
function ManageFestDrawer({ fest, onClose, onUpdated }) {
  const [form, setForm]       = useState({
    name:         fest.name || '',
    description:  fest.description || '',
    startDate:    fest.startDate || '',
    endDate:      fest.endDate || '',
    venue:        fest.venue || '',
    city:         fest.city || '',
    startingFee:  fest.startingFee ?? '',
  });
  const [active, setActive]   = useState(fest.active ?? true);
  const [saving, setSaving]   = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast]     = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await festAPI.update(fest.id, { ...form, startingFee: Number(form.startingFee) });
      setToast({ msg: 'Fest updated!', type: 'success' });
      setTimeout(() => onUpdated(), 800);
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Update failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const toggleActive = async () => {
    setToggling(true);
    try {
      if (active) {
        await festAPI.deactivate(fest.id);
        setActive(false);
        setToast({ msg: 'Fest deactivated', type: 'warning' });
      } else {
        await festAPI.activate(fest.id);
        setActive(true);
        setToast({ msg: 'Fest activated!', type: 'success' });
      }
      onUpdated();
    } catch (e) {
      setToast({ msg: 'Toggle failed', type: 'error' });
    } finally { setToggling(false); }
  };

  const fields = [
    { k: 'name',        label: 'Fest Name',       placeholder: '' },
    { k: 'description', label: 'Description',     placeholder: '' },
    { k: 'startDate',   label: 'Start Date',      type: 'date' },
    { k: 'endDate',     label: 'End Date',        type: 'date' },
    { k: 'venue',       label: 'Venue',           placeholder: '' },
    { k: 'city',        label: 'City',            placeholder: '' },
    { k: 'startingFee', label: 'Starting Fee (₹)', placeholder: '', type: 'number' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
      background: '#0d1f1a', borderLeft: '1px solid rgba(255,255,255,0.1)',
      zIndex: 200, padding: 28, overflowY: 'auto',
      boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
    }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontFamily: FONT, color: '#fff', margin: 0, fontSize: 16 }}>
          Manage: {fest.name}
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>

      {/* fest stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: fest.totalEvents || 0, color: '#fff' },
          { label: 'Starting Fee', value: `₹${fest.startingFee}`, color: '#67e8f9' },
          { label: 'Start Date', value: fest.startDate, color: '#ccc' },
          { label: 'End Date', value: fest.endDate, color: '#ccc' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 10,
            padding: '12px', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* activate/deactivate */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <div style={{ fontFamily: FONT, color: '#fff', fontSize: 13, fontWeight: 600 }}>Fest Visibility</div>
          <div style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
            {active ? 'Visible to students' : 'Hidden from students'}
          </div>
        </div>
        <button onClick={toggleActive} disabled={toggling} style={{
          background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${active ? '#22c55e' : '#ef4444'}`,
          color: active ? '#22c55e' : '#ef4444',
          borderRadius: 999, padding: '7px 18px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          transition: 'all 0.2s',
        }}>
          {toggling ? '...' : active ? '🟢 Active' : '🔴 Inactive'}
        </button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />

      {/* edit fields */}
      <h4 style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1, margin: '0 0 14px' }}>
        EDIT FEST DETAILS
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {fields.map(({ k, label, placeholder = '', type = 'text' }) => (
          <div key={k}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 4, display: 'block', letterSpacing: 0.5 }}>
              {label.toUpperCase()}
            </label>
            {k === 'description' ? (
              <textarea value={form[k] || ''} onChange={e => set(k, e.target.value)} rows={2}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff',
                  fontSize: 13, fontFamily: FONT, outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <PillInput type={type} placeholder={placeholder}
                value={form[k] || ''} onChange={e => set(k, e.target.value)} />
            )}
          </div>
        ))}

        <DarkBtn onClick={save} style={{ width: '100%', marginTop: 8 }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </DarkBtn>
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}

// ── CREATE FEST FORM ──────────────────────────────────────────────────────────
export function CreateFestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const req = ['name','startDate','endDate','venue','city','startingFee'];
    if (req.some(k => !form[k])) {
      setToast({ msg: 'Please fill all required fields', type: 'error' }); return;
    }
    setLoading(true);
    try {
      await festAPI.create({ ...form, startingFee: Number(form.startingFee) });
      navigate('/college/fests');
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Failed to create fest', type: 'error' });
    } finally { setLoading(false); }
  };

  const fields = [
    { k: 'name',        label: 'Fest Name *',       placeholder: 'NECN FEST 2025' },
    { k: 'description', label: 'Description',       placeholder: 'Annual technical fest...' },
    { k: 'startDate',   label: 'Start Date *',      type: 'date' },
    { k: 'endDate',     label: 'End Date *',        type: 'date' },
    { k: 'venue',       label: 'Venue *',           placeholder: 'Main Auditorium' },
    { k: 'city',        label: 'City *',            placeholder: 'Hyderabad' },
    { k: 'startingFee', label: 'Starting Fee (₹) *', placeholder: '100', type: 'number' },
  ];

  return (
    <GreenBg>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 28px' }}>
        <button onClick={() => navigate('/college/fests')} style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontFamily: FONT, fontSize: 13, padding: 0,
          marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1 style={{ fontFamily: FONT, color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 32px' }}>
          Create New Fest
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {fields.map(({ k, label, placeholder = '', type = 'text' }) => (
            <div key={k}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: FONT, marginBottom: 6, display: 'block', letterSpacing: 0.5 }}>
                {label}
              </label>
              {k === 'description' ? (
                <textarea value={form[k] || ''} onChange={e => set(k, e.target.value)}
                  placeholder={placeholder} rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                    fontSize: 14, fontFamily: FONT, outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <PillInput type={type} placeholder={placeholder}
                  value={form[k] || ''} onChange={e => set(k, e.target.value)} />
              )}
            </div>
          ))}

          <DarkBtn onClick={submit} style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Fest'}
          </DarkBtn>
        </div>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}