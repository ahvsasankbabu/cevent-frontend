import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, certAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { GreenBg, Spinner, Toast, DarkBtn, SearchPill, GhostBtn, FONT } from '../components/UI';

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
export function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tab, setTab]           = useState('dashboard');
  const [stats, setStats]       = useState(null);
  const [colleges, setColleges] = useState([]);
  const [pending, setPending]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/login'); return; }
    loadAll();
  }, []);

  useEffect(() => {
    setSearch('');
  }, [tab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, allRes, pendingRes, usersRes] = await Promise.all([
        adminAPI.stats(),
        adminAPI.allColleges(),
        adminAPI.pendingColleges(),
        adminAPI.allUsers(),
      ]);
      setStats(statsRes.data.data);
      setColleges(allRes.data.data || []);
      setPending(pendingRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try {
      await adminAPI.approve(id);
      setToast({ msg: 'College approved!', type: 'success' });
      loadAll();
    } catch { setToast({ msg: 'Failed', type: 'error' }); }
  };

  const reject = async (id) => {
    try {
      await adminAPI.reject(id);
      setToast({ msg: 'College rejected', type: 'warning' });
      loadAll();
    } catch { setToast({ msg: 'Failed', type: 'error' }); }
  };

  const filteredColleges = colleges.filter(c =>
    c.collegeName?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPending = pending.filter(c =>
    c.collegeName?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'pending',   label: `⏳ Pending (${pending.length})` },
    { key: 'colleges',  label: '🏫 Colleges' },
    { key: 'users',     label: '👥 Users' },
  ];

  return (
    <GreenBg>
      {/* topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <h1 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 3 }}>
            ADMIN
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{user?.name}</span>
          <GhostBtn onClick={() => { logout(); navigate('/'); }}>Logout</GhostBtn>
        </div>
      </div>

      <div style={{ height: 1, margin: '14px 28px 0', background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent)' }} />

      {/* tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '16px 28px 0', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', borderRadius: 999, border: '1px solid',
            borderColor: tab === t.key ? '#67e8f9' : 'rgba(255,255,255,0.12)',
            background: tab === t.key ? 'rgba(103,232,249,0.1)' : 'transparent',
            color: tab === t.key ? '#67e8f9' : 'rgba(255,255,255,0.5)',
            fontSize: 13, cursor: 'pointer', fontFamily: FONT,
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
        {tab !== 'dashboard' && (
          <div style={{ marginLeft: 'auto' }}>
            <SearchPill
              placeholder={tab === 'users' ? 'find user' : 'find college'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      <div style={{ padding: '20px 28px 60px' }}>
        {loading ? <Spinner /> : (
          <>
            {/* ── DASHBOARD TAB ── */}
            {tab === 'dashboard' && stats && (
              <div>
                <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, margin: '0 0 20px' }}>
                  PLATFORM OVERVIEW
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
                  {[
                    { label: 'Total Colleges',     value: stats.totalColleges,     color: '#67e8f9', icon: '🏫' },
                    { label: 'Pending Approval',   value: stats.pendingColleges,   color: '#eab308', icon: '⏳' },
                    { label: 'Approved Colleges',  value: stats.approvedColleges,  color: '#22c55e', icon: '✅' },
                    { label: 'Total Students',     value: stats.totalStudents,     color: '#e879f9', icon: '👥' },
                    { label: 'Total Fests',        value: stats.totalFests,        color: '#3b82f6', icon: '🎪' },
                    { label: 'Total Events',       value: stats.totalEvents,       color: '#f97316', icon: '🎯' },
                    { label: 'Total Registrations',value: stats.totalRegistrations,color: '#14b8a6', icon: '📋' },
                    { label: 'Total Revenue',      value: `₹${stats.totalRevenue || 0}`, color: '#22c55e', icon: '💰' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '20px 18px',
                      transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                    >
                      <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                      <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* pending colleges preview */}
                {pending.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, margin: 0 }}>
                        PENDING APPROVALS ({pending.length})
                      </p>
                      <button onClick={() => setTab('pending')} style={{
                        background: 'transparent', border: 'none',
                        color: '#67e8f9', fontFamily: FONT, fontSize: 12,
                        cursor: 'pointer', padding: 0,
                      }}>View all →</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {pending.slice(0, 3).map(c => (
                        <CollegeRow key={c.id} college={c} onApprove={() => approve(c.id)} onReject={() => reject(c.id)} showActions />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PENDING TAB ── */}
            {tab === 'pending' && (
              <div>
                <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, margin: '0 0 16px' }}>
                  PENDING APPROVALS — {filteredPending.length} college{filteredPending.length !== 1 ? 's' : ''}
                </p>
                {filteredPending.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                    <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                      No pending approvals!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredPending.map(c => (
                      <CollegeRow key={c.id} college={c} onApprove={() => approve(c.id)} onReject={() => reject(c.id)} showActions />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ALL COLLEGES TAB ── */}
            {tab === 'colleges' && (
              <div>
                <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, margin: '0 0 16px' }}>
                  ALL COLLEGES — {filteredColleges.length} total
                </p>
                {/* table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1fr 1fr 1fr', padding: '0 16px 8px' }}>
                  {['#', 'College Name', 'City / State', 'Phone', 'Status', 'Action'].map(h => (
                    <span key={h} style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{h}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredColleges.map((c, i) => (
                    <div key={c.id} style={{
                      display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.5fr 1fr 1fr 1fr',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#888' }}>{i + 1}</span>
                      <div>
                        <div style={{ fontFamily: FONT, fontSize: 13, color: '#fff', fontWeight: 600 }}>{c.collegeName}</div>
                        <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.collegeEmail}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: FONT, fontSize: 13, color: '#ccc' }}>{c.city}</div>
                        <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.state}</div>
                      </div>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#ccc' }}>{c.phone || '—'}</span>
                      <StatusBadge status={c.status} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        {c.status === 'PENDING' && (
                          <>
                            <ActionBtn label="Approve" color="#22c55e" onClick={() => approve(c.id)} />
                            <ActionBtn label="Reject" color="#ef4444" onClick={() => reject(c.id)} />
                          </>
                        )}
                        {c.status === 'REJECTED' && (
                          <ActionBtn label="Approve" color="#22c55e" onClick={() => approve(c.id)} />
                        )}
                        {c.status === 'APPROVED' && (
                          <ActionBtn label="Reject" color="#ef4444" onClick={() => reject(c.id)} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── USERS TAB ── */}
            {tab === 'users' && (
              <div>
                <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, margin: '0 0 16px' }}>
                  ALL USERS — {filteredUsers.length} total
                </p>
                {/* table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 2fr 1fr', padding: '0 16px 8px' }}>
                  {['#', 'Name', 'Email', 'Role'].map(h => (
                    <span key={h} style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{h}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredUsers.map((u, i) => (
                    <div key={u.id} style={{
                      display: 'grid', gridTemplateColumns: '0.5fr 2fr 2fr 1fr',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#888' }}>{i + 1}</span>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#fff', fontWeight: 600 }}>{u.name}</span>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{u.email}</span>
                      <span style={{
                        fontFamily: FONT, fontSize: 11, fontWeight: 700,
                        color: u.role === 'ADMIN' ? '#ef4444' : u.role === 'COLLEGE' ? '#67e8f9' : '#e879f9',
                        background: u.role === 'ADMIN' ? 'rgba(239,68,68,0.1)' : u.role === 'COLLEGE' ? 'rgba(103,232,249,0.1)' : 'rgba(232,121,249,0.1)',
                        padding: '3px 10px', borderRadius: 999, display: 'inline-block',
                      }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

// ── COLLEGE ROW (for pending + dashboard preview) ─────────────────────────────
function CollegeRow({ college: c, onApprove, onReject, showActions }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.5fr 1fr 1fr',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, alignItems: 'center', gap: 8,
    }}>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: '#fff', fontWeight: 600 }}>{c.collegeName}</div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.collegeEmail}</div>
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: '#ccc' }}>{c.city}</div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.state}</div>
      </div>
      <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{c.phone || '—'}</span>
      <StatusBadge status={c.status} />
      {showActions && (
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn label="✓" color="#22c55e" onClick={onApprove} />
          <ActionBtn label="✕" color="#ef4444" onClick={onReject} />
        </div>
      )}
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    APPROVED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    PENDING:  { color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const s = colors[status] || colors.PENDING;
  return (
    <span style={{
      fontFamily: FONT, fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg,
      padding: '3px 10px', borderRadius: 999, display: 'inline-block',
    }}>{status}</span>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      border: `1px solid ${color}`,
      color, borderRadius: 6,
      padding: '4px 10px', fontSize: 11,
      cursor: 'pointer', fontFamily: FONT,
      fontWeight: 700, transition: 'all 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{label}</button>
  );
}

// ── COLLEGE SETUP PAGE ────────────────────────────────────────────────────────
export function CollegeSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const req = ['collegeName', 'city', 'state', 'phone', 'collegeEmail', 'address'];
    if (req.some(k => !form[k])) {
      setToast({ msg: 'Please fill all required fields', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const { collegeAPI } = await import('../api');
      await collegeAPI.register(form);
      navigate('/college/dashboard');
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Failed', type: 'error' });
    } finally { setLoading(false); }
  };

  const fields = [
    { k: 'collegeName',  label: 'College Name *',  placeholder: 'NECN College' },
    { k: 'collegeEmail', label: 'College Email *',  placeholder: 'info@necn.edu' },
    { k: 'phone',        label: 'Phone *',          placeholder: '+91 9876543210' },
    { k: 'address',      label: 'Address *',        placeholder: 'Main Road, Block A' },
    { k: 'city',         label: 'City *',           placeholder: 'Hyderabad' },
    { k: 'state',        label: 'State *',          placeholder: 'Telangana' },
  ];

  return (
    <GreenBg>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 28px' }}>
        <h1 style={{ fontFamily: FONT, color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>
          Setup College Profile
        </h1>
        <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 32px' }}>
          Complete your college profile to get started.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(({ k, label, placeholder }) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 5, display: 'block', letterSpacing: 0.5 }}>
                {label.toUpperCase()}
              </label>
              <input value={form[k] || ''} onChange={e => set(k, e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '11px 16px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff',
                  fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
          <DarkBtn onClick={submit} style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Saving...' : 'Submit for Approval'}
          </DarkBtn>
        </div>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

// ── CERT VERIFY PAGE ──────────────────────────────────────────────────────────
export function CertVerifyPage() {
  const { certificateId } = useParams ? require('react-router-dom').useParams() : { certificateId: null };
  const [cert, setCert]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certificateId) return;
    certAPI.verify(certificateId)
      .then(r => setCert(r.data.data))
      .catch(() => setError('Certificate not found or invalid'))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) return <GreenBg><Spinner /></GreenBg>;

  return (
    <GreenBg>
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 28px', textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: FONT, color: '#ef4444', fontSize: 22, margin: '0 0 8px' }}>Invalid Certificate</h2>
            <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{error}</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: FONT, color: '#22c55e', fontSize: 22, margin: '0 0 24px' }}>Certificate Verified</h2>
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '24px', textAlign: 'left',
            }}>
              {[
                ['Student',   cert?.studentName],
                ['Event',     cert?.eventName],
                ['Fest',      cert?.festName],
                ['Cert ID',   cert?.certificateId],
                ['Issued At', cert?.issuedAt],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#fff', fontWeight: 600 }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GreenBg>
  );
}