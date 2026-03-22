import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { eventAPI, regAPI, certAPI, festAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  GreenBg, SearchPill, Spinner, Toast, CategoryIcon,
  PillInput, DarkBtn, FONT, HomeBtn,
} from '../components/UI';

const CATEGORIES = ['TECHNICAL', 'CULTURAL', 'SPORTS', 'ARTS', 'WORKSHOP', 'OTHER'];

// ── EVENTS LIST FOR A FEST ────────────────────────────────────────────────────
export function CollegeEventsPage() {
  const { festId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [fest, setFest]             = useState(null);
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('ALL');
  const [toast, setToast]           = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showManageFest, setShowManageFest] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'COLLEGE') { navigate('/login'); return; }
    load();
  }, [category]);

  const load = async () => {
    setLoading(true);
    try {
      const [festRes, evRes] = await Promise.all([
        festAPI.getMine(),
        category === 'ALL'
          ? eventAPI.getByFest(festId)
          : eventAPI.getByCategory(festId, category),
      ]);
      const festList = festRes.data.data || [];
      setFest(festList.find(f => f.id === Number(festId)));
      setEvents(evRes.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GreenBg>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 0', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/college/fests')} style={{
            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontFamily: FONT, fontSize: 13, padding: 0,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <HomeBtn onClick={() => navigate('/')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['ALL', ...CATEGORIES].map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  padding: '4px 10px', borderRadius: 999, border: '1px solid',
                  borderColor: category === c ? '#67e8f9' : 'rgba(255,255,255,0.12)',
                  background: category === c ? 'rgba(103,232,249,0.1)' : 'transparent',
                  color: category === c ? '#67e8f9' : 'rgba(255,255,255,0.4)',
                  fontSize: 11, cursor: 'pointer', fontFamily: FONT,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {c !== 'ALL' && <CategoryIcon category={c} size={11} />}
                  {c}
                </button>
              ))}
            </div>
          </div>
          <SearchPill placeholder="find event" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: FONT, fontSize: 'clamp(16px,2.5vw,28px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 2 }}>
            {fest?.name?.toUpperCase() || 'EVENT_NAME'}
          </h1>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888' }} />
        </div>
      </div>

      <div style={{ height: 1, margin: '14px 28px 0', background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent)' }} />

      {/* actions row */}
      <div style={{ padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setShowManageFest(true)} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 8, padding: '10px 18px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Manage Fest
        </button>
        <button onClick={() => navigate(`/college/fest/${festId}/certificate`)} style={{
          background: '#eab308', border: 'none', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: FONT, color: '#000',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload certificate template
        </button>
      </div>

      {/* table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1.2fr 1.2fr 0.8fr 1fr', padding: '0 28px 6px' }}>
        {['Event_Id','Event_Name','Start_Date','End_Date','Category','Status',''].map(h => (
          <span key={h} style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{h}</span>
        ))}
      </div>

      {/* table rows */}
      <div style={{ padding: '0 0 80px' }}>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT, padding: '20px 28px' }}>No events.</p>
        ) : filtered.map(ev => (
          <div key={ev.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1.2fr 1.2fr 1fr',
            padding: '13px 28px',
            background: 'rgba(190,210,200,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 8, alignItems: 'center',
          }}>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#ddd' }}>{ev.id}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#ddd' }}>{ev.name}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#ddd' }}>{ev.eventDate}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#ddd' }}>{ev.eventDate}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#aaa', fontSize: 12, fontFamily: FONT }}>
              <CategoryIcon category={ev.category} size={13} />
              {ev.category}
            </span>
           <span style={{
              fontFamily: FONT, fontSize: 11, fontWeight: 700,
              color: ev.active ? '#22c55e' : '#ef4444',
              background: ev.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '3px 10px', borderRadius: 999, display: 'inline-block',
            }}>{ev.active ? 'Active' : 'Inactive'}</span>
            <span
              onClick={() => navigate(`/college/fest/${festId}/participants?eventId=${ev.id}&eventName=${encodeURIComponent(ev.name)}&eventData=${encodeURIComponent(JSON.stringify(ev))}`)}
              style={{ color: '#3b82f6', cursor: 'pointer', fontFamily: FONT, fontSize: 13 }}>
              Manage
            </span>
          </div>
        ))}
      </div>
      {/* FAB */}
      <button onClick={() => setShowCreate(true)} style={{
        position: 'fixed', bottom: 32, right: 32,
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 999, padding: '14px 24px',
        color: '#fff', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', fontFamily: FONT,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create Event
      </button>

      {showCreate && (
        <CreateEventDrawer festId={festId} onClose={() => setShowCreate(false)} onCreated={load} />
      )}

      {showManageFest && fest && (
        <ManageFestDrawer
          fest={fest}
          onClose={() => setShowManageFest(false)}
          onUpdated={() => { setShowManageFest(false); load(); }}
        />
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

// ── CREATE EVENT DRAWER ───────────────────────────────────────────────────────
function CreateEventDrawer({ festId, onClose, onCreated }) {
  const [form, setForm]       = useState({ category: 'TECHNICAL' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const req = ['name','eventDate','startTime','venue','fee','maxParticipants'];
    if (req.some(k => !form[k])) {
      setToast({ msg: 'Please fill required fields', type: 'error' }); return;
    }
    setLoading(true);
    try {
      await eventAPI.create(festId, {
        ...form,
        fee: Number(form.fee),
        maxParticipants: Number(form.maxParticipants),
      });
      onCreated(); onClose();
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Failed', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Drawer title="Create Event" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { k: 'name',            label: 'Event Name *',       placeholder: 'Web Dev Workshop' },
          { k: 'description',     label: 'Description',        placeholder: 'About this event...' },
          { k: 'eventDate',       label: 'Event Date *',       type: 'date' },
          { k: 'startTime',       label: 'Start Time *',       type: 'time' },
          { k: 'venue',           label: 'Venue *',            placeholder: 'Lab Block A' },
          { k: 'fee',             label: 'Fee (₹) *',          placeholder: '150', type: 'number' },
          { k: 'maxParticipants', label: 'Max Participants *', placeholder: '50', type: 'number' },
        ].map(({ k, label, placeholder = '', type = 'text' }) => (
          <DrawerField key={k} label={label}>
            {k === 'description' ? (
              <textarea value={form[k] || ''} onChange={e => set(k, e.target.value)}
                placeholder={placeholder} rows={3} style={textareaStyle} />
            ) : (
              <PillInput type={type} placeholder={placeholder}
                value={form[k] || ''} onChange={e => set(k, e.target.value)} />
            )}
          </DrawerField>
        ))}
        <DrawerField label="CATEGORY *">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => set('category', c)} style={{
                padding: '6px 12px', borderRadius: 999, border: '1px solid',
                borderColor: form.category === c ? '#67e8f9' : 'rgba(255,255,255,0.15)',
                background: form.category === c ? 'rgba(103,232,249,0.1)' : 'transparent',
                color: form.category === c ? '#67e8f9' : 'rgba(255,255,255,0.45)',
                fontSize: 12, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <CategoryIcon category={c} size={12} />{c}
              </button>
            ))}
          </div>
        </DrawerField>
        <DarkBtn onClick={submit} style={{ width: '100%', marginTop: 8 }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </DarkBtn>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </Drawer>
  );
}

// ── MANAGE FEST DRAWER ────────────────────────────────────────────────────────
function ManageFestDrawer({ fest, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name:        fest.name || '',
    description: fest.description || '',
    startDate:   fest.startDate || '',
    endDate:     fest.endDate || '',
    venue:       fest.venue || '',
    city:        fest.city || '',
    startingFee: fest.startingFee ?? '',
  });
  const [active, setActive]     = useState(fest.active ?? true);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast]       = useState(null);
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
    } catch {
      setToast({ msg: 'Toggle failed', type: 'error' });
    } finally { setToggling(false); }
  };

  return (
    <Drawer title={`Manage Fest: ${fest.name}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: fest.totalEvents || 0, color: '#fff' },
          { label: 'Starting Fee', value: `₹${fest.startingFee}`, color: '#67e8f9' },
          { label: 'Start Date',   value: fest.startDate, color: '#ccc' },
          { label: 'End Date',     value: fest.endDate,   color: '#ccc' },
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
        }}>
          {toggling ? '...' : active ? '🟢 Active' : '🔴 Inactive'}
        </button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />

      <h4 style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1, margin: '0 0 14px' }}>
        EDIT FEST DETAILS
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {[
          { k: 'name',        label: 'Fest Name' },
          { k: 'description', label: 'Description' },
          { k: 'startDate',   label: 'Start Date',      type: 'date' },
          { k: 'endDate',     label: 'End Date',        type: 'date' },
          { k: 'venue',       label: 'Venue' },
          { k: 'city',        label: 'City' },
          { k: 'startingFee', label: 'Starting Fee (₹)', type: 'number' },
        ].map(({ k, label, type = 'text' }) => (
          <DrawerField key={k} label={label}>
            {k === 'description' ? (
              <textarea value={form[k] || ''} onChange={e => set(k, e.target.value)}
                rows={2} style={textareaStyle} />
            ) : (
              <PillInput type={type} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
            )}
          </DrawerField>
        ))}
        <DarkBtn onClick={save} style={{ width: '100%', marginTop: 4 }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </DarkBtn>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </Drawer>
  );
}

// ── MANAGE EVENT DRAWER ───────────────────────────────────────────────────────
function ManageEventDrawer({ eventData, summary, onClose, onUpdated, onSendAll, certsDone, certCount }) {
  const [form, setForm] = useState({
    name:            eventData?.name || '',
    description:     eventData?.description || '',
    eventDate:       eventData?.eventDate || '',
    startTime:       eventData?.startTime?.slice(0,5) || '',
    venue:           eventData?.venue || '',
    fee:             eventData?.fee ?? '',
    maxParticipants: eventData?.maxParticipants ?? '',
    category:        eventData?.category || 'TECHNICAL',
  });
  const [active, setActive]     = useState(eventData?.active ?? true);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast]       = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await eventAPI.update(eventData.id, {
        ...form,
        fee: Number(form.fee),
        maxParticipants: Number(form.maxParticipants),
      });
      setToast({ msg: 'Event updated!', type: 'success' });
      setTimeout(() => { onUpdated(); onClose(); }, 800);
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Update failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const toggleActive = async () => {
    setToggling(true);
    try {
      if (active) {
        await eventAPI.deactivate(eventData.id);
        setActive(false);
        setToast({ msg: 'Event deactivated', type: 'warning' });
      } else {
        await eventAPI.activate(eventData.id);
        setActive(true);
        setToast({ msg: 'Event activated!', type: 'success' });
      }
      onUpdated();
    } catch {
      setToast({ msg: 'Toggle failed', type: 'error' });
    } finally { setToggling(false); }
  };

  return (
    <Drawer title={`Manage: ${eventData?.name}`} onClose={onClose}>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total',     value: summary.totalRegistrations,    color: '#fff' },
            { label: 'Confirmed', value: summary.confirmedRegistrations, color: '#22c55e' },
            { label: 'Revenue',   value: summary.totalAmountCollected <= 0 ? 'Free' : `₹${summary.totalAmountCollected}`, color: '#67e8f9' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 10,
              padding: '12px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <div style={{ fontFamily: FONT, color: '#fff', fontSize: 13, fontWeight: 600 }}>Event Visibility</div>
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
        }}>
          {toggling ? '...' : active ? '🟢 Active' : '🔴 Inactive'}
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        {certsDone ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 10, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#22c55e' }}>
              Certificates sent to {certCount} participant{certCount !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <button onClick={onSendAll} style={{
            width: '100%', padding: '11px', borderRadius: 8,
            background: '#22c55e', border: 'none',
            color: '#000', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: FONT,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.78 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
            Send Certificates to All
          </button>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />

      <h4 style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1, margin: '0 0 14px' }}>
        EDIT EVENT DETAILS
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {[
          { k: 'name',            label: 'Event Name' },
          { k: 'description',     label: 'Description' },
          { k: 'eventDate',       label: 'Event Date',       type: 'date' },
          { k: 'startTime',       label: 'Start Time',       type: 'time' },
          { k: 'venue',           label: 'Venue' },
          { k: 'fee',             label: 'Fee (₹)',          type: 'number' },
          { k: 'maxParticipants', label: 'Max Participants', type: 'number' },
        ].map(({ k, label, type = 'text' }) => (
          <DrawerField key={k} label={label}>
            {k === 'description' ? (
              <textarea value={form[k] || ''} onChange={e => set(k, e.target.value)}
                rows={2} style={textareaStyle} />
            ) : (
              <PillInput type={type} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
            )}
          </DrawerField>
        ))}
        <DrawerField label="Category">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => set('category', c)} style={{
                padding: '5px 10px', borderRadius: 999, border: '1px solid',
                borderColor: form.category === c ? '#67e8f9' : 'rgba(255,255,255,0.12)',
                background: form.category === c ? 'rgba(103,232,249,0.1)' : 'transparent',
                color: form.category === c ? '#67e8f9' : 'rgba(255,255,255,0.4)',
                fontSize: 11, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <CategoryIcon category={c} size={11} />{c}
              </button>
            ))}
          </div>
        </DrawerField>
        <DarkBtn onClick={save} style={{ width: '100%', marginTop: 4 }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </DarkBtn>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </Drawer>
  );
}

// ── PARTICIPANTS PAGE ─────────────────────────────────────────────────────────
export function ParticipantsPage() {
  const { festId }     = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const [searchParams] = useSearchParams();
  const eventIdParam   = searchParams.get('eventId');
  const eventNameParam = searchParams.get('eventName') ? decodeURIComponent(searchParams.get('eventName')) : null;
  const eventDataParam = searchParams.get('eventData') ? JSON.parse(decodeURIComponent(searchParams.get('eventData'))) : null;

  const [summary, setSummary]           = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState(null);
  const [certStatus, setCertStatus]     = useState({});
  const [showManage, setShowManage]     = useState(false);
  const [generating, setGenerating]     = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'COLLEGE') { navigate('/login'); return; }
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes] = await Promise.all([
        regAPI.festSummary(festId),
      ]);
      const allSummary = sumRes.data.data || [];
      const filtered = eventIdParam
        ? allSummary.filter(s => String(s.eventId) === String(eventIdParam))
        : allSummary;
      setSummary(filtered);

      const statusMap = {};
      await Promise.all(filtered.map(async s => {
        try {
          const res = await certAPI.status(s.eventId);
          statusMap[s.eventId] = res.data.data;
        } catch {}
      }));
      setCertStatus(statusMap);

      if (eventIdParam) {
        const pRes = await regAPI.participants(eventIdParam);
        setParticipants(pRes.data.data || []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleSendAll = async (eventId) => {
    setGenerating(true);
    try {
      await certAPI.generate(eventId);
      setToast({ msg: 'Certificates generated for all confirmed participants!', type: 'success' });
      const res = await certAPI.status(eventId);
      setCertStatus(s => ({ ...s, [eventId]: res.data.data }));
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Failed to generate', type: 'error' });
    } finally { setGenerating(false); }
  };

  const filteredParticipants = participants.filter(p =>
    p.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    p.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const currentSummary = summary.find(s => String(s.eventId) === String(eventIdParam));
  const cs = certStatus[eventIdParam];
  const certsDone = cs?.generated && cs?.count > 0;
  const heading = eventNameParam?.toUpperCase() || 'EVENT_NAME';

  const certPageUrl = `/college/fest/${festId}/certificate`
    + `?eventId=${eventIdParam}`
    + `&eventName=${encodeURIComponent(eventNameParam || '')}`
    + `&eventData=${encodeURIComponent(JSON.stringify(eventDataParam || {}))}`;

  return (
    <GreenBg>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 0', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate(`/college/fest/${festId}/events`)} style={{
            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontFamily: FONT, fontSize: 13, padding: 0,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <HomeBtn onClick={() => navigate('/')} />
          <SearchPill placeholder="find Participant" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: FONT, fontSize: 'clamp(14px,2vw,26px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 2 }}>
            {heading}
          </h1>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888' }} />
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '14px 28px 0', flexWrap: 'wrap' }}>
        {certsDone ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 8, padding: '9px 16px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#22c55e', fontFamily: FONT, fontSize: 13 }}>✓ Certificates sent ({cs?.count})</span>
          </div>
        ) : (
          <button onClick={() => handleSendAll(eventIdParam)} disabled={generating} style={{
            background: '#22c55e', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: FONT, color: '#000',
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: generating ? 0.7 : 1,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.78 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
            {generating ? 'Sending...' : 'Send All Certs'}
          </button>
        )}

        <button onClick={() => setShowManage(true)} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 8, padding: '10px 18px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Manage Event
        </button>

        <button onClick={() => navigate(certPageUrl)} style={{
          background: '#eab308', border: 'none', borderRadius: 8,
          padding: '10px 18px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: FONT, color: '#000',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload cert template
        </button>
      </div>

      <div style={{ height: 1, margin: '14px 28px 0', background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent)' }} />

      {/* participant list */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1fr 1fr 1fr 1fr', padding: '10px 28px 6px' }}>
        {['#','Name','College / Branch','Roll No','Amount','Status','Cert'].map(h => (
          <span key={h} style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{h}</span>
        ))}
      </div>

      <div style={{ padding: '0 0 40px' }}>
        {loading ? <Spinner /> : filteredParticipants.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT, padding: '20px 28px' }}>No participants yet.</p>
        ) : filteredParticipants.map((p, i) => (
          <div key={p.registrationId} style={{
            display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1fr 1fr 1fr 1fr',
            padding: '13px 28px',
            background: 'rgba(190,210,200,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 8, alignItems: 'center',
          }}>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#888' }}>{i + 1}</span>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: '#fff', fontWeight: 600 }}>{p.studentName}</div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.email}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: '#ccc' }}>{p.collegeName}</div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.branch}</div>
            </div>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#ddd' }}>{p.rollNumber || '—'}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#ddd' }}>
              {p.amountPaid <= 0 ? 'Free' : `₹${p.amountPaid}`}
            </span>
            <span style={{
              fontFamily: FONT, fontSize: 11, fontWeight: 700,
              color: p.status === 'CONFIRMED' ? '#22c55e' : '#eab308',
              background: p.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
              padding: '3px 10px', borderRadius: 999, display: 'inline-block',
            }}>{p.status}</span>
            {p.status === 'CONFIRMED' && (
              certsDone ? (
                <span style={{ fontFamily: FONT, fontSize: 11, color: '#22c55e' }}>✓ Sent</span>
              ) : (
                <button onClick={() => handleSendAll(eventIdParam)} style={{
                  background: 'transparent', border: '1px solid #22c55e',
                  color: '#22c55e', borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, cursor: 'pointer', fontFamily: FONT,
                }}>Send</button>
              )
            )}
          </div>
        ))}
      </div>

      {showManage && (
        <ManageEventDrawer
          eventData={eventDataParam}
          summary={currentSummary}
          certsDone={certsDone}
          certCount={cs?.count || 0}
          onClose={() => setShowManage(false)}
          onUpdated={load}
          onSendAll={() => handleSendAll(eventIdParam)}
        />
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Drawer({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
      background: '#0d1f1a', borderLeft: '1px solid rgba(255,255,255,0.1)',
      zIndex: 200, padding: 28, overflowY: 'auto',
      boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontFamily: FONT, color: '#fff', margin: 0, fontSize: 16 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {children}
    </div>
  );
}

function DrawerField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 4, display: 'block', letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

const textareaStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)', color: '#fff',
  fontSize: 13, fontFamily: FONT, outline: 'none', resize: 'vertical',
  boxSizing: 'border-box',
};