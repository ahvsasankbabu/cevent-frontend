import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payAPI , regAPI} from '../api';
import { GreenBg, GradCard, DarkBtn, Spinner, Toast, FONT, COLORS } from '../components/UI';

export default function PaymentPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState('summary'); // summary | upi | done | failed | expired
  const [seconds, setSeconds]   = useState(0);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast]       = useState(null);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);

  // ── initiate payment ──────────────────────────────────────────────
  useEffect(() => {
    initiate();
    return () => clearInterval(timerRef.current);
  }, []);

  const initiate = async () => {
    try {
      const res = await payAPI.initiate(registrationId);
      const d   = res.data.data;
      setOrder(d);
      setSeconds(d.remainingSeconds);
      startTimer(d.remainingSeconds);
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Could not initiate payment', type: 'error' });
    } finally { setLoading(false); }
  };

  const startTimer = (initial) => {
    let s = initial;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      s -= 1;
      setSeconds(s);
      if (s <= 0) {
        clearInterval(timerRef.current);
        setStep('expired');
      }
    }, 1000);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ── confirm (simulate success) ────────────────────────────────────
  const handleConfirm = async () => {
    setProcessing(true);
    pausedRef.current = true; // pause timer while "in UPI app"
    try {
      await payAPI.confirm(order.orderId);
      clearInterval(timerRef.current);
      setStep('done');
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Payment failed', type: 'error' });
      setStep('failed');
    } finally { setProcessing(false); }
  };

  // ── cancel ────────────────────────────────────────────────────────
const handleCancel = async () => {
  setProcessing(true);
  try {
    await payAPI.cancel(order.orderId);
    await regAPI.cancel(registrationId);
    clearInterval(timerRef.current);
  } catch {}
  finally {
    setProcessing(false);
    navigate(-1); // go back to fest page where they registered
  }
};
  const goToUpi = () => {
    pausedRef.current = true;  // pause timer
    setStep('upi');
  };

  const backFromUpi = () => {
    pausedRef.current = false; // resume timer
    setStep('summary');
  };

  if (loading) return <GreenBg><Spinner /></GreenBg>;

  return (
    <GreenBg>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 20 }}>

        {/* ── expired ── */}
        {step === 'expired' && (
          <GradCard style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
              <h2 style={{ color: '#fff', fontFamily: FONT, margin: '0 0 12px' }}>Session Expired</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: FONT, fontSize: 14, margin: '0 0 24px' }}>
                Your payment window has expired. Please register again.
              </p>
              <DarkBtn onClick={() => navigate('/')} style={{ width: '100%' }}>Back to Events</DarkBtn>
            </div>
          </GradCard>
        )}

        {/* ── success ── */}
        {step === 'done' && (
          <GradCard style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: '#22c55e', fontFamily: FONT, margin: '0 0 8px' }}>Payment Successful!</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: FONT, fontSize: 14, margin: '0 0 8px' }}>
                {order?.eventName}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT, fontSize: 13, margin: '0 0 28px' }}>
                {order?.festName}
              </p>
              <DarkBtn onClick={() => navigate('/dashboard?tab=registrations')} style={{ width: '100%' }}>
                View My Registrations
              </DarkBtn>
            </div>
          </GradCard>
        )}

        {/* ── failed ── */}
        {step === 'failed' && (
          <GradCard style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
              <h2 style={{ color: '#ef4444', fontFamily: FONT, margin: '0 0 12px' }}>Payment Failed</h2>
              <DarkBtn onClick={() => navigate('/')} style={{ width: '100%' }}>Back to Events</DarkBtn>
            </div>
          </GradCard>
        )}

        {/* ── summary ── */}
        {(step === 'summary' || step === 'upi') && order && (
          <div style={{
            background: '#1a1a1a',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg,#e879f9,#67e8f9) 1',
            borderRadius: 20,
            width: '100%', maxWidth: 480,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(103,232,249,0.1)',
          }}>

            {/* ── Razorpay header ── */}
            <div style={{
              background: 'linear-gradient(135deg,#6d28d9,#0891b2)',
              padding: '18px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: FONT }}>
                  {order.festName}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: FONT }}>
                  {order.eventName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 22, fontFamily: FONT }}>
                  ₹{order.amount}
                </div>
                {/* countdown */}
                <div style={{
                  color: seconds < 60 ? '#ef4444' : '#22c55e',
                  fontSize: 13, fontFamily: FONT, fontWeight: 600,
                }}>
                  ⏱ {fmt(seconds)}
                </div>
              </div>
            </div>

            {step === 'summary' && (
              <div style={{ padding: '24px 24px' }}>
                {/* warning */}
                <div style={{
                  background: 'rgba(234,179,8,0.12)',
                  border: '1px solid rgba(234,179,8,0.3)',
                  borderRadius: 10, padding: '10px 16px',
                  fontSize: 13, color: '#eab308', fontFamily: FONT,
                  marginBottom: 20, lineHeight: 1.5,
                }}>
                  ⚠ Once payment is done, registration cannot be cancelled.
                </div>

                {/* order details */}
                <div style={{ marginBottom: 20 }}>
                  {[
                    ['Order ID',  order.orderId],
                    ['Amount',    `₹${order.amount}`],
                    ['Expires',   new Date(order.orderExpiresAt).toLocaleTimeString()],
                  ].map(([k, v]) => (
                    <div key={k} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: FONT,
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{k}</span>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* pay options */}
                <button onClick={goToUpi} style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#6d28d9,#0891b2)',
                  border: 'none', color: '#fff', fontSize: 15,
                  fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                  marginBottom: 10, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Pay with UPI
                </button>

                <button onClick={handleCancel} disabled={processing} style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 14,
                  cursor: 'pointer', fontFamily: FONT,
                }}>Cancel Payment</button>
              </div>
            )}

            {step === 'upi' && (
              <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                {/* fake QR */}
                <div style={{
                  width: 180, height: 180, margin: '0 auto 20px',
                  background: '#fff', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                }}>
                  {/* QR grid simulation */}
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    {Array.from({ length: 14 }).map((_, r) =>
                      Array.from({ length: 14 }).map((__, c) => {
                        const on = ((r + c) % 3 !== 0) && ((r * c) % 5 !== 0);
                        return on ? <rect key={`${r}-${c}`} x={c*10} y={r*10} width="9" height="9" fill="#000" rx="1"/> : null;
                      })
                    )}
                    {/* center logo placeholder */}
                    <rect x="55" y="55" width="30" height="30" fill="#fff" rx="4"/>
                    <text x="70" y="74" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6d28d9">₹</text>
                  </svg>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: FONT, fontSize: 13, margin: '0 0 4px' }}>
                  Scan with any UPI app
                </p>
                <p style={{ color: '#fff', fontFamily: FONT, fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>
                  ₹{order.amount}
                </p>

                <p style={{ color: seconds < 60 ? '#ef4444' : '#22c55e', fontFamily: FONT, fontSize: 14, margin: '0 0 20px' }}>
                  ⏱ {fmt(seconds)} remaining
                </p>

                {/* simulate paid */}
                <button onClick={handleConfirm} disabled={processing} style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: '#22c55e', border: 'none',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: FONT, marginBottom: 10,
                  opacity: processing ? 0.7 : 1,
                }}>
                  {processing ? 'Processing...' : '✓ I have paid'}
                </button>

                <button onClick={backFromUpi} style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 14,
                  cursor: 'pointer', fontFamily: FONT,
                }}>← Back</button>
              </div>
            )}
          </div>
        )}
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}
