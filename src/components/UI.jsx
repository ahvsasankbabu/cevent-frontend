// ── SHARED DESIGN TOKENS ─────────────────────────────────────────────────────
// ── HOME BUTTON ───────────────────────────────────────────────────────────────
export function HomeBtn({ onClick }) {
  return (
    <button onClick={onClick} title="Home" style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 6, borderRadius: 8, transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    </button>
  );
}
export const COLORS = {
  bg:         '#000',
  bgGreen:    'radial-gradient(ellipse at 50% 100%, rgba(0,60,40,0.95) 0%, transparent 65%), radial-gradient(ellipse at 80% 60%, rgba(0,40,30,0.7) 0%, transparent 50%), #000',
  bgPurple:   'radial-gradient(ellipse at 15% 50%, rgba(180,80,230,0.75) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(120,60,200,0.6) 0%, transparent 45%), radial-gradient(ellipse at 70% 80%, rgba(0,200,210,0.65) 0%, transparent 50%), radial-gradient(ellipse at 90% 60%, rgba(80,200,240,0.55) 0%, transparent 45%), radial-gradient(ellipse at 10% 80%, rgba(100,180,255,0.6) 0%, transparent 50%), linear-gradient(135deg,#c084fc 0%,#818cf8 30%,#67e8f9 60%,#a5f3fc 100%)',
  card:       'rgba(30,50,45,0.55)',
  cardDark:   'rgba(20,35,30,0.8)',
  border:     'rgba(255,255,255,0.1)',
  borderBright:'rgba(255,255,255,0.2)',
  text:       '#fff',
  textMuted:  'rgba(255,255,255,0.5)',
  textDim:    'rgba(255,255,255,0.35)',
  accent:     '#00e5ff',
  green:      '#22c55e',
  yellow:     '#eab308',
  blue:       '#3b82f6',
  red:        '#ef4444',
  gradBorder: 'linear-gradient(135deg,#e879f9,#67e8f9)',
};

export const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ── BACKGROUND WRAPPERS ───────────────────────────────────────────────────────
export const GreenBg = ({ children, style = {} }) => (
  <div style={{
    minHeight: '100vh', width: '100%',
    background: COLORS.bgGreen,
    fontFamily: FONT, color: COLORS.text,
    boxSizing: 'border-box', ...style,
  }}>{children}</div>
);

export const PurpleBg = ({ children, style = {} }) => (
  <div style={{
    minHeight: '100vh', width: '100%',
    background: COLORS.bgPurple,
    fontFamily: FONT, color: COLORS.text,
    boxSizing: 'border-box', ...style,
  }}>{children}</div>
);

// ── GRADIENT BORDER SEARCH PILL ───────────────────────────────────────────────
export function SearchPill({ placeholder, value, onChange, dark = false }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 999, padding: 2,
      display: 'inline-flex',
      border: '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        background: 'transparent',
        borderRadius: 999, display: 'flex', alignItems: 'center',
        padding: '9px 18px', gap: 8, minWidth: 240,
      }}>
        <svg width="15" height="15" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input value={value} onChange={onChange} placeholder={placeholder}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 14, width: '100%',
            fontFamily: FONT,
          }}
        />
      </div>
    </div>
  );
}
  

// ── GRADIENT BORDER CARD WRAPPER ──────────────────────────────────────────────
export function GradCard({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.gradBorder, borderRadius: 20, padding: 2, ...style }}>
      <div style={{ background: '#0a0a0a', borderRadius: 18, padding: '36px 40px' }}>
        {children}
      </div>
    </div>
  );
}

// ── PILL INPUT ────────────────────────────────────────────────────────────────
export function PillInput({ dark = true, ...props }) {
  return (
    <input {...props} style={{
      width: '100%', padding: '13px 20px', borderRadius: 999,
      border: '1.5px solid rgba(255,255,255,0.2)',
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(200,210,205,0.15)',
      color: '#fff', fontSize: 14, outline: 'none', fontFamily: FONT,
      boxSizing: 'border-box', transition: 'border-color 0.2s',
      ...(props.style || {}),
    }}
      onFocus={e => e.target.style.borderColor = '#67e8f9'}
      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
    />
  );
}

// ── DARK PILL BUTTON ──────────────────────────────────────────────────────────
export function DarkBtn({ children, onClick, style = {}, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} style={{
      background: '#111', border: '1.5px solid rgba(255,255,255,0.25)',
      color: '#fff', borderRadius: 999, padding: '12px 40px',
      fontSize: 15, fontWeight: 700, cursor: 'pointer',
      fontFamily: FONT, letterSpacing: 1, transition: 'background 0.2s',
      ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#222'}
      onMouseLeave={e => e.currentTarget.style.background = '#111'}
    >{children}</button>
  );
}

// ── GHOST BTN (dark bg, outlined) ────────────────────────────────────────────
export function GhostBtn({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(60,60,60,0.85)', border: '1px solid rgba(255,255,255,0.15)',
      color: '#fff', borderRadius: 6, padding: '8px 22px',
      fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
      transition: 'background 0.2s', ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(90,90,90,0.9)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(60,60,60,0.85)'}
    >{children}</button>
  );
}

// ── TABLE ROW ─────────────────────────────────────────────────────────────────
export function TableRow({ children, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'rgba(200,210,200,0.12)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '14px 20px', gap: 0,
      ...style,
    }}>{children}</div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color }) {
  const map = {
    green:  { bg: '#22c55e', color: '#fff' },
    yellow: { bg: '#eab308', color: '#000' },
    blue:   { bg: '#3b82f6', color: '#fff' },
    red:    { bg: '#ef4444', color: '#fff' },
    gray:   { bg: '#555',    color: '#fff' },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: 999, padding: '3px 14px',
      fontSize: 12, fontWeight: 600, display: 'inline-block',
    }}>{label}</span>
  );
}

// ── PROFILE ICON ──────────────────────────────────────────────────────────────
export function ProfileIcon({ size = 24, color = '#888' }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

// ── CATEGORY ICONS ────────────────────────────────────────────────────────────
export function CategoryIcon({ category, size = 18 }) {
  const icons = {
    TECHNICAL: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    CULTURAL: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
    SPORTS: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    ARTS: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    WORKSHOP: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    OTHER: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };
  return icons[category] || icons.OTHER;
}

// ── SPINNER ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #67e8f9', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success', onClose }) {
  if (!msg) return null;
  const bg = type === 'error' ? '#ef4444' : type === 'warning' ? '#eab308' : '#22c55e';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: '#fff', padding: '12px 24px',
      borderRadius: 10, fontFamily: FONT, fontSize: 14, fontWeight: 600,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {msg}
      <span onClick={onClose} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
    </div>
  );
}
