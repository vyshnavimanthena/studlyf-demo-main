import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, ChevronLeft, Upload, Edit3, X, LayoutTemplate } from 'lucide-react';
import { CERT_TEMPLATES, CertData } from './CertTemplates';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { CanvaEditor } from './canva-editor';

// Helper for file upload – converts to base64 data URI client-side
const uploadFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Validated Date Field for DD-MM-YYYY
const ValidatedDateField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Invalid date (Use DD-MM-YYYY)");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, ''); // Numeric only

    // Basic split
    const d = raw.substring(0, 2);
    const m = raw.substring(2, 4);
    const y = raw.substring(4, 8);

    // Build formatted string
    let formatted = d;
    if (m.length > 0) formatted += '-' + m;
    if (y.length > 0) formatted += '-' + y;

    onChange(formatted);

    // Real-time Validation
    let isValid = true;
    let msg = "Invalid date (Use DD-MM-YYYY)";

    if (d && (parseInt(d) < 1 || parseInt(d) > 31)) {
      isValid = false;
      msg = "Day must be 01-31";
    } else if (m && (parseInt(m) < 1 || parseInt(m) > 12)) {
      isValid = false;
      msg = "Month must be 01-12";
    } else if (raw.length === 8) {
      const fullRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])\d{4}$/;
      if (!fullRegex.test(raw)) {
        isValid = false;
        msg = "Invalid date format";
      }
    }

    setError(!isValid && raw.length > 0);
    setErrorMessage(msg);
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <input
        value={value}
        onChange={handleInput}
        placeholder="DD-MM-YYYY"
        maxLength={10}
        className={`w-full px-3 py-2.5 bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-100'} rounded-xl text-sm font-medium focus:outline-none focus:border-[#6C3BFF] transition-all`} />
      {error && <p className="text-[9px] text-red-500 font-bold">{errorMessage}</p>}
    </div>
  );
};

const DEFAULT: CertData = {
  certType: 'Certificate of Participation',
  institutionName: '',
  eventName: '',
  bodyText: 'for participating in the National Hackathon',
  duration: '',
  venue: '',
  teamIdLabel: '',
  themeLabel: '',
  institutionLogo: '',
  eventLogo: '',
  sponsorLogos: [''],
  showSponsorSection: true,
  signatories: [{ name: '', title: '', org: '' }],
};

const Field = ({ label, value, onChange, placeholder, onFileChange }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; onFileChange?: (f: File) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {onFileChange && (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] text-[#6C3BFF] flex items-center gap-1 hover:underline">
            <Upload size={10} /> Upload
          </button>
        )}
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#6C3BFF] transition-all" />
      {onFileChange && <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && onFileChange(e.target.files[0])} />}
    </div>
  );
};
// ... rest of the file ...

