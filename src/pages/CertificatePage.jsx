import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { certAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { GreenBg, DarkBtn, Toast, FONT, HomeBtn } from '../components/UI';

const PLACEHOLDERS = [
  '{{student_name}}', '{{roll_number}}', '{{branch}}', '{{college_name}}',
  '{{event_name}}', '{{fest_name}}', '{{organizer_name}}', '{{date}}',
  '{{year}}', '{{certificate_id}}',
];

const PLACEHOLDER_LABELS = {
  '{{student_name}}':   'Student Name',
  '{{roll_number}}':    'Roll Number',
  '{{branch}}':         'Branch',
  '{{college_name}}':   'College',
  '{{event_name}}':     'Event',
  '{{fest_name}}':      'Fest',
  '{{organizer_name}}': 'Organizer',
  '{{date}}':           'Date',
  '{{year}}':           'Year',
  '{{certificate_id}}': 'Cert ID',
};

const FONTS = ['TIMES_BOLD', 'HELVETICA', 'COURIER', 'TIMES_ROMAN'];

const CHIP_COLORS = {
  '{{student_name}}':   '#e879f9',
  '{{roll_number}}':    '#67e8f9',
  '{{branch}}':         '#22c55e',
  '{{college_name}}':   '#f59e0b',
  '{{event_name}}':     '#3b82f6',
  '{{fest_name}}':      '#ec4899',
  '{{organizer_name}}': '#8b5cf6',
  '{{date}}':           '#14b8a6',
  '{{year}}':           '#f97316',
  '{{certificate_id}}': '#6366f1',
};

export default function CertificatePage() {
  const { festId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [searchParams] = useSearchParams();

  // ✅ FIX: Use navigate(-1) to always go back to wherever we came from
  // This preserves ALL query params (eventId, eventName, eventData) automatically
  // Fallback to participants page if there's no history
  const goBack = () => navigate(-1);

  const [file, setFile]             = useState(null);
  const [scope, setScope]           = useState('FEST');
  const [eventId, setEventId]       = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);

  const [pdfDims, setPdfDims]       = useState({ width: 0, height: 0 });
  const canvasRef                   = useRef(null);
  const containerRef                = useRef(null);

  const [placedFields, setPlacedFields]     = useState([]);
  const [dragover, setDragover]             = useState(false);
  const [draggingChip, setDraggingChip]     = useState(null);
  const [draggingMarker, setDraggingMarker] = useState(null);
  const [selectedField, setSelectedField]   = useState(null);
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

  const renderPDF = useCallback(async (url) => {
  if (!window.pdfjsLib) {
    setTimeout(() => renderPDF(url), 500);
    return;
  }
  try {
    const doc = await window.pdfjsLib.getDocument(url).promise;
    const page = await doc.getPage(1);
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // FIXED: Perfect 1:1 pixel mapping
    const baseViewport = page.getViewport({ scale: 1.0 });
    setPdfDims({ width: baseViewport.width, height: baseViewport.height });
    
    // FIXED: High-DPI + Max container size (800px wide)
    const containerWidth = Math.min(800, container.offsetWidth - 40);
    const scale = containerWidth / baseViewport.width;
    const outputScale = window.devicePixelRatio || 2;
    const renderViewport = page.getViewport({ scale: scale * outputScale });
    
    // FIXED: Crisp rendering context
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;  // CRISP!
    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;
    canvas.style.width = `${baseViewport.width * scale}px`;
    canvas.style.height = `${baseViewport.height * scale}px`;
    canvas.style.imageRendering = 'pixelated';
    
    await page.render({
      canvasContext: ctx,
      viewport: renderViewport,
    }).promise;
  } catch (e) { console.error('PDF render error', e); }
}, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setToast({ msg: 'Only PDF files allowed', type: 'error' }); return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) { setToast({ msg: 'Please select a PDF', type: 'error' }); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('festId', festId);
    fd.append('scope', scope);
    if (scope === 'EVENT' && eventId) fd.append('eventId', eventId);
    try {
      const res = await certAPI.upload(fd);
      const tid = res.data.data?.templateId || res.data.data?.id;
      setTemplateId(tid);
      const url = URL.createObjectURL(file);
      setStep(2);
      setTimeout(() => renderPDF(url), 300);
      setToast({ msg: 'Uploaded! Now drag fields onto the certificate.', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Upload failed', type: 'error' });
    } finally { setLoading(false); }
  };

  const onChipDragStart = (e, placeholder) => {
    setDraggingChip(placeholder);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('placeholder', placeholder);
  };

  const onCanvasDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const placeholder = e.dataTransfer.getData('placeholder');
    if (!placeholder) return;
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const x_pct  = (e.clientX - rect.left)  / rect.width;
    const y_pct  = (e.clientY - rect.top)   / rect.height;
    if (placedFields.find(f => f.placeholder === placeholder)) {
      setToast({ msg: `${PLACEHOLDER_LABELS[placeholder]} already placed — drag the marker to reposition`, type: 'warning' });
      return;
    }
    setPlacedFields(prev => [...prev, {
      id: Date.now(), placeholder, x_pct, y_pct,
      fontSize: 36, fontName: 'TIMES_BOLD', color: '#000000',
    }]);
    setDraggingChip(null);
  };

  const onMarkerMouseDown = (e, field) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedField(field.id);
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - field.x_pct * rect.width;
    const offsetY = e.clientY - rect.top  - field.y_pct * rect.height;
    setDraggingMarker({ id: field.id, offsetX, offsetY });
  };

  useEffect(() => {
    if (!draggingMarker) return;
    const onMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x_pct = Math.max(0, Math.min(1, (e.clientX - rect.left - draggingMarker.offsetX) / rect.width));
      const y_pct = Math.max(0, Math.min(1, (e.clientY - rect.top  - draggingMarker.offsetY) / rect.height));
      setPlacedFields(prev => prev.map(f => f.id === draggingMarker.id ? { ...f, x_pct, y_pct } : f));
    };
    const onUp = () => setDraggingMarker(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [draggingMarker]);

  const removeField = (id) => {
    setPlacedFields(prev => prev.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const updateField = (id, key, val) => {
    setPlacedFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const saveMappings = async () => {
  if (!placedFields.length) { setToast({ msg: 'Place at least one field on the certificate', type: 'error' }); return; }
  setSaving(true);
  try {
    const mappings = placedFields.map(f => ({
      placeholder: f.placeholder,
      x:           parseFloat((f.x_pct * pdfDims.width).toFixed(2)),
      y:           parseFloat((f.y_pct * pdfDims.height).toFixed(2)),    // ← FIXED!
      fontSize:    f.fontSize,
      fontName:    f.fontName,
      color:       f.color,
    }));
    await certAPI.mapFields(templateId, mappings);
    setToast({ msg: 'Fields mapped successfully!', type: 'success' });
    setTimeout(() => goBack(), 1200);
  } catch (e) {
    setToast({ msg: e.response?.data?.message || 'Mapping failed', type: 'error' });
  } finally { setSaving(false); }
};

  const selectedFieldData = placedFields.find(f => f.id === selectedField);

  // ── STEP 1: UPLOAD ────────────────────────────────────────────────
  if (step === 1) return (
    <GreenBg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 0' }}>
        {/* ✅ FIX: navigate(-1) goes back to exact previous page with all params */}
       <button onClick={goBack} style={{
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
        <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 2 }}>
        </h1>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888' }} />
      </div>

      <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 28px' }}>
        <h2 style={{ fontFamily: FONT, color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
          Upload Certificate Template
        </h2>
        <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 32px' }}>
          Upload your PDF template. You'll visually drag and place fields in the next step.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {['FEST', 'EVENT'].map(s => (
            <button key={s} onClick={() => setScope(s)} style={{
              flex: 1, padding: '10px', borderRadius: 8, border: '1px solid',
              borderColor: scope === s ? '#67e8f9' : 'rgba(255,255,255,0.15)',
              background: scope === s ? 'rgba(103,232,249,0.1)' : 'transparent',
              color: scope === s ? '#67e8f9' : 'rgba(255,255,255,0.4)',
              fontSize: 13, cursor: 'pointer', fontFamily: FONT,
            }}>{s === 'FEST' ? '🎪 Fest-wide template' : '🎯 Event-specific'}</button>
          ))}
        </div>

        {scope === 'EVENT' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 5, display: 'block' }}>EVENT ID</label>
            <input value={eventId} onChange={e => setEventId(e.target.value)} type="number" placeholder="e.g. 2"
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: '#fff',
                fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
          border: `2px dashed ${file ? '#22c55e' : 'rgba(103,232,249,0.4)'}`,
          borderRadius: 14, padding: '40px 24px', cursor: 'pointer',
          background: file ? 'rgba(34,197,94,0.05)' : 'rgba(103,232,249,0.04)',
          transition: 'all 0.2s',
        }}>
          {file ? (
            <>
              <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontFamily: FONT, fontSize: 14, color: '#22c55e', fontWeight: 600 }}>{file.name}</span>
              <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Click to change</span>
            </>
          ) : (
            <>
              <svg width="36" height="36" fill="none" stroke="#67e8f9" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span style={{ fontFamily: FONT, fontSize: 14, color: '#67e8f9', fontWeight: 600 }}>Click or drop PDF here</span>
              <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>PDF only</span>
            </>
          )}
          <input type="file" accept="application/pdf" onChange={handleFile} style={{ display: 'none' }} />
        </label>

        <DarkBtn onClick={handleUpload} style={{ width: '100%', marginTop: 20 }} disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload & Place Fields →'}
        </DarkBtn>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );

  // ── STEP 2: DRAG & DROP MAPPER ────────────────────────────────────
  return (
    <GreenBg style={{ overflow: 'hidden' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* ✅ FIX: navigate(-1) goes back to exact previous page with all params */}
          <button onClick={goBack} style={{
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
          <span style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Step 2 — Drag fields onto the certificate
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {placedFields.length} field{placedFields.length !== 1 ? 's' : ''} placed
          </span>
          <DarkBtn onClick={saveMappings} disabled={saving || !placedFields.length} style={{ padding: '8px 24px', fontSize: 13 }}>
            {saving ? 'Saving...' : 'Save & Finish ✓'}
          </DarkBtn>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>

        {/* ── LEFT: PDF CANVAS ── */}
        <div style={{ flex: 1, overflow: 'auto', background: '#1a1a1a', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 20 }}>
          <div
            ref={containerRef}
            style={{
              position: 'relative', display: 'inline-block',
              border: dragover ? '2px dashed #67e8f9' : '2px solid rgba(255,255,255,0.1)',
              borderRadius: 4, transition: 'border-color 0.2s',
              cursor: draggingChip ? 'crosshair' : 'default',
              userSelect: 'none',
            }}
            onDragOver={e => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={onCanvasDrop}
          >
            <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />

            {dragover && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(103,232,249,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              }}>
                <span style={{ fontFamily: FONT, color: '#67e8f9', fontSize: 16, fontWeight: 700 }}>Drop here to place field</span>
              </div>
            )}

            {placedFields.map(field => (
              <FieldMarker
                key={field.id} field={field}
                selected={selectedField === field.id}
                onMouseDown={(e) => onMarkerMouseDown(e, field)}
                onClick={() => setSelectedField(field.id)}
                onRemove={() => removeField(field.id)}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div style={{
          width: 300, background: '#0d1f1a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1, margin: '0 0 12px' }}>
              DRAG FIELDS ONTO CERTIFICATE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {PLACEHOLDERS.map(p => {
                const placed = !!placedFields.find(f => f.placeholder === p);
                return (
                  <div key={p} draggable={!placed}
                    onDragStart={!placed ? (e) => onChipDragStart(e, p) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8,
                      background: placed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${placed ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: placed ? 'default' : 'grab',
                      opacity: placed ? 0.7 : 1,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!placed) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { if (!placed) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: CHIP_COLORS[p] }} />
                    <span style={{ fontFamily: FONT, fontSize: 12, color: placed ? '#22c55e' : '#ccc', flex: 1 }}>
                      {PLACEHOLDER_LABELS[p]}
                    </span>
                    {placed
                      ? <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>
                      : <svg width="11" height="11" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 9l4-4 4 4M9 5v14M19 15l-4 4-4-4M15 19V5"/>
                        </svg>
                    }
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {selectedFieldData ? (
              <>
                <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1, margin: '0 0 12px' }}>
                  FIELD PROPERTIES
                </p>
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: `${CHIP_COLORS[selectedFieldData.placeholder]}18`,
                  border: `1px solid ${CHIP_COLORS[selectedFieldData.placeholder]}44`,
                }}>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: '#fff', fontWeight: 600 }}>
                    {PLACEHOLDER_LABELS[selectedFieldData.placeholder]}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {selectedFieldData.placeholder}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, display: 'block', marginBottom: 5, letterSpacing: 0.5 }}>
                    FONT SIZE: {selectedFieldData.fontSize}px
                  </label>
                  <input type="range" min="12" max="96" value={selectedFieldData.fontSize}
                    onChange={e => updateField(selectedFieldData.id, 'fontSize', Number(e.target.value))}
                    style={{ width: '100%', accentColor: CHIP_COLORS[selectedFieldData.placeholder] }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>12</span>
                    <span style={{ fontFamily: FONT, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>96</span>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, display: 'block', marginBottom: 5, letterSpacing: 0.5 }}>FONT</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {FONTS.map(f => (
                      <button key={f} onClick={() => updateField(selectedFieldData.id, 'fontName', f)} style={{
                        padding: '4px 8px', borderRadius: 5, border: '1px solid',
                        borderColor: selectedFieldData.fontName === f ? '#67e8f9' : 'rgba(255,255,255,0.1)',
                        background: selectedFieldData.fontName === f ? 'rgba(103,232,249,0.1)' : 'transparent',
                        color: selectedFieldData.fontName === f ? '#67e8f9' : 'rgba(255,255,255,0.4)',
                        fontSize: 10, cursor: 'pointer', fontFamily: FONT,
                      }}>{f.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: FONT, display: 'block', marginBottom: 5, letterSpacing: 0.5 }}>TEXT COLOR</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="color" value={selectedFieldData.color}
                      onChange={e => updateField(selectedFieldData.id, 'color', e.target.value)}
                      style={{ width: 40, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{selectedFieldData.color}</span>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: 14,
                }}>
                  <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: 0.5 }}>PDF COORDINATES</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[['X', (selectedFieldData.x_pct * pdfDims.width).toFixed(1)],
                      ['Y', ((1 - selectedFieldData.y_pct) * pdfDims.height).toFixed(1)]].map(([label, val]) => (
                      <div key={label} style={{ flex: 1 }}>
                        <div style={{ fontFamily: FONT, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{label}</div>
                        <div style={{ fontFamily: FONT, fontSize: 15, color: '#fff', fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => removeField(selectedFieldData.id)} style={{
                  width: '100%', padding: '9px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444', fontSize: 13, cursor: 'pointer', fontFamily: FONT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                  Remove Field
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👆</div>
                <p style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.7 }}>
                  Drag a field from above onto the certificate preview, then click a placed marker to edit its size, font and color
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </GreenBg>
  );
}

function FieldMarker({ field, selected, onMouseDown, onClick, onRemove }) {
  const color = CHIP_COLORS[field.placeholder];
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${field.x_pct * 100}%`,
        top:  `${field.y_pct * 100}%`,
        transform: 'translate(-50%, -100%)',
        cursor: 'grab', zIndex: selected ? 20 : 10,
        userSelect: 'none',
      }}
    >
      <div style={{
        background: selected ? color : `${color}dd`,
        border: selected ? '2px solid #fff' : `1.5px solid ${color}`,
        borderRadius: 6, padding: '4px 10px',
        fontFamily: FONT, fontSize: 11, fontWeight: 700,
        color: '#000', whiteSpace: 'nowrap',
        boxShadow: selected ? `0 0 0 2px ${color}44, 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.15s',
      }}>
        {PLACEHOLDER_LABELS[field.placeholder]}
        {selected && (
          <span onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ cursor: 'pointer', opacity: 0.7, fontSize: 13 }}>✕</span>
        )}
      </div>
      <div style={{ width: 2, height: 10, background: color, margin: '0 auto' }} />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto', boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
}