const buildHtmlContent = (data: CertData, templateLabel?: string) => {
  if (data.customHtml) {
    return data.customHtml;
  }

  const signatoryHtml = data.signatories.length > 0
    ? data.signatories.map((s, index) => `
        <div class="signatory">
          <div class="line"></div>
          <div class="name">${s.name || `Signatory ${index + 1}`}</div>
          <div class="title">${s.title || ''}</div>
          <div class="org">${s.org || ''}</div>
        </div>
      `).join('')
    : '';

  if (data.customBackground) {
    return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Poppins', sans-serif; }
    .bg-cert { width: 100%; height: 100vh; min-height: 600px; position: relative; overflow: hidden; background-color: #fff; background-image: url('${data.customBackground}'); background-size: cover; background-position: center; background-repeat: no-repeat; }
    .content { position: relative; z-index: 2; padding: 60px 48px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .cert-type { font-size: 38px; font-weight: 900; color: #0F172A; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; text-shadow: 0 2px 10px rgba(255,255,255,0.8); }
    .subtitle { font-size: 14px; color: #334155; margin-bottom: 12px; text-shadow: 0 2px 10px rgba(255,255,255,0.8); }
    .recipient { font-size: 36px; font-weight: 800; color: #0F172A; padding: 10px 40px; border-bottom: 3px solid #0F172A; margin: 0 auto 24px; background-color: rgba(255,255,255,0.6); border-radius: 12px; }
    .body-text { font-size: 16px; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: rgba(255,255,255,0.6); padding: 16px 24px; border-radius: 12px; }
    .signatures { display: flex; justify-content: space-around; width: 100%; margin-top: auto; padding-top: 40px; }
    .signatory { text-align: center; background-color: rgba(255,255,255,0.6); padding: 8px 16px; border-radius: 8px; }
    .line { height: 30px; border-bottom: 2px solid #0F172A; margin: 0 auto 8px; width: 140px; }
    .name { font-size: 13px; font-weight: 800; color: #0F172A; }
    .title { font-size: 10px; color: #334155; }
  </style>
</head>
<body>
  <div class="bg-cert">
    <div class="content">
      <div class="cert-type">${data.certType.toUpperCase()}</div>
      <div class="subtitle">Proudly presented to</div>
      <div class="recipient">{student_name}</div>
      <div class="body-text">
        ${data.bodyText} <strong style="color: #0F172A">{course_title}</strong>
        ${data.duration ? `<span> during ${data.duration}</span>` : ''}
      </div>
      <div class="signatures">${signatoryHtml}</div>
    </div>
  </div>
</body>
</html>`;
  }

  const sponsorHtml = data.showSponsorSection && data.sponsorLogos.filter(Boolean).length > 0
    ? `<div class="sponsors">${data.sponsorLogos.filter(Boolean).map((logo) => `<img src="${logo}" alt="Sponsor" />`).join('')}</div>`
    : '';

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; font-family: 'Poppins', sans-serif; background: #f8fafc; }
    .certificate { max-width: 1100px; margin: 0 auto; background: #fff; border: 8px solid #6C3BFF; border-radius: 24px; padding: 36px 44px; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .title { text-align: center; flex: 1; }
    .institution { text-transform: uppercase; letter-spacing: 2px; font-family: 'Poppins', sans-serif; font-size: 14px; color: #6C3BFF; font-weight: 800; }
    .template { text-transform: uppercase; letter-spacing: 4px; font-family: 'Poppins', sans-serif; font-size: 11px; color: #94A3B8; margin-top: 4px; }
    .heading { margin-top: 26px; text-align: center; font-size: 44px; font-weight: 900; letter-spacing: 4px; color: #0f172a; }
    .cert-type { text-align: center; font-size: 18px; font-family: 'Poppins', sans-serif; font-weight: 800; color: #6C3BFF; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
    .recipient { margin: 24px auto 12px; width: fit-content; padding: 0 36px; border-bottom: 2px solid #0f172a; font-size: 32px; font-weight: 700; font-style: italic; color: #0f172a; text-align: center; }
    .body { text-align: center; font-family: 'Poppins', sans-serif; font-size: 15px; line-height: 1.8; color: #334155; max-width: 760px; margin: 18px auto 0; }
    .meta { display: flex; justify-content: center; gap: 28px; margin-top: 16px; font-family: 'Poppins', sans-serif; font-size: 13px; color: #475569; }
    .signatures { display: flex; justify-content: space-around; gap: 24px; margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .signatory { text-align: center; font-family: 'Poppins', sans-serif; min-width: 180px; }
    .line { height: 26px; border-bottom: 1.5px solid #6C3BFF; margin: 0 auto 6px; width: 120px; }
    .name { font-size: 13px; font-weight: 800; color: #0f172a; }
    .title, .org { font-size: 11px; color: #64748b; }
    .sponsors { margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .sponsors img { height: 28px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="top">
      ${data.institutionLogo
      ? `<img src="${data.institutionLogo}" alt="Institution Logo" style="width:96px;height:96px;object-fit:contain;border-radius:16px;" />`
      : `<div style="width:96px;height:96px;border:2px dashed #CBD5E1;border-radius:16px;display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-size:10px;font-weight:800;color:#94A3B8;">INST</div>`
    }
      <div class="title">
        <div class="institution">${data.institutionName || 'Institution Name'}</div>
        <div class="template">${templateLabel || data.certType || 'Certificate Template'}</div>
      </div>
      ${data.eventLogo
      ? `<img src="${data.eventLogo}" alt="Event Logo" style="width:96px;height:96px;object-fit:contain;border-radius:16px;" />`
      : `<div style="width:96px;height:96px;border:2px dashed #CBD5E1;border-radius:16px;display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-size:10px;font-weight:800;color:#94A3B8;">EVENT</div>`
    }
    </div>
    <div class="heading">CERTIFICATE</div>
    <div class="cert-type">${data.certType || 'Certificate of Participation'}</div>
    <div class="recipient">{student_name}</div>
    <div class="body">
      ${data.bodyText || 'for participating in'} <strong>{course_title}</strong>
      ${data.duration ? ` during <strong>${data.duration}</strong>` : ''}
      ${data.venue ? ` at <strong>${data.venue}</strong>` : ''}.
    </div>
    ${(data.teamIdLabel || data.themeLabel) ? `<div class="meta">${data.teamIdLabel ? `<span><b>Team ID:</b> ${data.teamIdLabel}</span>` : ''}${data.themeLabel ? `<span><b>Theme:</b> ${data.themeLabel}</span>` : ''}</div>` : ''}
    <div class="signatures">${signatoryHtml}</div>
    ${sponsorHtml}
  </div>
</body>
</html>`;
};

interface SavedTemplate {
  template_id: string;
  name: string;
  description?: string;
  html_content?: string;
  cert_data?: CertData;
  created_at?: string;
}
const CertificateTemplateBuilder: React.FC<{ institutionId: string; onSave?: (data: CertData, templateId: string) => void }> = ({ institutionId, onSave }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState<CertData>(DEFAULT);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [showCanva, setShowCanva] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState('');
  const [newHtmlName, setNewHtmlName] = useState('');
  const [newHtmlCode, setNewHtmlCode] = useState('');
  const [loadingSaved, setLoadingSaved] = useState(true);

  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSavedTemplates();
  }, []);

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setNewHtmlCode(text);
          if (!newHtmlName) {
            setNewHtmlName(file.name.replace(/\.[^/.]+$/, ""));
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateCustomTemplate = async () => {
    if (!newHtmlName.trim()) {
      alert("Please enter a Template Name.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: newHtmlName.trim(),
        description: "Custom HTML template created from scratch",
        html_content: newHtmlCode || `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Poppins', sans-serif; text-align: center; padding: 50px; background: #f8fafc; margin: 0; }
    .card { background: white; padding: 60px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: inline-block; border: 8px solid #6C3BFF; max-width: 900px; width: 100%; }
    h1 { color: #6C3BFF; font-size: 36px; margin-bottom: 20px; }
    .name { font-size: 28px; font-weight: bold; border-bottom: 2px solid #0f172a; width: fit-content; margin: 20px auto; padding: 0 30px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>CERTIFICATE OF ACHIEVEMENT</h1>
    <p>This is proudly presented to</p>
    <div class="name">{student_name}</div>
    <p>for participating in <strong>{course_title}</strong>.</p>
    <p style="font-size:12px; color:#94a3b8; margin-top:40px;">Certificate ID: {certificate_id}</p>
  </div>
</body>
</html>`,
        cert_data: {
          certType: 'Custom HTML Template',
          institutionName: '',
          eventName: '',
          bodyText: '',
          duration: '',
          venue: '',
          teamIdLabel: '',
          themeLabel: '',
          institutionLogo: '',
          eventLogo: '',
          sponsorLogos: [''],
          showSponsorSection: false,
          signatories: [],
          customHtml: newHtmlCode || `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Poppins', sans-serif; text-align: center; padding: 50px; background: #f8fafc; margin: 0; }
    .card { background: white; padding: 60px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: inline-block; border: 8px solid #6C3BFF; max-width: 900px; width: 100%; }
    h1 { color: #6C3BFF; font-size: 36px; margin-bottom: 20px; }
    .name { font-size: 28px; font-weight: bold; border-bottom: 2px solid #0f172a; width: fit-content; margin: 20px auto; padding: 0 30px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>CERTIFICATE OF ACHIEVEMENT</h1>
    <p>This is proudly presented to</p>
    <div class="name">{student_name}</div>
    <p>for participating in <strong>{course_title}</strong>.</p>
    <p style="font-size:12px; color:#94a3b8; margin-top:40px;">Certificate ID: {certificate_id}</p>
  </div>
</body>
</html>`
        },
      };
      const response = await fetch(`${API_BASE_URL}/api/v1/institution/certificates/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to create template' }));
        alert(err.detail || 'Failed to create template');
        setSaving(false);
        return;
      }
      const saved = await response.json();
      if (saved?.template_id) {
        setSavedTemplateId(saved.template_id);
        setSelectedId('custom_html');
        setData(body.cert_data);
        setCustomTemplateName(body.name);
      }
      alert('Custom template created successfully!');
      setNewHtmlName('');
      setNewHtmlCode('');
      await fetchSavedTemplates();
    } catch (e) { alert('Failed to create template. Check your connection.'); }
    setSaving(false);
  };

  const fetchSavedTemplates = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/institution/certificates/templates`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const list: SavedTemplate[] = await res.json();
        setSavedTemplates(list.filter(t => t.cert_data));
      } else {
        const err = await res.json().catch(() => ({ detail: 'Failed to load templates' }));
        alert('Could not load saved templates: ' + (err.detail || 'Server error'));
      }
    } catch (e) { alert('Could not load saved templates. Check your connection.'); }
    setLoadingSaved(false);
  };

  const set = (patch: Partial<CertData>) => setData(d => ({ ...d, ...patch }));
  const addSig = () => set({ signatories: [...data.signatories, { name: '', title: '', org: '' }] });
  const removeSig = (i: number) => set({ signatories: data.signatories.filter((_, x) => x !== i) });
  const setSig = (i: number, patch: Partial<CertData['signatories'][0]>) =>
    set({ signatories: data.signatories.map((s, x) => x === i ? { ...s, ...patch } : s) });

  const handleSave = async () => {
    setSaving(true);
    try {
      const selected = CERT_TEMPLATES.find(t => t.id === selectedId);
      const body = {
        name: data.eventName || selected?.label || data.certType || 'Certificate Template',
        description: `${selected?.tag || 'Custom institution certificate template'}`,
        html_content: buildHtmlContent(data, selected?.label),
        cert_data: data,
      };
      const isUpdate = !!savedTemplateId;
      const url = isUpdate
        ? `${API_BASE_URL}/api/v1/institution/certificates/templates/${savedTemplateId}`
        : `${API_BASE_URL}/api/v1/institution/certificates/templates`;
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to save template' }));
        alert(err.detail || 'Failed to save template');
        setSaving(false);
        return;
      }
      const saved = await response.json();
      const tid = String(saved?.template_id || savedTemplateId || '');
      if (tid) setSavedTemplateId(tid);
      await fetchSavedTemplates();
    } catch (e) { alert('Failed to save template. Check your connection and try again.'); }
    setSaving(false);
  };

  const openSavedTemplate = (st: SavedTemplate) => {
    if (st.cert_data) {
      setData(st.cert_data);
      setSavedTemplateId(st.template_id);
      // Find matching preset template from CERT_TEMPLATES
      const match = CERT_TEMPLATES.find(t => t.label === st.cert_data?.certType);
      setSelectedId(match?.id || null);
    }
  };

  const createNewTemplate = () => {
    setData(DEFAULT);
    setSavedTemplateId(null);
    setSelectedId(null);
  };

  const selected = CERT_TEMPLATES.find(t => t.id === selectedId);
  const PreviewComp = selected?.component;
  const savedTemplateName = savedTemplateId
    ? savedTemplates.find(st => st.template_id === savedTemplateId)?.name
    : null;

  // ── Step 1: Template Gallery ─────────────────────────────────────
  if (!selectedId && !savedTemplateId && !showCanva) {
    const savedWithData = savedTemplates.filter(st => st.cert_data);
    return (
      <div className="space-y-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose a Certificate Style</h2>
            <p className="text-slate-500 text-sm mt-1">Pick a preset template, build one from scratch, or open a previously saved one.</p>
          </div>
          <button 
            onClick={() => {
              createNewTemplate();
              setShowCanva(true);
            }} 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C3BFF] to-[#3B82F6] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-[#6C3BFF]/20 hover:shadow-xl hover:shadow-[#6C3BFF]/30 transition-all hover:-translate-y-0.5"
          >
            <LayoutTemplate size={18} />
            Build with Canvas Editor
          </button>
        </div>

        {/* Saved Templates */}
        {savedWithData.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Saved Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedWithData.map(st => {
                const eventName = st.cert_data?.eventName || st.name;
                const instName = st.cert_data?.institutionName || '';
                return (
                  <div key={st.template_id}
                    className="group text-left bg-white rounded-[1.5rem] border-2 border-slate-100 hover:border-[#6C3BFF] shadow-sm hover:shadow-lg transition-all overflow-hidden relative">
                    <button onClick={() => openSavedTemplate(st)}
                      className="w-full text-left">
                      <div className="px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/10 flex items-center justify-center flex-shrink-0">
                          <Edit3 size={18} className="text-[#6C3BFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 text-sm truncate">{eventName || 'Untitled Template'}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate">{instName || st.description || 'Saved template'}</p>
                        </div>
                        <div className="w-7 h-7 rounded-full border-2 border-slate-100 group-hover:border-[#6C3BFF] group-hover:bg-[#6C3BFF] flex items-center justify-center transition-all flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`Delete template "${eventName}"?`)) return;
                        try {
                          const res = await fetch(`${API_BASE_URL}/api/v1/institution/certificates/templates/${st.template_id}`, {
                            method: 'DELETE',
                            headers: authHeaders(),
                          });
                          if (res.ok) {
                            fetchSavedTemplates();
                          } else {
                            const err = await res.json().catch(() => ({ detail: 'Delete failed' }));
                            alert(err.detail || 'Failed to delete template');
                          }
                        } catch (e) {
                          alert('Failed to delete template. Check your connection.');
                        }
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete template"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preset Templates */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Preset Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CERT_TEMPLATES.map(t => {
              const Preview = t.component;
              return (
                <button key={t.id} onClick={() => { setSelectedId(t.id); setSavedTemplateId(null); }}
                  className="group text-left bg-white rounded-[2rem] border-2 border-slate-100 hover:border-[#6C3BFF] shadow-sm hover:shadow-xl transition-all overflow-hidden">
                  <div className="relative bg-slate-50 overflow-hidden" style={{ height: 220 }}>
                    <div className="absolute inset-0 p-4" style={{ pointerEvents: 'none' }}>
                      {Preview ? (
                        <div style={{ transform: 'scale(0.52)', transformOrigin: 'top left', width: '192%', height: '192%' }}>
                          <Preview data={{ ...DEFAULT, certType: t.label, eventName: 'Sample Hackathon', institutionName: 'Your Institution', duration: '1st-2nd Jan 2025', signatories: [{ name: 'Dr. A. Kumar', title: 'Principal', org: 'Institution' }, { name: 'Prof. B. Singh', title: 'Director', org: 'Dept.' }] }} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-4 border-dashed border-slate-200 rounded-3xl bg-white group-hover:border-[#6C3BFF]/30 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#6C3BFF]/5 group-hover:text-[#6C3BFF] transition-all">
                            <Plus size={24} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest group-hover:text-[#6C3BFF]">Custom HTML</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-[#6C3BFF]/0 group-hover:bg-[#6C3BFF]/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-[#6C3BFF] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg">Use This Template</span>
                    </div>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{t.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.tag}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-slate-100 group-hover:border-[#6C3BFF] group-hover:bg-[#6C3BFF] flex items-center justify-center transition-all">
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-white transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (showCanva) {
    return <CanvaEditor data={data} onChange={set} onClose={() => setShowCanva(false)} onSave={handleSave} />;
  }

  // ── Step 2: Customise ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={createNewTemplate} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#6C3BFF] uppercase tracking-widest transition-all">
            <ChevronLeft size={16} /> All Templates
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h2 className="text-xl font-black text-slate-900">{selected?.label || savedTemplateName || 'Custom Template'}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{savedTemplateId ? 'Editing saved template' : (selected?.tag || '')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#6C3BFF] transition-all">
            {showPreview ? <><EyeOff size={14} /> Edit</> : <><Eye size={14} /> Preview</>}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6C3BFF] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#5B2EE0] transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving…' : (savedTemplateId ? 'Update Template' : 'Save Template')}
          </button>
        </div>
      </div>

      {showPreview ? (
        PreviewComp ? (
          <div className="max-w-3xl mx-auto"><PreviewComp data={data} /></div>
        ) : (
          <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="w-full overflow-hidden rounded-xl" style={{ height: 380 }}>
              <div style={{ transform: 'scale(0.65)', transformOrigin: 'top left', width: '153%' }}>
                <div dangerouslySetInnerHTML={{
                  __html: buildHtmlContent(data, selected?.label)
                    .replace(/\{student_name\}/g, 'Recipient Name')
                    .replace(/\{course_title\}/g, data.eventName || 'Event')
                }} />
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-5 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            {selectedId === 'custom_bg' && (
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#6C3BFF] uppercase tracking-widest">Background Image (PDF/Image)</label>
                  <button type="button" onClick={() => document.getElementById('bg-upload-input')?.click()} className="text-[10px] text-slate-500 font-bold hover:text-[#6C3BFF] hover:underline flex items-center gap-1">
                    <Upload size={12} /> Upload File
                  </button>
                  <input id="bg-upload-input" type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await uploadFile(f);
                      set({ customBackground: url });
                    }}
                  />
                </div>
                {data.customBackground ? (
                  <div className="w-full h-32 rounded-xl border border-slate-200 overflow-hidden relative">
                    <img src={data.customBackground} alt="Background Preview" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-black text-slate-900 bg-white/80 px-4 py-2 rounded-lg">Background Uploaded</span>
                    </div>
                    <button type="button" onClick={() => set({ customBackground: '' })} className="absolute top-2 right-2 p-1.5 bg-white rounded-md shadow-sm text-red-500 hover:text-red-700">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50">
                    <p className="text-xs font-medium text-slate-400">No background uploaded</p>
                    <button type="button" onClick={() => document.getElementById('bg-upload-input')?.click()} className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#6C3BFF]">Upload Image</button>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 font-medium">Upload a blank certificate design as an image. The system will overlay recipient names, event details, and signatures on top of it automatically.</p>
              </div>
            )}
            
            {selectedId === 'custom_html' && (
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#6C3BFF] uppercase tracking-widest">Custom HTML Code</label>
                  <button type="button" onClick={() => htmlFileInputRef.current?.click()} className="text-[10px] text-slate-500 font-bold hover:text-[#6C3BFF] hover:underline flex items-center gap-1">
                    <Upload size={12} /> Upload File
                  </button>
                  <input type="file" ref={htmlFileInputRef} accept=".html,.txt" className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const text = await f.text();
                      set({ customHtml: text });
                    }}
                  />
                </div>
                <textarea
                  value={data.customHtml || ''}
                  onChange={e => set({ customHtml: e.target.value })}
                  placeholder="Paste your custom HTML code here... Use {student_name}, {course_title}, {date} placeholders."
                  className="w-full h-[220px] font-mono p-4 bg-slate-900 text-green-400 border-none rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6C3BFF] placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-400 font-medium">Use placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded text-[#6C3BFF]">{'{student_name}'}</code> <code className="bg-slate-100 px-1 py-0.5 rounded text-[#6C3BFF]">{'{course_title}'}</code>. Fill out the fields below to customize the design.</p>
              </div>
            )}
            <Field label="Institution Name" value={data.institutionName} onChange={v => set({ institutionName: v })} placeholder="e.g. Rajkiya Engineering College" />
            <Field label="Event / Hackathon Name" value={data.eventName} onChange={v => set({ eventName: v })} placeholder="e.g. Tekno'19 Hackathon" />
            <Field label="Body Text" value={data.bodyText} onChange={v => set({ bodyText: v })} placeholder="for participating in..." />
            <div className="grid grid-cols-2 gap-3">
              <ValidatedDateField label="Duration / Dates" value={data.duration} onChange={v => set({ duration: v })} />
              <Field label="Venue / Location" value={data.venue} onChange={v => set({ venue: v })} placeholder="e.g. College Name, City" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Institution Logo" value={data.institutionLogo} onChange={v => set({ institutionLogo: v })} placeholder="https://..." onFileChange={f => uploadFile(f).then(u => set({ institutionLogo: u }))} />
              <Field label="Event Logo" value={data.eventLogo} onChange={v => set({ eventLogo: v })} placeholder="https://..." onFileChange={f => uploadFile(f).then(u => set({ eventLogo: u }))} />
            </div>

            {/* Sponsor logos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sponsor Logos</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                    <input type="checkbox" checked={data.showSponsorSection} onChange={e => set({ showSponsorSection: e.target.checked })} /> Show
                  </label>
                  {data.sponsorLogos.length < 5 && (
                    <button onClick={() => set({ sponsorLogos: [...data.sponsorLogos, ''] })} className="flex items-center gap-1 text-[10px] font-black text-[#6C3BFF] hover:underline">
                      <Plus size={10} /> Add
                    </button>
                  )}
                </div>
              </div>
              {data.sponsorLogos.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input value={url} onChange={e => set({ sponsorLogos: data.sponsorLogos.map((s, x) => x === i ? e.target.value : s) })}
                    placeholder={`Sponsor ${i + 1} logo URL`}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#6C3BFF]" />
                  <button type="button" onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e: any) => {
                      const f = e.target.files[0];
                      if (f) { const url = await uploadFile(f); set({ sponsorLogos: data.sponsorLogos.map((s, x) => x === i ? url : s) }); }
                    };
                    input.click();
                  }} className="text-[#6C3BFF]"><Upload size={16} /></button>
                  {data.sponsorLogos.length > 1 && (
                    <button onClick={() => set({ sponsorLogos: data.sponsorLogos.filter((_, x) => x !== i) })} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>

            {/* Signatories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signatories</label>
                {data.signatories.length < 3 && (
                  <button onClick={addSig} className="flex items-center gap-1 text-[10px] font-black text-[#6C3BFF] hover:underline"><Plus size={10} /> Add</button>
                )}
              </div>
              {data.signatories.map((s, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2 relative">
                  {data.signatories.length > 1 && (
                    <button onClick={() => removeSig(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                  )}
                  <input value={s.name} onChange={e => setSig(i, { name: e.target.value })} placeholder="Full Name"
                    className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#6C3BFF]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={s.title} onChange={e => setSig(i, { title: e.target.value })} placeholder="Title (e.g. Principal)"
                      className="px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#6C3BFF]" />
                    <input value={s.org} onChange={e => setSig(i, { org: e.target.value })} placeholder="Organization"
                      className="px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#6C3BFF]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</p>
            {PreviewComp ? (
              <div style={{ transform: 'scale(0.65)', transformOrigin: 'top left', width: '153%', height: 'auto' }}>
                <PreviewComp data={data} />
              </div>
            ) : (
              <div className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm" style={{ height: 420 }}>
                <div style={{ transform: 'scale(0.65)', transformOrigin: 'top left', width: '153%' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: buildHtmlContent(data, selected?.label)
                      .replace(/\{student_name\}/g, 'Recipient Name')
                      .replace(/\{course_title\}/g, data.eventName || 'Event')
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplateBuilder;

